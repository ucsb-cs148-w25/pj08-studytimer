import React, { useState, useEffect, useCallback } from 'react';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Fetch the user profile from Firestore's users collection.
// Returns null if the document doesn't exist.
const fetchUserProfile = async (firebaseId) => {
  const db = getFirestore();
  const userDocRef = doc(db, 'users', firebaseId);
  const userDocSnap = await getDoc(userDocRef);
  if (userDocSnap.exists()) {
    const data = userDocSnap.data();
    return {
      firebaseId,
      displayName: data.displayName || `User ${firebaseId.substring(0, 6)}`,
      photoURL: data.photoURL || 'https://via.placeholder.com/40'
    };
  } else {
    return null;
  }
};

const FriendRequestsMenu = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchedProfile, setSearchedProfile] = useState(null);
  const [searchStatus, setSearchStatus] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [notification, setNotification] = useState(null);

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const db = getFirestore();

  // Helper function to show a notification message that auto-clears after 3 seconds.
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Memoize fetchPendingRequests so that its reference remains stable.
  const fetchPendingRequests = useCallback(async () => {
    if (!currentUser) return;
    const pendingRequestsCol = collection(db, 'users', currentUser.uid, 'pendingRequests');
    const querySnapshot = await getDocs(pendingRequestsCol);
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({ firebaseId: doc.id, ...doc.data() });
    });
    setPendingRequests(requests);
  }, [currentUser, db]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  // Handle search for a friend profile by Firebase ID.
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchStatus('');
    setSearchedProfile(null);

    const trimmedInput = searchInput.trim();
    if (trimmedInput === '') return;

    // Prevent searching for your own ID.
    if (currentUser && trimmedInput === currentUser.uid) {
      setSearchStatus("Can't Send Request To Yourself");
      return;
    }

    const profile = await fetchUserProfile(trimmedInput);
    if (!profile) {
      setSearchStatus('User does not exist');
      return;
    }

    // Check if the searched user is already in your friends list.
    const friendDocRef = doc(db, 'users', currentUser.uid, 'friends', profile.firebaseId);
    const friendDocSnap = await getDoc(friendDocRef);
    if (friendDocSnap.exists()) {
      setSearchStatus('Already Friends');
      setSearchedProfile(profile);
      return;
    }

    // Check if a friend request has already been sent.
    const targetPendingRef = doc(db, 'users', profile.firebaseId, 'pendingRequests', currentUser.uid);
    const pendingDocSnap = await getDoc(targetPendingRef);
    if (pendingDocSnap.exists()) {
      setSearchStatus('Friend Request Already Sent');
      setSearchedProfile(profile);
      return;
    }

    // All checks passed: set the searched profile.
    setSearchedProfile(profile);
  };

  // Send a friend request by creating a document in the target user's "pendingRequests" subcollection.
  const handleSendFriendRequest = async () => {
    if (searchedProfile && currentUser) {
      const targetPendingRef = doc(
        db,
        'users',
        searchedProfile.firebaseId,
        'pendingRequests',
        currentUser.uid
      );
      await setDoc(targetPendingRef, {
        uid: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous',
        photoURL: currentUser.photoURL || 'https://via.placeholder.com/40'
      });
      showNotification(`Friend request sent to ${searchedProfile.displayName}`, 'success');
      setSearchedProfile(null);
      setSearchInput('');
      setSearchStatus('');
    }
  };

  // Accept a pending friend request.
  const handleAcceptRequest = async (senderId) => {
    if (!currentUser) return;
    const pendingRequestRef = doc(db, 'users', currentUser.uid, 'pendingRequests', senderId);
    await deleteDoc(pendingRequestRef);

    const currentFriendRef = doc(db, 'users', currentUser.uid, 'friends', senderId);
    await setDoc(currentFriendRef, { uid: senderId });

    const senderFriendRef = doc(db, 'users', senderId, 'friends', currentUser.uid);
    try {
      await setDoc(senderFriendRef, { uid: currentUser.uid });
    } catch (error) {
      console.error("Error adding friend to sender's collection:", error);
    }
    const pendingRequest = pendingRequests.find(request => request.firebaseId === senderId);
    const senderName = pendingRequest ? pendingRequest.displayName : senderId;
    showNotification(`Friend request from ${senderName} accepted!`, 'success');
    fetchPendingRequests();
  };

  // Deny a pending friend request.
  const handleDenyRequest = async (senderId) => {
    if (!currentUser) return;
    const pendingRequestRef = doc(db, 'users', currentUser.uid, 'pendingRequests', senderId);
    await deleteDoc(pendingRequestRef);
    const pendingRequest = pendingRequests.find(request => request.firebaseId === senderId);
    const senderName = pendingRequest ? pendingRequest.displayName : senderId;
    showNotification(`Friend request from ${senderName} denied!`, 'error');
    fetchPendingRequests();
  };

  return (
    <div className="friend-requests-menu">
      <h2>Send a Friend Request</h2>
      <form onSubmit={handleSearch} className="friend-search-form">
        <input
          type="text"
          placeholder="Enter friend's Firebase ID"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="friend-search-input"
        />
        <button type="submit" className="friend-search-button">
          Search
        </button>
      </form>

      {/* Display error status if applicable */}
      {!searchedProfile && searchStatus && (
        <p className="error-message">{searchStatus}</p>
      )}

      {searchedProfile && (
        <div className="searched-profile">
          <img
            src={searchedProfile.photoURL}
            alt={searchedProfile.displayName}
            className="profile-icon"
          />
          <div className="profile-details">
            <span className="profile-name">{searchedProfile.displayName}</span>
          </div>
          <div className="profile-action">
            {searchStatus ? (
              <span className="status-badge">{searchStatus}</span>
            ) : (
              <button onClick={handleSendFriendRequest} className="send-request-button">
                Send Friend Request
              </button>
            )}
          </div>
        </div>
      )}

      <h2>Pending Friend Requests</h2>
      <div className="pending-requests">
        {pendingRequests.length === 0 && <p>No pending requests</p>}
        {pendingRequests.map((request) => (
          <div key={request.firebaseId} className="pending-request-item">
            <img
              src={request.photoURL}
              alt={request.displayName}
              className="profile-icon"
            />
            <div className="profile-details">
              <span className="profile-name">{request.displayName}</span>
            </div>
            <div className="request-actions">
              <button
                onClick={() => handleAcceptRequest(request.firebaseId)}
                className="accept-button"
              >
                ✔
              </button>
              <button
                onClick={() => handleDenyRequest(request.firebaseId)}
                className="deny-button"
              >
                ✖
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Render notification popup if one is set */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default FriendRequestsMenu;
