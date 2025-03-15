import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, onSnapshot } from "firebase/firestore";
import unlockAchievement from "../../utils/unlockAchievement";
import MetricsChart from "../ToDo/MetricsChart.js";
import TaskCalendarChart from "../ToDo/TaskCalendarChart.js";
import "./Profile.css";

// Default values
const DEFAULT_MAJOR = "Undeclared";
const DEFAULT_CLASS_YEAR = "Freshman";
const DEFAULT_BIO = "I am a passionate developer and creative thinker.";

// Inline editable component for the Major field
function InlineEditableMajor({ major, onMajorChange }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(major);

  useEffect(() => {
    setValue(major);
  }, [major]);

  const handleDoubleClick = () => setEditing(true);
  const handleChange = (e) => setValue(e.target.value);
  const handleBlur = () => {
    setEditing(false);
    onMajorChange(value);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") e.target.blur();
  };

  return (
    <div className="major-inline">
      <strong>Major:</strong>{" "}
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span onDoubleClick={handleDoubleClick}>
          {value && value.trim() !== "" ? value : DEFAULT_MAJOR}
        </span>
      )}
    </div>
  );
}

// Inline editable component for the Class Year field
function InlineEditableClassYear({ classYear, onClassYearChange }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(classYear);

  useEffect(() => {
    setValue(classYear);
  }, [classYear]);

  const handleDoubleClick = () => setEditing(true);
  const handleChange = (e) => setValue(e.target.value);
  const handleBlur = () => {
    setEditing(false);
    onClassYearChange(value);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") e.target.blur();
  };

  return (
    <div className="class-year-inline">
      <strong>Class Year:</strong>{" "}
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span onDoubleClick={handleDoubleClick}>
          {value && value.trim() !== "" ? value : DEFAULT_CLASS_YEAR}
        </span>
      )}
    </div>
  );
}

// Inline editable component for the Bio field
function InlineEditableBio({ bio, onBioChange }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(bio);

  useEffect(() => {
    setValue(bio);
  }, [bio]);

  const handleDoubleClick = () => setEditing(true);
  const handleChange = (e) => setValue(e.target.value);
  const handleBlur = () => {
    setEditing(false);
    onBioChange(value);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.target.blur();
    }
  };

  return (
    <div className="bio-inline">
      <strong>Bio:</strong>{" "}
      {editing ? (
        // Using textarea for multiline bio editing
        <textarea
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          rows={3}
        />
      ) : (
        <span onDoubleClick={handleDoubleClick}>
          {value && value.trim() !== "" ? value : DEFAULT_BIO}
        </span>
      )}
    </div>
  );
}

// Component for Skills/Interests section (editable tags/chips)
function SkillsSection({ skills, onSkillsChange }) {
  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill !== "" && !skills.includes(trimmedSkill)) {
      onSkillsChange([...skills, trimmedSkill]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    onSkillsChange(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="skills-section">
      <strong>Skills/Interests:</strong>
      <div className="skills-chips">
        {skills.map((skill, index) => (
          <div key={index} className="chip" onClick={() => handleRemoveSkill(skill)}>
            <span className="chip-text">{skill}</span>
            <span className="remove-chip">&times;</span>
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Add a skill or interest..."
        value={newSkill}
        onChange={(e) => setNewSkill(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

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

function Profile() {
  const [userName, setUserName] = useState("User");
  const [userPhoto, setUserPhoto] = useState(null);
  const [major, setMajor] = useState(DEFAULT_MAJOR);
  const [classYear, setClassYear] = useState(DEFAULT_CLASS_YEAR);
  const [bio, setBio] = useState(DEFAULT_BIO);
  const [skills, setSkills] = useState([]);
  const [userId, setUserId] = useState(null);
  const db = getFirestore();

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
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserName(user.displayName || "User");
        setUserPhoto(user.photoURL || "/default-profile.png");
        setUserId(user.uid);

        // Reference to the user's Firestore document
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMajor(data.major !== undefined ? data.major : DEFAULT_MAJOR);
          setClassYear(data.classYear !== undefined ? data.classYear : DEFAULT_CLASS_YEAR);
          setBio(data.bio !== undefined ? data.bio : DEFAULT_BIO);
          setSkills(data.skills !== undefined ? data.skills : []);
        } else {
          // If no document exists, initialize with default values
          await setDoc(userDocRef, { 
            major: DEFAULT_MAJOR, 
            classYear: DEFAULT_CLASS_YEAR, 
            bio: DEFAULT_BIO,
            skills: [] 
          });
          setMajor(DEFAULT_MAJOR);
          setClassYear(DEFAULT_CLASS_YEAR);
          setBio(DEFAULT_BIO);
          setSkills([]);
        }

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
            const achievementsList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setAchievements(achievementsList);
          }
        });

        return () => {
          unsubscribeStats();
          unsubscribeAchievements();
        };
      } else {
        setUserName("User");
        setUserPhoto("/default-profile.png");
        setMajor(DEFAULT_MAJOR);
        setClassYear(DEFAULT_CLASS_YEAR);
        setBio(DEFAULT_BIO);
        setSkills([]);
        setUserId(null);
      }
    });
    return () => unsubscribeAuth();
  }, [db]);

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

  // Update functions that also save to Firestore
  const handleMajorChange = async (newMajor) => {
    setMajor(newMajor);
    if (userId) {
      const userDocRef = doc(db, "users", userId);
      try {
        await updateDoc(userDocRef, { major: newMajor });
        console.log("Major updated in Firestore");
      } catch (error) {
        console.error("Error updating major:", error);
      }
    }
  };

  const handleClassYearChange = async (newClassYear) => {
    setClassYear(newClassYear);
    if (userId) {
      const userDocRef = doc(db, "users", userId);
      try {
        await updateDoc(userDocRef, { classYear: newClassYear });
        console.log("Class year updated in Firestore");
      } catch (error) {
        console.error("Error updating class year:", error);
      }
    }
  };

  const handleBioChange = async (newBio) => {
    setBio(newBio);
    if (userId) {
      const userDocRef = doc(db, "users", userId);
      try {
        await updateDoc(userDocRef, { bio: newBio });
        console.log("Bio updated in Firestore");
      } catch (error) {
        console.error("Error updating bio:", error);
      }
    }
  };

  const handleSkillsChange = async (newSkills) => {
    setSkills(newSkills);
    if (userId) {
      const userDocRef = doc(db, "users", userId);
      try {
        await updateDoc(userDocRef, { skills: newSkills });
        console.log("Skills updated in Firestore");
      } catch (error) {
        console.error("Error updating skills:", error);
      }
    }
  };

  // Format time (hh:mm:ss)
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

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
    <div className="profile-page">
      {/* Left Panel: Profile Info */}
      <div className="left-panel">
        <img src={userPhoto} alt="Profile Icon" className="profile-page-icon" />
        <h1 className="username">{userName}</h1>
        <InlineEditableMajor major={major} onMajorChange={handleMajorChange} />
        <InlineEditableClassYear classYear={classYear} onClassYearChange={handleClassYearChange} />
        <InlineEditableBio bio={bio} onBioChange={handleBioChange} />
        {/* Note for editing fields */}
        <div className="profile-note">
          Note: Double click on the fields to edit them.
        </div>
        <SkillsSection skills={skills} onSkillsChange={handleSkillsChange} />
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

      {/* Right Panel: Metrics & Activity */}
      <div className="right-panel">
        <div className="metrics-section">
          <h1>Metrics</h1>
          <TaskCalendarChart />
          <MetricsChart />
        </div>
      </div>
    </div>
  );
}

export default Profile;
