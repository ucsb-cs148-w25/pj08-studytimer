import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import FriendRequestsMenu from './FriendRequestsMenu';
import FriendsList from './FriendList';
import LeaderboardMenu from './LeaderboardMenu';
import './Community.css';

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('community');
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Helper function to display notifications for 3 seconds.
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleCopy = () => {
    if (user) {
      navigator.clipboard.writeText(user.uid)
        .then(() => showNotification('User ID copied to clipboard!', 'success'))
        .catch((err) => {
          console.error('Failed to copy!', err);
          showNotification('Failed to copy User ID!', 'error');
        });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'community':
        return <FriendsList />;
      case 'friendRequests':
        return <FriendRequestsMenu />;
      case 'leaderboards':
        return <LeaderboardMenu />;
      default:
        return <div>Welcome</div>;
    }
  };

  return (
    <div className="community-container">
      <div className="sidebar">
        <div
          className={`menu-item ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          Community
        </div>
        <div
          className={`menu-item ${activeTab === 'friendRequests' ? 'active' : ''}`}
          onClick={() => setActiveTab('friendRequests')}
        >
          Friend Requests
        </div>
        <div
          className={`menu-item ${activeTab === 'leaderboards' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboards')}
        >
          Leaderboards
        </div>
        <div className="menu-item user-id">
          Share Your User ID:{" "}
          <span className="user-id-link" onClick={handleCopy}>
            {user ? user.uid : 'Loading...'}
          </span>
        </div>
      </div>
      <div className="content">{renderContent()}</div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
