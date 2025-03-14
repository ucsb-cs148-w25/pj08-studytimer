import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, collection, onSnapshot } from "firebase/firestore";
import "./Profile.css";

const achievementDescriptions = {
  study_5_sessions: "Complete 5 study sessions.",
  study_10_sessions: "Complete 10 study sessions.",
  study_20_sessions: "Complete 20 study sessions.",
  study_1_hour: "Accumulate 1 hour of total study time.",
  study_5_hours: "Accumulate 5 hours of total study time.",
  study_10_hours: "Accumulate 10 hours of total study time.",
  break_10_taken: "Take 10 breaks during study sessions.",
  break_25_taken: "Take 25 breaks during study sessions.",
  break_50_taken: "Take 50 breaks during study sessions.",
  longest_30_min: "Study for 30 minutes in a single session.",
  longest_1_hour: "Study for 1 hour in a single session.",
  longest_3_hour: "Study for 3 hours in a single session.",
};

function AchievementCard({ groupIds, achievements, description, badgeIcons }) {
  const groupAchievements = groupIds.map(id => achievements.find(a => a.id === id));
  const unlockedCount = groupAchievements.filter(a => a && a.unlocked).length;

  let title = "Not Unlocked";
  if (unlockedCount > 0) {
    const achievementObj = groupAchievements[unlockedCount - 1];
    if (achievementObj) {
      title = achievementObj.name;
    }
  }
  const iconToShow = unlockedCount > 0 ? badgeIcons[unlockedCount - 1] : "/badges/locked.png";

  let dynamicDescription = description;
  if (unlockedCount === 3) {
    dynamicDescription = "Maxed Achievement";
  } else if (unlockedCount > 0 && unlockedCount < groupIds.length) {
    const nextAchievementId = groupIds[unlockedCount];
    dynamicDescription = achievementDescriptions[nextAchievementId] || description;
  }

  const backgroundColors = [
    "#ffffff",   // 0 unlocked
    "#d1dff6",   // 1 unlocked
    "#b2cbf2",   // 2 unlocked
    "#92b6f0",   // 3 unlocked
  ];
  const cardStyle = { backgroundColor: backgroundColors[unlockedCount] };

  return (
    <div className="achievement-card" style={cardStyle}>
      <img
        src={iconToShow}
        alt="Achievement Icon"
        className="achievement-card__icon"
      />
      <h3 className="achievement-card__title">{title}</h3>
      <p className="achievement-card__description">{dynamicDescription}</p>
      <div className="achievement-card__stars">
        {[0, 1, 2].map((index) => (
          <img
            key={index}
            src={
              index < unlockedCount
                ? "/badges/star-filled.png"
                : "/badges/star-empty.png"
            }
            alt="star"
            className="achievement-card__star"
          />
        ))}
      </div>
    </div>
  );
}

