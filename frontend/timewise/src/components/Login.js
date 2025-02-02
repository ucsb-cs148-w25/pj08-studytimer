import React, { useEffect } from "react";
import { auth, provider, signInWithPopup } from "../firebase";

const Login = ({ setUser }) => {
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, [setUser]);

  const handleLogin = async () => {
    try {
      console.log("Attempting login...");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);

      const userData = {
        name: user.displayName,
        email: user.email,
      };
      localStorage.setItem("user", JSON.stringify(userData));

      // Get Firebase ID token
      const idToken = await user.getIdToken();
      localStorage.setItem("token", idToken); // Store token for API use

      // Send the ID token to the backend
      const response = await fetch("http://localhost:8080/api/auth/google", {
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

  return (
    <button onClick={handleLogin} className="bg-blue-500 text-white p-2 rounded">
      Login with Google
    </button>
  );
};

export default Login;
