import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
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

function Profile() {
  const [userName, setUserName] = useState("User");
  const [userPhoto, setUserPhoto] = useState(null);
  const [major, setMajor] = useState(DEFAULT_MAJOR);
  const [classYear, setClassYear] = useState(DEFAULT_CLASS_YEAR);
  const [bio, setBio] = useState(DEFAULT_BIO);
  const [skills, setSkills] = useState([]);
  const [userId, setUserId] = useState(null);
  const db = getFirestore();

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

  return (
    <div className="profile-page">
      {/* Left Panel: Profile Info */}
      <div className="left-panel">
        <img src={userPhoto} alt="Profile Icon" className="profile-page-icon" />
        <h1 className="username">{userName}</h1>
        <InlineEditableMajor major={major} onMajorChange={handleMajorChange} />
        <InlineEditableClassYear classYear={classYear} onClassYearChange={handleClassYearChange} />
        <InlineEditableBio bio={bio} onBioChange={handleBioChange} />
        <SkillsSection skills={skills} onSkillsChange={handleSkillsChange} />
      </div>

      {/* Middle Panel: Stats & Achievements */}
      <div className="middle-panel">
        <div className="stats-section">
          <h2>Stats</h2>
          <div className="stats">
            <div className="stat">
              <span className="stat-number">120</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat">
              <span className="stat-number">450</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-number">300</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
        </div>
        <div className="achievements-section">
          <h2>Achievements</h2>
          <div className="achievements">
            <div className="achievement">
              <span className="achievement-icon">🏆</span>
              <div className="achievement-info">
                <h3>Top Contributor</h3>
                <p>For exceptional content creation.</p>
              </div>
            </div>
            <div className="achievement">
              <span className="achievement-icon">🌟</span>
              <div className="achievement-info">
                <h3>Rising Star</h3>
                <p>Awarded for rapid growth.</p>
              </div>
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
