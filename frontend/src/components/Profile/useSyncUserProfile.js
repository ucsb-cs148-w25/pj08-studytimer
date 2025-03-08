import { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const useSyncUserProfile = () => {
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const syncProfile = async () => {
      if (auth.currentUser) {
        // Refresh the user's profile info.
        await auth.currentUser.reload();
        const currentUser = auth.currentUser;
        try {
          // Write or update the user's Firestore document with the latest info.
          await setDoc(
            doc(db, 'users', currentUser.uid),
            {
              displayName: currentUser.displayName || 'Anonymous',
              photoURL: currentUser.photoURL || 'https://via.placeholder.com/40',
            },
            { merge: true }
          );
          console.log('User profile synced to Firestore.');
        } catch (error) {
          console.error('Failed to sync user profile:', error);
        }
      }
    };

    // Run on mount.
    syncProfile();

    // Set up an interval to sync every minute (60000ms).
    const intervalId = setInterval(syncProfile, 60000);
    return () => clearInterval(intervalId);
  }, [auth.currentUser, db]);
};

export default useSyncUserProfile;
