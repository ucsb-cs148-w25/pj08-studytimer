import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const auth = getAuth();
  const db = getFirestore();
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  // Fetch friends from the current user's friends subcollection.
  const fetchFriends = async () => {
    if (!currentUser) return;
    try {
      const friendsCol = collection(db, 'users', currentUser.uid, 'friends');
      const snapshot = await getDocs(friendsCol);
      const friendPromises = snapshot.docs.map(async (friendDoc) => {
        const friendId = friendDoc.id;
        const friendProfileRef = doc(db, 'users', friendId);
        const friendProfileSnap = await getDoc(friendProfileRef);
        if (friendProfileSnap.exists()) {
          return { uid: friendId, ...friendProfileSnap.data() };
        }
        return null;
      });
      const friendsData = await Promise.all(friendPromises);
      const validFriends = friendsData.filter(friend => friend !== null);
      setFriends(validFriends);
      setFilteredFriends(validFriends);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [currentUser]);

  // Filter friends based on the search term.
  useEffect(() => {
    if (!searchTerm) {
      setFilteredFriends(friends);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      setFilteredFriends(
        friends.filter(friend =>
          friend.displayName.toLowerCase().includes(lowerTerm)
        )
      );
    }
  }, [searchTerm, friends]);

  const handleCardClick = (friendUid) => {
    // Navigate to the FriendProfile page with the friend's UID.
    navigate(`/friend/${friendUid}`);
  };

  return (
    <div className="friends-list">
      <h2>Your Friends</h2>
      <input 
        type="text" 
        placeholder="Search friends..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="friends-search-input"
      />
      <div className="friends-cards">
        {filteredFriends.map(friend => (
          <div 
            key={friend.uid} 
            className="friend-card" 
            onClick={() => handleCardClick(friend.uid)}
          >
            <img 
              src={friend.photoURL || 'https://via.placeholder.com/40'} 
              alt={friend.displayName} 
              className="friend-card-icon" 
            />
            <div className="friend-card-name">{friend.displayName}</div>
          </div>
        ))}
        {filteredFriends.length === 0 && (
          <p>No friends match your search.</p>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
