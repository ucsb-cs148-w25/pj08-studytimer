import React, { useEffect } from "react";
import { loginWithGoogle } from "../../auth.js";

const Login = ({ setUser }) => {
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, [setUser]);

  return (
    <button onClick={() => loginWithGoogle(setUser)} className="bg-blue-500 text-white p-2 rounded">
      Login with Google
    </button>
  );
};

export default Login;
