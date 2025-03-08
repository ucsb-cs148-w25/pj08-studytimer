import React from 'react';
import FriendsList from './FriendList';
import CommunityFeed from './CommunityFeed';
import "./Community.css"; // Optional, for styling the layout

const CommunityWithFriends = () => {
  return (
    <div className="community-with-friends">
      {/* Display the Friends List (cards) at the top */}
      <FriendsList />

      {/* Then display the Community Feed */}
      <CommunityFeed />
    </div>
  );
};

export default CommunityWithFriends;
