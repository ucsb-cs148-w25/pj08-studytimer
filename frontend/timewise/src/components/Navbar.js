import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Squash as Hamburger } from 'hamburger-react';
import { BACKEND_URL, fetchUser, login, logout } from '../api';
import "./NavbarStyles.css";

function Navbar() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await fetchUser();
        console.log("Fetched user:", result); // Should log { error: "User not logged in" } or user data
        if (!result.error) {
          setUser(result);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      }
    };

    getUser();
    const interval = setInterval(getUser, 5000);
    return () => clearInterval(interval);
  }, [location]);

  const handleLogin = () => {
    login(); // Redirects to Flask OAuth login
  };

  const handleLogout = async () => {
    await logout(); // Logs out and clears session cookies
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
            <span className="user-name">
              Hello, {user.given_name || user.name || "User"}!
            </span>
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