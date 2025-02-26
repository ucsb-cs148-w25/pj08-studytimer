import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, collection, onSnapshot } from "firebase/firestore";
import resetAchievements from "../../utils/resetAchievements";
import resetStats from "../../utils/resetStats";
import HomeSidebar from "../Home/HomeSidebar";
import "./Profile.css";

const achievementDescriptions = {
  first_timer: "Start the timer for the first time.",
  study_5_sessions: "Complete 5 study sessions.",
  study_10_sessions: "Complete 10 study sessions.",
  study_20_sessions: "Complete 20 study sessions.",
  study_1_hour: "Accumulate 1 hour of total study time.",
  study_5_hours: "Accumulate 5 hours of total study time.",
  study_10_hours: "Accumulate 10 hours of total study time.",
  break_10_taken: "Take 10 breaks during study sessions.",
  break_25_taken: "Take 25 breaks during study sessions.",
  longest_30_min: "Study for 30 minutes in a single session.",
  longest_1_hour: "Study for 1 hour in a single session.",
  consistency_week: "Study at least once per day for a week."
};

function Profile() {
  const [userName, setUserName] = useState("User");
  const [userPhoto, setUserPhoto] = useState(null);
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
  

  // Format time (hh:mm:ss)
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

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
          <h2>User Stats</h2>
          <div className="stats__container">
            <p>
              <strong>Total Study Time:</strong> {formatTime(userStats.totalStudyTime)}
            </p>
            <p>
              <strong>Study Sessions:</strong> {userStats.studySessions}
            </p>
            <p>
              <strong>Breaks Taken:</strong> {userStats.totalBreaksTaken}
            </p>
            <p>
              <strong>Longest Study Session:</strong> {formatTime(userStats.longestSession)}
            </p>
            <p>
              <strong>Last Study Session:</strong>{" "}
              {userStats.lastSessionDate !== "N/A"
                ? new Date(userStats.lastSessionDate).toLocaleString()
                : "N/A"}
            </p>
          </div>
          <button className="button-reset button-reset--stats" onClick={resetStats}>
            Reset Stats
          </button>
        </div>

        {/* Achievements Box */}
        <div className="achievements">
          <h2>Your Achievements</h2>
          <div className="achievements__container">
            <ul className="achievements__list">
              {achievements.map((achievement) => (
                <li
                  key={achievement.id}
                  className={
                    achievement.unlocked
                      ? "achievements__item--unlocked"
                      : "achievements__item--locked"
                  }
                >
                  <img src={achievement.icon} alt={achievement.name} className="achievements__icon" />
                  <div className="achievement__text">
                    <p className="achievement__name">{achievement.name}</p>
                    <span className="achievement__description">
                      {achievementDescriptions[achievement.id] ||
                        "Achievement description not available."}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <button className="button-reset button-reset--achievements" onClick={resetAchievements}>
            Reset Achievements
          </button>
        </div>
      </div>

      {/* Sidebar Section */}
      <div className="profile__sidebar">
        <HomeSidebar />
      </div>
    </div>
  );
}

export default Profile;
