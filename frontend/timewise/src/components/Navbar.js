import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Squash as Hamburger } from 'hamburger-react';
import { fetchUser } from "../api";
import "./NavbarStyles.css";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  (window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"  
    : "https://pj08-studytimer.onrender.com");

function Navbar() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await fetchUser();
        console.log("Fetched user:", result); // Debugging
        if (result?.user) {
          setUser(result.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
  
    getUser();
    const interval = setInterval(getUser, 5000);
    
    return () => clearInterval(interval);
  }, [location]);

  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/login`; // Redirect to Flask OAuth login
  };

  const handleLogout = async () => {
    await fetch(`${BACKEND_URL}/logout`, { credentials: "include" });
    setUser(null);
  };

  return (
    <nav>
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <img id="logo" src="favicon.svg" alt="timewise logo"/>
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
          <div className={`user-profile ${isMenuOpen ? "mobile" : ""}`}>
            <span className="user-name">Hello, {user.given_name}!</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <button 
            onClick={handleLogin} 
            className={`sign-in ${isMenuOpen ? "mobile" : ""}`} 
          >
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