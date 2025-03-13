import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, collection, onSnapshot } from "firebase/firestore";
import resetAchievements from "../../utils/resetAchievements";
import resetStats from "../../utils/resetStats";
import MetricsSidebar from "./MetricsSidebar";
import unlockAchievement from "../../utils/unlockAchievement";
import "./Profile.css";

function Profile() {

return (
  <div className="about-container">
    <h1>Our Mission</h1>
  </div>
)
}

export default Profile;
