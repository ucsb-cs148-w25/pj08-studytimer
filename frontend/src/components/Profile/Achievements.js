import React, { useState, useEffect } from "react";
import { getFirestore, collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "./Achievements.css";

function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    if (auth.currentUser) {
      fetchAchievements();
    }
  }, [auth.currentUser]);

  const fetchAchievements = async () => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const achievementsRef = collection(db, `users/${userId}/achievements`);
    
    try {
      const snapshot = await getDocs(achievementsRef);
      const achievementsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAchievements(achievementsList);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  const unlockAchievement = async (id) => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const achievementRef = doc(db, `users/${userId}/achievements/${id}`);

    try {
      await updateDoc(achievementRef, { unlocked: true, icon: "/badges/badge.png" });
      fetchAchievements(); // Refresh achievements list
    } catch (error) {
      console.error("Error updating achievement:", error);
    }
  };

  return (
    <div className="achievements">
      <h2>Your Achievements</h2>
      <ul>
        {achievements.map((achievement) => (
          <li key={achievement.id} className={achievement.unlocked ? "unlocked" : "locked"}>
            <img src={achievement.icon} alt={achievement.name} />
            <p>{achievement.name}</p>
            {!achievement.unlocked && (
              <button onClick={() => unlockAchievement(achievement.id)}>Unlock</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Achievements;
