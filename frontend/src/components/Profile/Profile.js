import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, collection, onSnapshot } from "firebase/firestore";
import resetAchievements from "../../utils/resetAchievements";
import resetStats from "../../utils/resetStats";
import MetricsSidebar from "./MetricsSidebar";
import unlockAchievement from "../../utils/unlockAchievement";
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

// Component for an individual achievement card with custom badge icons, dynamic descriptions, and pastel backgrounds.
function AchievementCard({ groupIds, achievements, description, badgeIcons }) {
  // Map the group IDs to their achievement objects (if any)
  const groupAchievements = groupIds.map(id => achievements.find(a => a.id === id));
  // Count how many achievements are unlocked in this group
  const unlockedCount = groupAchievements.filter(a => a && a.unlocked).length;

  // Determine the card title:
  // 0 unlocked => "Not Unlocked"
  // 1 unlocked => use the first achievement’s name, 2 unlocked => second, etc.
  let title = "Not Unlocked";
  if (unlockedCount > 0) {
    const achievementObj = groupAchievements[unlockedCount - 1];
    if (achievementObj) {
      title = achievementObj.name;
    }
  }

  // Determine which icon to show based on progress:
  // If unlocked, use the corresponding badge icon; otherwise, show a locked icon.
  const iconToShow = unlockedCount > 0 ? badgeIcons[unlockedCount - 1] : "/badges/locked.png";

  // Update description:
  // If all three achievements are unlocked, display "Maxed Achievement"
  // Otherwise, if at least one is unlocked, show the description for the next achievement.
  let dynamicDescription = description;
  if (unlockedCount === 3) {
    dynamicDescription = "Maxed Achievement";
  } else if (unlockedCount > 0 && unlockedCount < groupIds.length) {
    const nextAchievementId = groupIds[unlockedCount];
    dynamicDescription = achievementDescriptions[nextAchievementId] || description;
  }

  // Define pastel background colors for different levels of unlocked achievements.
  const backgroundColors = [
    "#ffffff",   // 0 stars: white
    "#d1dff6",   // 1 star
    "#b2cbf2",   // 2 stars
    "#92b6f0",   // 3 stars
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

function Profile() {
  const [userName, setUserName] = useState("User");
  const [userPhoto, setUserPhoto] = useState(null);

  // Additional fields for extra user details
  const [major, setMajor] = useState("Undeclared");
  const [classYear, setClassYear] = useState("Freshman");
  const [bio, setBio] = useState("Hello! I love studying with Pomodoro!");
  
  // Editing toggles for inline editing
  const [editingMajor, setEditingMajor] = useState(false);
  const [editingClassYear, setEditingClassYear] = useState(false);
  const [editingBio, setEditingBio] = useState(false);

  const [userStats, setUserStats] = useState({
    totalStudyTime: 0,
    totalBreaksTaken: 0,
    studySessions: 0,
    longestSession: 0,
    lastSessionDate: "N/A",
  });
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "User");
        setUserPhoto(user.photoURL || "/default-profile.png");

        // Listen to real-time changes in stats
        const statsRef = doc(db, `users/${user.uid}`);
        const unsubscribeStats = onSnapshot(statsRef, (docSnap) => {
          if (docSnap.exists() && docSnap.data().stats) {
            setUserStats(docSnap.data().stats);
          }
        });

        // Listen to real-time changes in achievements
        const achievementsRef = collection(db, `users/${user.uid}/achievements`);
        const unsubscribeAchievements = onSnapshot(achievementsRef, (snapshot) => {
          if (!snapshot.empty) {
            const achievementsList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));
            setAchievements(achievementsList);
          }
        });

        // Cleanup listeners when component unmounts or user changes
        return () => {
          unsubscribeStats();
          unsubscribeAchievements();
        };
      } else {
        setUserName("User");
        setUserPhoto("/default-profile.png");
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Auto-check for achievement updates whenever userStats changes
  useEffect(() => {
    if (!userStats) return;

    const achievementIds = [
      "study_5_sessions",
      "study_10_sessions",
      "study_20_sessions",
      "study_1_hour",
      "study_5_hours",
      "study_10_hours",
      "break_10_taken",
      "break_25_taken",
      "break_50_taken",
      "longest_30_min",
      "longest_1_hour",
      "longest_3_hour",
    ];

    achievementIds.forEach((id) => {
      unlockAchievement(id);
    });
  }, [userStats]);

  // Format time (hh:mm:ss)
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Define the achievement groups along with their specific badge icons
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
    <div className="profile">
      {/* User Info Section */}
      <div className="profile__user-info">
        <img
          className="profile__picture"
          src={userPhoto}
          alt="Profile"
          referrerPolicy="no-referrer"
          onError={(e) => (e.target.src = "/default-profile.png")}
        />
        <h1 className="profile__user-name">{userName}</h1>
      </div>
      
      {/* Container for Stats & Achievements */}
      <div className="profile__content">
        {/* Stats Box */}
        <div className="stats">
          <h2 className="stats__title">User Stats</h2>
          <div className="stats__container">
            {/* Total Study Time */}
            <div className="stats__item">
              <div className="stats__icon">
                {/* Replace Font Awesome with your PNG icon */}
                <img
                  src="/icons/clock.png"
                  alt="Clock Icon"
                  className="stats__icon-img"
                />
              </div>
              <h3 className="stats__item-title">Total Study Time</h3>
              <p className="stats__item-value">{formatTime(userStats.totalStudyTime)}</p>
            </div>

            {/* Study Sessions */}
            <div className="stats__item">
              <div className="stats__icon">
                <img
                  src="/icons/play.png"
                  alt="Play Icon"
                  className="stats__icon-img"
                />
              </div>
              <h3 className="stats__item-title">Study Sessions</h3>
              <p className="stats__item-value">{userStats.studySessions}</p>
            </div>

            {/* Breaks Taken */}
            <div className="stats__item">
              <div className="stats__icon">
                <img
                  src="/icons/coffee.png"
                  alt="Coffee Icon"
                  className="stats__icon-img"
                />
              </div>
              <h3 className="stats__item-title">Breaks Taken</h3>
              <p className="stats__item-value">{userStats.totalBreaksTaken}</p>
            </div>

            {/* Longest Study Session */}
            <div className="stats__item">
              <div className="stats__icon">
                <img
                  src="/icons/stopwatch.png"
                  alt="Stopwatch Icon"
                  className="stats__icon-img"
                />
              </div>
              <h3 className="stats__item-title">Longest Study Session</h3>
              <p className="stats__item-value">{formatTime(userStats.longestSession)}</p>
            </div>

            {/* Last Study Session */}
            <div className="stats__item">
              <div className="stats__icon">
                <img
                  src="/icons/calendar.png"
                  alt="Calendar Icon"
                  className="stats__icon-img"
                />
              </div>
              <h3 className="stats__item-title">Last Study Session</h3>
              <p className="stats__item-value">
                {userStats.lastSessionDate !== "N/A"
                  ? new Date(userStats.lastSessionDate).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <button className="button-reset button-reset--stats" onClick={resetStats}>
            Reset Stats
          </button>
        </div>

        {/* Achievements Cards Section */}
        <div className="achievements">
          <h2 className="achievement__title">User Achievements</h2>
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
          <button className="button-reset button-reset--achievements" onClick={resetAchievements}>
            Reset Achievements
          </button>
        </div>
      </div>

      <aside class="profile__sidebar">
        <MetricsSidebar />
      </aside>
    </div>
  );
}

export default Profile;
