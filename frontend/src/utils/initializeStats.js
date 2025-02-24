import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const initializeStats = async () => {
  const auth = getAuth();
  const db = getFirestore();

  if (!auth.currentUser) {
    console.error("User is not authenticated.");
    return;
  }

  const userId = auth.currentUser.uid;
  const statsRef = doc(db, `users/${userId}`);

  try {
    const statsSnap = await getDoc(statsRef);

    if (!statsSnap.exists() || !statsSnap.data().stats) {
      console.log("Initializing stats for new user...");
      await setDoc(statsRef, {
        stats: {
          totalStudyTime: 0,
          totalBreaksTaken: 0,
          studySessions: 0,
          longestSession: 0,
          lastSessionDate: "N/A",
        },
      }, { merge: true }); // Merge prevents overwriting other data
      console.log("Stats initialized successfully.");
    } else {
      console.log("Stats already exist.");
    }
  } catch (error) {
    console.error("Error initializing stats:", error);
  }
};

export default initializeStats;
