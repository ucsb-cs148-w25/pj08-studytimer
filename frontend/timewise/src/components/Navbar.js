import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Squash as Hamburger } from 'hamburger-react';
import "./Navbar.css";

function Navbar() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken"); 
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

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
        {isLoggedIn ? (
          <Link to="/profile" className={`user-profile ${isMenuOpen ? "mobile" : ""}`}>
            <span className="user-name">Hello! NAME</span>
          </Link>
        ) : (
          <a href="/login/oauth2/code/google" className={`sign-in ${isMenuOpen ? "mobile" : ""}`}>
            Sign In!
          </a>
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