function FriendProfile() {
  const { friendId } = useParams();
  const db = getFirestore();

  const [friendName, setFriendName] = useState("User");
  const [friendPhoto, setFriendPhoto] = useState("/default-profile.png");
  const [friendStats, setFriendStats] = useState({
    totalStudyTime: 0,
    totalBreaksTaken: 0,
    studySessions: 0,
    longestSession: 0,
    lastSessionDate: "N/A",
  });
  const [achievements, setAchievements] = useState([]);

  // Subscribe to the friend's user document for stats and profile info.
  useEffect(() => {
    const friendDocRef = doc(db, "users", friendId);
    const unsubscribeFriend = onSnapshot(friendDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFriendName(data.displayName || "User");
        setFriendPhoto(data.photoURL || "/default-profile.png");
        if (data.stats) {
          setFriendStats(data.stats);
        }
      }
    });

    // Subscribe to the friend's achievements subcollection.
    const achievementsRef = collection(db, `users/${friendId}/achievements`);
    const unsubscribeAchievements = onSnapshot(achievementsRef, (snapshot) => {
      if (!snapshot.empty) {
        const achievementsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAchievements(achievementsList);
      }
    });

    return () => {
      unsubscribeFriend();
      unsubscribeAchievements();
    };
  }, [friendId, db]);

  // Helper function to format seconds as hh:mm:ss.
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Define achievement groups as in your Profile.js.
  const achievementGroups = [
    {
      groupIds: ["study_5_sessions", "study_10_sessions", "study_20_sessions"],
      description: achievementDescriptions["study_5_sessions"],
      badgeIcons: [
        "/badges/study_sessions_badge1.png",
        "/badges/study_sessions_badge2.png",
        "/badges/study_sessions_badge3.png",
      ],
    },
    {
      groupIds: ["study_1_hour", "study_5_hours", "study_10_hours"],
      description: achievementDescriptions["study_1_hour"],
      badgeIcons: [
        "/badges/study_time_badge1.png",
        "/badges/study_time_badge2.png",
        "/badges/study_time_badge3.png",
      ],
    },
    {
      groupIds: ["break_10_taken", "break_25_taken", "break_50_taken"],
      description: achievementDescriptions["break_10_taken"],
      badgeIcons: [
        "/badges/breaks_badge1.png",
        "/badges/breaks_badge2.png",
        "/badges/breaks_badge3.png",
      ],
    },
    {
      groupIds: ["longest_30_min", "longest_1_hour", "longest_3_hour"],
      description: achievementDescriptions["longest_30_min"],
      badgeIcons: [
        "/badges/longest_badge1.png",
        "/badges/longest_badge2.png",
        "/badges/longest_badge3.png",
      ],
    },
  ];

  return (
    <div className="friend-profile">
      {/* Friend Info Section */}
      <div className="friend-profile__user-info">
        <img
          className="friend-profile__picture"
          src={friendPhoto}
          alt="Profile"
          referrerPolicy="no-referrer"
          onError={(e) => (e.target.src = "/default-profile.png")}
        />
        <h1 className="friend-profile__user-name">{friendName}</h1>
      </div>

      {/* Stats & Achievements */}
      <div className="friend-profile__content">
        {/* Stats */}
        <div className="stats">
          <h2 className="stats__title">User Stats</h2>
          <div className="stats__container">
            <div className="stats__item">
              <div className="stats__icon">
                <img src="/icons/clock.png" alt="Clock Icon" className="stats__icon-img" />
              </div>
              <h3 className="stats__item-title">Total Study Time</h3>
              <p className="stats__item-value">{formatTime(friendStats.totalStudyTime)}</p>
            </div>

            <div className="stats__item">
              <div className="stats__icon">
                <img src="/icons/play.png" alt="Play Icon" className="stats__icon-img" />
              </div>
              <h3 className="stats__item-title">Study Sessions</h3>
              <p className="stats__item-value">{friendStats.studySessions}</p>
            </div>

            <div className="stats__item">
              <div className="stats__icon">
                <img src="/icons/coffee.png" alt="Coffee Icon" className="stats__icon-img" />
              </div>
              <h3 className="stats__item-title">Breaks Taken</h3>
              <p className="stats__item-value">{friendStats.totalBreaksTaken}</p>
            </div>

            <div className="stats__item">
              <div className="stats__icon">
                <img src="/icons/stopwatch.png" alt="Stopwatch Icon" className="stats__icon-img" />
              </div>
              <h3 className="stats__item-title">Longest Study Session</h3>
              <p className="stats__item-value">{formatTime(friendStats.longestSession)}</p>
            </div>

            <div className="stats__item">
              <div className="stats__icon">
                <img src="/icons/calendar.png" alt="Calendar Icon" className="stats__icon-img" />
              </div>
              <h3 className="stats__item-title">Last Study Session</h3>
              <p className="stats__item-value">
                {friendStats.lastSessionDate !== "N/A"
                  ? new Date(friendStats.lastSessionDate).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="achievements">
          <h2>User Achievements</h2>
          <div className="achievement-cards-container">
            {achievementGroups.map((group, idx) => (
              <AchievementCard
                key={idx}
                groupIds={group.groupIds}
                achievements={achievements}
                description={group.description}
                badgeIcons={group.badgeIcons}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FriendProfile;
