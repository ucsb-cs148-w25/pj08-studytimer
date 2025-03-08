import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import FriendRequestsMenu from './FriendRequestsMenu';
import CommunityWithFriends from './CommunityWithFriends'; // Import composite component
import './Community.css';

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('community');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleCopy = () => {
    if (user) {
      navigator.clipboard.writeText(user.uid)
        .then(() => alert('User ID copied to clipboard!'))
        .catch((err) => console.error('Failed to copy!', err));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'community':
        return <CommunityWithFriends />;  // Render composite component here
      case 'friendRequests':
        return <FriendRequestsMenu />;
      case 'leaderboards':
        return <div>Leaderboards Content</div>;
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
        <div className="menu-item user-id" onClick={handleCopy}>
          {user ? `Share Your User ID: ${user.uid}` : 'Loading...'}
        </div>
      </div>
      <div className="content">{renderContent()}</div>
    </div>
  );
};

export default CommunityPage;
