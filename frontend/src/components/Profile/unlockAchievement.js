import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const unlockAchievement = async (achievementId) => {
  const auth = getAuth();
  const db = getFirestore();

  if (!auth.currentUser) return;

  const userId = auth.currentUser.uid;
  const achievementRef = doc(db, `users/${userId}/achievements/${achievementId}`);

  try {
    const achievementSnap = await getDoc(achievementRef);
    if (achievementSnap.exists() && !achievementSnap.data().unlocked) {
      await updateDoc(achievementRef, {
        unlocked: true,
        icon: "/badges/badge.png",
      });
      console.log(`Achievement "${achievementId}" unlocked!`);
    }
  } catch (error) {
    console.error("Error unlocking achievement:", error);
  }
};

export default unlockAchievement;
