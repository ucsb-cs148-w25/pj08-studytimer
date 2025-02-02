import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Squash as Hamburger } from "hamburger-react";
import { auth, provider, signInWithPopup, signOut } from "../firebase";
import "./NavbarStyles.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setMenuOpen] = useState(false);

  // Load user from localStorage on page load
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogin = async () => {
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

  const handleLogout = () => {
    console.log("Logging out...");
    signOut(auth)
      .then(() => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      })
      .catch((error) => console.error("Logout failed", error));
  };

  return (
    <nav>
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <img id="logo" src="favicon.svg" alt="timewise logo" />
          <span id="webapp-title">timewise</span>
        </Link>

        <ul id="navbar" className={`desktop-navbar ${isMenuOpen ? "mobile" : ""}`}>
          <li><Link to="/calendar">Calendar</Link></li>
          <li><Link to="/task_manager">To-Do</Link></li>
          <li><Link to="/settings">Settings</Link></li>
        </ul>
      </div>

      <div className="nav-right">
        {user ? (
          <div className="user-info">
            <span className="user-name">Hello, {user.name.split(" ")[0]}!</span>
            <button onClick={handleLogout} className="logout-btn">Sign Out</button>
          </div>
        ) : (
          <button onClick={handleLogin} className={`sign-in ${isMenuOpen ? "mobile" : ""}`}>
            Sign In
          </button>
        )}
        <Link to="/about" className={`about ${isMenuOpen ? "mobile" : ""}`}>About</Link>

        <div className="hamburger-menu">
          <Hamburger toggled={isMenuOpen} toggle={setMenuOpen} size={28} />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
