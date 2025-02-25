import { signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { auth, provider } from "./firebase";

provider.addScope("https://www.googleapis.com/auth/calendar");

export const BACKEND_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://pj08-studytimer.onrender.com";

export const loginWithGoogle = async (setUser) => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Retrieve Firebase ID token and Google access token.
    const firebaseIdToken = await user.getIdToken();
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const googleAccessToken = credential?.accessToken;
    if (!googleAccessToken) {
      throw new Error("No Google access token received");
    }

    const loggedInUser = {
      name: user.displayName,
      email: user.email,
      firebaseIdToken,  
      googleAccessToken 
    };

    localStorage.setItem("user", JSON.stringify(loggedInUser));
    localStorage.setItem("token", firebaseIdToken); 
    localStorage.setItem("googleToken", googleAccessToken);

    setUser(loggedInUser);

    const authResponse = await fetch(`${BACKEND_URL}/api/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firebaseIdToken}`,
      },
    });

    if (!authResponse.ok) {
      const errorDetails = await authResponse.text();
      console.error("Backend auth error details:", errorDetails);
      throw new Error(`Backend error: ${authResponse.statusText}`);
    }

    await authResponse.json();
  } catch (error) {
    console.error("Login with Google failed:", error);
    throw error;
  }
};

export const logoutUser = (setUser) => {
  signOut(auth)
    .then(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("googleToken");
      setUser(null);
    })
    .catch((error) => {
      console.error("Logout failed:", error);
      throw error;
    });
};
