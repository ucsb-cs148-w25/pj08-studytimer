import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  onSnapshot, 
  collection 
} from "firebase/firestore";
import "./Profile.css";

// Default values
const DEFAULT_MAJOR = "Undeclared";
const DEFAULT_CLASS_YEAR = "Freshman";
const DEFAULT_BIO = "I am a passionate developer and creative thinker.";

// Utility: Format seconds into hh:mm:ss
const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

// Achievement descriptions and component
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
  const groupAchievements = groupIds.map((id) =>
    achievements.find((a) => a.id === id)
  );
  const unlockedCount = groupAchievements.filter((a) => a && a.unlocked).length;

  let title = "Not Unlocked";
  if (unlockedCount > 0) {
    const achievementObj = groupAchievements[unlockedCount - 1];
    if (achievementObj) {
      title = achievementObj.name;
    }
  }

  const iconToShow =
    unlockedCount > 0 ? badgeIcons[unlockedCount - 1] : "/badges/locked.png";

  let dynamicDescription = description;
  if (unlockedCount === 3) {
    dynamicDescription = "Maxed Achievement";
  } else if (unlockedCount > 0 && unlockedCount < groupIds.length) {
    const nextAchievementId = groupIds[unlockedCount];
    dynamicDescription =
      achievementDescriptions[nextAchievementId] || description;
  }

  return (
    <div className="achievement-card">
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

function FriendProfile() {
  // Use useParams to retrieve the friend UID from the URL.
  const { friendId } = useParams();
  console.log("friendId:", friendId);

  const [friendName, setFriendName] = useState("User");
  const [friendPhoto, setFriendPhoto] = useState("/default-profile.png");
  const [major, setMajor] = useState(DEFAULT_MAJOR);
  const [classYear, setClassYear] = useState(DEFAULT_CLASS_YEAR);
  const [bio, setBio] = useState(DEFAULT_BIO);
  const [skills, setSkills] = useState([]);
  const [userStats, setUserStats] = useState({
    totalStudyTime: 0,
    totalBreaksTaken: 0,
    studySessions: 0,
    longestSession: 0,
    lastSessionDate: "N/A",
  });
  const [achievements, setAchievements] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    if (!friendId) return; // Ensure friendId is defined

    // Fetch friend's static profile data
    const friendDocRef = doc(db, "users", friendId);
    const fetchData = async () => {
      const docSnap = await getDoc(friendDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFriendName(data.displayName || "User");
        setFriendPhoto(data.photoURL || "/default-profile.png");
        setMajor(data.major || DEFAULT_MAJOR);
        setClassYear(data.classYear || DEFAULT_CLASS_YEAR);
        setBio(data.bio || DEFAULT_BIO);
        setSkills(data.skills || []);
      }
    };
    fetchData();

    // Listen to real-time changes in stats
    const statsRef = doc(db, "users", friendId);
    const unsubscribeStats = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().stats) {
        setUserStats(docSnap.data().stats);
      }
    });

    // Listen to real-time changes in achievements
    const achievementsRef = collection(db, "users", friendId, "achievements");
    const unsubscribeAchievements = onSnapshot(achievementsRef, (snapshot) => {
      const achievementsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Achievements for friendId:", friendId, achievementsList);
      setAchievements(achievementsList);
    });

    return () => {
      unsubscribeStats();
      unsubscribeAchievements();
    };
  }, [friendId, db]);

  return (
    <div className="profile-page">
      {/* Left Panel: Friend's Profile Info (Read-Only) */}
      <div className="left-panel">
        <img src={friendPhoto} alt="Profile Icon" className="profile-page-icon" />
        <h1 className="username">{friendName}</h1>
        <div className="major-static">
          <strong>Major:</strong>{" "}
          {major && major.trim() !== "" ? major : DEFAULT_MAJOR}
        </div>
        <div className="class-year-static">
          <strong>Class Year:</strong>{" "}
          {classYear && classYear.trim() !== "" ? classYear : DEFAULT_CLASS_YEAR}
        </div>
        <div className="bio-static">
          <strong>Bio:</strong>{" "}
          {bio && bio.trim() !== "" ? bio : DEFAULT_BIO}
        </div>
        <div className="skills-static">
          <strong>Skills/Interests:</strong>
          <div className="skills-chips">
            {skills.map((skill, index) => (
              <div key={index} className="chip read-only">
                <span className="chip-text">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Panel: Stats & Achievements */}
      <div className="middle-panel">
        <div className="stats-section">
          <div className="stats">
            <h2 className="stats__title">Stats</h2>
            <div className="stats__container">
              <div className="stats__item">
                <div className="stats__icon">
                  <img
                    src="/icons/clock.png"
                    alt="Clock Icon"
                    className="stats__icon-img"
                  />
                </div>
                <h3 className="stats__item-title">Total Study Time</h3>
                <p className="stats__item-value">
                  {formatTime(userStats.totalStudyTime)}
                </p>
              </div>
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
              <div className="stats__item">
                <div className="stats__icon">
                  <img
                    src="/icons/stopwatch.png"
                    alt="Stopwatch Icon"
                    className="stats__icon-img"
                  />
                </div>
                <h3 className="stats__item-title">Longest Study Session</h3>
                <p className="stats__item-value">
                  {formatTime(userStats.longestSession)}
                </p>
              </div>
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
          </div>
        </div>
        <div className="achievements-section">
          <div className="achievements">
            <h2 className="achievement__title">Achievements</h2>
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
      {/* Note: The right-panel (Metrics & Activity) is intentionally omitted */}
    </div>
  );
}

export default FriendProfile;
