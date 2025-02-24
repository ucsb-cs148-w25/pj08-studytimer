import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const resetStats = async () => {
  const auth = getAuth();
  const db = getFirestore();

  if (!auth.currentUser) return;

  const userId = auth.currentUser.uid;
  const statsRef = doc(db, `users/${userId}`);

  try {
    await updateDoc(statsRef, {
      stats: {
        totalStudyTime: 0,
        totalBreaksTaken: 0,
        studySessions: 0,
        longestSession: 0,
        lastSessionDate: "N/A",
      },
    });
    console.log("User stats have been reset.");
  } catch (error) {
    console.error("Error resetting stats:", error);
  }
};

export default resetStats;
