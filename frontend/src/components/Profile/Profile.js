import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import initializeAchievements from "../../utils/initializeAchievements";
import resetAchievements from "../../utils/resetAchievements";
import "./Profile.css";
import Achievements from "./Achievements";

function Profile() {
  const [userName, setUserName] = useState("User");
  const [userPhoto, setUserPhoto] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "User");
        setUserPhoto(user.photoURL || "/default-profile.png"); // Fallback image
        initializeAchievements(); // Ensure achievements are initialized
      } else {
        setUserName("User");
        setUserPhoto("/default-profile.png");
      }
    });
  
    return () => unsubscribe();
  }, []);  

  return (
    <div className="profile">
      {/* User info section */}
      <div className="user-info">
      <img 
        className="profile-picture" 
        src={userPhoto} 
        alt="Profile" 
        referrerPolicy="no-referrer" // Fixes issues with Google-hosted images
        onError={(e) => e.target.src = "/default-profile.png"} // Fallback image
      />
        <h1 className="user-name">{userName}</h1>
      </div>

      <Achievements />

      {/* Reset Achievements Button */}
      <button className="reset-achievements-btn" onClick={resetAchievements}>
        Reset Achievements
      </button>
    </div>
  );
}

export default Profile;
