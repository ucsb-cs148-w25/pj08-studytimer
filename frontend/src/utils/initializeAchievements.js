import { getFirestore, collection, doc, setDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const initializeAchievements = async () => {
  const auth = getAuth();
  const db = getFirestore();

  if (!auth.currentUser) return;

  const userId = auth.currentUser.uid;
  const achievementsRef = collection(db, `users/${userId}/achievements`);

  try {
    const snapshot = await getDocs(achievementsRef);
    if (!snapshot.empty) return; // If achievements already exist, don't overwrite them

    const allAchievements = [
      { id: "first_timer", name: "First Timer", unlocked: false, icon: "/badges/locked.png" },
      { id: "study_5_sessions", name: "Study Streak", unlocked: false, icon: "/badges/locked.png" },
      { id: "study_10_sessions", name: "Dedicated Student", unlocked: false, icon: "/badges/locked.png" },
      { id: "study_20_sessions", name: "Study Warrior", unlocked: false, icon: "/badges/locked.png" },
      { id: "study_1_hour", name: "One Hour Champ", unlocked: false, icon: "/badges/locked.png" },
      { id: "study_5_hours", name: "Study Machine", unlocked: false, icon: "/badges/locked.png" },
      { id: "study_10_hours", name: "Study Master", unlocked: false, icon: "/badges/locked.png" },
      { id: "break_10_taken", name: "Break Master", unlocked: false, icon: "/badges/locked.png" },
      { id: "break_25_taken", name: "Break Strategist", unlocked: false, icon: "/badges/locked.png" },
      { id: "longest_30_min", name: "Focused Mind", unlocked: false, icon: "/badges/locked.png" },
      { id: "longest_1_hour", name: "Deep Focus", unlocked: false, icon: "/badges/locked.png" },
      { id: "consistency_week", name: "Weekly Grinder", unlocked: false, icon: "/badges/locked.png" },
    ];

    for (const achievement of allAchievements) {
      await setDoc(doc(db, `users/${userId}/achievements`, achievement.id), achievement);
    }

    console.log("Achievements initialized successfully.");
  } catch (error) {
    console.error("Error initializing achievements:", error);
  }
};

export default initializeAchievements;
