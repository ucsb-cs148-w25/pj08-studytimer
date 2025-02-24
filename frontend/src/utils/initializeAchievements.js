import { getFirestore, collection, doc, setDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const initializeAchievements = async () => {
  const auth = getAuth();
  const db = getFirestore();

  if (!auth.currentUser) {
    console.error("User is not authenticated.");
    return;
  }

  const userId = auth.currentUser.uid;
  const achievementsRef = collection(db, `users/${userId}/achievements`);

  try {
    // Check if achievements already exist
    const snapshot = await getDocs(achievementsRef);
    if (!snapshot.empty) {
      console.log("Achievements already initialized for this user.");
      return;
    }

    console.log(`Initializing achievements for user: ${userId}`);

    // Default achievements
    const defaultAchievements = [
      { id: "first_timer", name: "First Timer", unlocked: false, icon: "../Profile/badges/locked.png" },
      { id: "study_30_min", name: "Study 30 Minutes", unlocked: false, icon: "../Profile/badges/locked.png" },
      { id: "study_1_hour", name: "Study 1 Hour", unlocked: false, icon: "../Profile/badges/locked.png" },
      { id: "study_3_sessions", name: "3 Study Sessions", unlocked: false, icon: "../Profile/badges/locked.png" },
    ];

    for (const achievement of defaultAchievements) {
      await setDoc(doc(db, `users/${userId}/achievements`, achievement.id), achievement);
      console.log(`Added achievement: ${achievement.name}`);
    }

    console.log("Achievements initialized successfully.");
  } catch (error) {
    console.error("Error initializing achievements:", error);
  }
};

export default initializeAchievements;
