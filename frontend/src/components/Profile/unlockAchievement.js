import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const unlockAchievement = async (achievementId) => {
  const auth = getAuth();
  const db = getFirestore();

  if (!auth.currentUser) return;

  const userId = auth.currentUser.uid;
  const achievementRef = doc(db, `users/${userId}/achievements/${achievementId}`);
  const statsRef = doc(db, `users/${userId}`);

  try {
    // Get the user's stats
    const statsSnap = await getDoc(statsRef);
    if (!statsSnap.exists() || !statsSnap.data().stats) return;

    const stats = statsSnap.data().stats;

    // Achievement Conditions Based on Stats
    const achievementConditions = {
      "first_timer": () => true, // Always unlock when first timer starts
      "study_5_sessions": () => stats.studySessions >= 5,
      "study_10_sessions": () => stats.studySessions >= 10,
      "study_20_sessions": () => stats.studySessions >= 20,
      "study_1_hour": () => stats.totalStudyTime >= 3600,
      "study_5_hours": () => stats.totalStudyTime >= 18000,
      "study_10_hours": () => stats.totalStudyTime >= 36000,
      "break_10_taken": () => stats.totalBreaksTaken >= 10,
      "break_25_taken": () => stats.totalBreaksTaken >= 25,
      "longest_30_min": () => stats.longestSession >= 1800,
      "longest_1_hour": () => stats.longestSession >= 3600,
      "consistency_week": () => {
        const lastSevenDays = new Set();
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          lastSevenDays.add(date.toDateString());
        }
        return lastSevenDays.has(new Date(stats.lastSessionDate).toDateString());
      }
    };

    // Check if the achievement should be unlocked
    if (achievementConditions[achievementId] && achievementConditions[achievementId]()) {
      const achievementSnap = await getDoc(achievementRef);
      if (achievementSnap.exists() && !achievementSnap.data().unlocked) {
        await updateDoc(achievementRef, { unlocked: true, icon: "/badges/badge.png" });
        console.log(`Achievement Unlocked: ${achievementId}`);
      }
    }
  } catch (error) {
    console.error("Error unlocking achievement:", error);
  }
};

export default unlockAchievement;
