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

    // Extract the OAuth credential to get the Google access token.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    if (!accessToken) {
      throw new Error("No Google access token received");
    }

    const loggedInUser = {
      name: user.displayName,
      email: user.email,
      accessToken,
    };

    localStorage.setItem("user", JSON.stringify(loggedInUser));
    localStorage.setItem("token", accessToken);
    setUser(loggedInUser);

    // Send the access token to the backend.
    const response = await fetch(`${BACKEND_URL}/api/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    await response.json();
  } catch (error) {
    // Handle login error appropriately.
    throw error;
  }
};

export const logoutUser = (setUser) => {
  signOut(auth)
    .then(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    })
    .catch((error) => {
      throw error;
    });
};
