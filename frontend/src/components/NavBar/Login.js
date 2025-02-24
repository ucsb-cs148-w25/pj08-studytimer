import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
export const loginWithGoogle = async (setUser) => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential.accessToken; 
    if (!accessToken) {
      throw new Error("No access token received from Google.");
    }
    const loggedInUser = {
      name: user.displayName,
      email: user.email,
      accessToken: accessToken,
    };
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    localStorage.setItem("token", accessToken);
    setUser(loggedInUser);
  } catch (error) {
    console.error("Login failed:", error);
  }
};
