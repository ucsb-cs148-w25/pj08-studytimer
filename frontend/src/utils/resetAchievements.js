import { getFirestore, collection, doc, setDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const resetAchievements = async () => {
  const auth = getAuth();
  const db = getFirestore();

  if (!auth.currentUser) {
    console.error("User is not authenticated.");
    return;
  }

  const userId = auth.currentUser.uid;
  const achievementsRef = collection(db, `users/${userId}/achievements`);

  try {
    // Fetch all achievements
    const snapshot = await getDocs(achievementsRef);

    if (snapshot.empty) {
      console.log("No achievements found to reset.");
      return;
    }

    console.log(`Resetting achievements for user: ${userId}`);

    // Reset each achievement (lock it again)
    snapshot.docs.forEach(async (achievementDoc) => {
      await setDoc(doc(db, `users/${userId}/achievements`, achievementDoc.id), {
        ...achievementDoc.data(),
        unlocked: false,
        icon: "/badges/locked.png", // Reset to locked icon
      });
      console.log(`Reset achievement: ${achievementDoc.id}`);
    });

    console.log("Achievements reset successfully.");
  } catch (error) {
    console.error("Error resetting achievements:", error);
  }
};

export default resetAchievements;
