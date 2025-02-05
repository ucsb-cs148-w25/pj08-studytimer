import { auth, provider, signInWithPopup, signOut } from "./firebase";

const BACKEND_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://pj08-studytimer.onrender.com";

export const loginWithGoogle = async (setUser) => {
  try {
    console.log("Logging in...");
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const loggedInUser = {
      name: user.displayName,
      email: user.email,
    };

    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    const idToken = await user.getIdToken();
    localStorage.setItem("token", idToken);

    // Send the ID token to the backend
    const response = await fetch(`${BACKEND_URL}/api/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Backend Response:", data);
  } catch (error) {
    console.error("Login failed:", error);
  }
};

export const logoutUser = (setUser) => {
  console.log("Logging out...");
  signOut(auth)
    .then(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    })
    .catch((error) => console.error("Logout failed", error));
};
