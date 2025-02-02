import React from "react";
import { auth, provider, signInWithPopup } from "../firebase";

const Login = ({ setUser }) => {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user); // Store user info in state
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <button onClick={handleLogin} className="bg-blue-500 text-white p-2 rounded">
      Login with Google
    </button>
  );
};

export default Login;