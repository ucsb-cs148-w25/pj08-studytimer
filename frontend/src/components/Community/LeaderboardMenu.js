import React, { useEffect, useState } from 'react';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Helper function to format seconds as HH:MM:SS
const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return '00:00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const LeaderboardMenu = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('totalStudyTime'); // default filter
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const db = getFirestore();

  // Fetch the current user + friends data
  useEffect(() => {
    if (!currentUser) return;

    const fetchLeaderboard = async () => {
      try {
        // 1) Fetch current user’s doc
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        // Build an array of { uid, displayName, stats, photoURL } for the current user
        let tempData = [];
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          tempData.push({
            uid: currentUser.uid,
            displayName: data.displayName || 'Anonymous',
            photoURL: data.photoURL || 'https://via.placeholder.com/40',
            totalStudyTime: data.stats?.totalStudyTime || 0,
            studySessions: data.stats?.studySessions || 0,
            breaksTaken: data.stats?.totalBreaksTaken || 0,
            longestSession: data.stats?.longestSession || 0
          });
        }

        // 2) Fetch friends subcollection for current user
        const friendsColRef = collection(db, 'users', currentUser.uid, 'friends');
        const friendsSnap = await getDocs(friendsColRef);

        // 3) For each friend, fetch their doc
        const friendPromises = friendsSnap.docs.map(async (friendDoc) => {
          const friendId = friendDoc.id;
          const friendRef = doc(db, 'users', friendId);
          const friendSnap = await getDoc(friendRef);
          if (friendSnap.exists()) {
            const friendData = friendSnap.data();
            return {
              uid: friendId,
              displayName: friendData.displayName || 'Anonymous',
              photoURL: friendData.photoURL || 'https://via.placeholder.com/40',
              totalStudyTime: friendData.stats?.totalStudyTime || 0,
              studySessions: friendData.stats?.studySessions || 0,
              breaksTaken: friendData.stats?.totalBreaksTaken || 0,
              longestSession: friendData.stats?.longestSession || 0
            };
          }
          return null;
        });

        const resolvedFriends = await Promise.all(friendPromises);
        const validFriends = resolvedFriends.filter((f) => f !== null);

        // Combine current user + friends
        tempData = [...tempData, ...validFriends];
        setLeaderboardData(tempData);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboard();
  }, [currentUser, db]);

  // Sort the leaderboard data based on selectedFilter
  const getSortedData = () => {
    const dataCopy = [...leaderboardData];
    // Sort descending by the selected filter
    dataCopy.sort((a, b) => b[selectedFilter] - a[selectedFilter]);
    return dataCopy;
  };

  const handleSort = (filterKey) => {
    setSelectedFilter(filterKey);
  };

  const sortedData = getSortedData();

  return (
    <div className="leaderboard-menu">
      <h2>Leaderboard</h2>
      <div className="leaderboard-filters">
        <span
          className={`filter-option ${selectedFilter === 'totalStudyTime' ? 'active' : ''}`}
          onClick={() => handleSort('totalStudyTime')}
        >
          Total Study Time
        </span>
        <span
          className={`filter-option ${selectedFilter === 'studySessions' ? 'active' : ''}`}
          onClick={() => handleSort('studySessions')}
        >
          Study Sessions
        </span>
        <span
          className={`filter-option ${selectedFilter === 'breaksTaken' ? 'active' : ''}`}
          onClick={() => handleSort('breaksTaken')}
        >
          Breaks Taken
        </span>
        <span
          className={`filter-option ${selectedFilter === 'longestSession' ? 'active' : ''}`}
          onClick={() => handleSort('longestSession')}
        >
          Longest Study Session
        </span>
      </div>

      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>User</th>
            <th onClick={() => handleSort('totalStudyTime')}>
              Total Study Time {selectedFilter === 'totalStudyTime' ? '▼' : ''}
            </th>
            <th onClick={() => handleSort('studySessions')}>
              Study Sessions {selectedFilter === 'studySessions' ? '▼' : ''}
            </th>
            <th onClick={() => handleSort('breaksTaken')}>
              Breaks Taken {selectedFilter === 'breaksTaken' ? '▼' : ''}
            </th>
            <th onClick={() => handleSort('longestSession')}>
              Longest Session {selectedFilter === 'longestSession' ? '▼' : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((user, index) => (
            <tr key={user.uid}>
              <td>
                <div className="leaderboard-user">
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="leaderboard-user-icon"
                  />
                  <span>{user.displayName}</span>
                </div>
              </td>
              <td>{formatTime(user.totalStudyTime)}</td>
              <td>{user.studySessions}</td>
              <td>{user.breaksTaken}</td>
              <td>{formatTime(user.longestSession)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardMenu;
