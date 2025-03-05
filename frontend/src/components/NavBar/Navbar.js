import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Squash as Hamburger } from "hamburger-react";
import { loginWithGoogle, logoutUser } from "../../auth.js"; 
import { auth } from "../../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // Reference for closing dropdown on outside click

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName,
          email: currentUser.email,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav>
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <img id="logo" src="favicon.svg" alt="timewise logo" />
          <span id="webapp-title">timewise</span>
        </Link>

        <ul id="navbar" className={`desktop-navbar ${isMenuOpen ? "mobile" : ""}`}>
          {user && (
            <>
              <li><Link to="/calendar">Calendar</Link></li>
              <li><Link to="/taskpage">Tasks</Link></li>
            </>
          )}
        </ul>
      </div>

      <div className="nav-right">
        <Link to="/about" className={`about ${isMenuOpen ? "mobile" : ""}`}>About</Link>{user ? (
          <div className="user-menu-container">
            <button className="user-btn" onClick={() => setDropdownOpen(!isDropdownOpen)}>
              User ▼
            </button>
            {isDropdownOpen && (
              <div ref={dropdownRef} className="dropdown-menu">
                <h3>{user.name}</h3>
                <ul>
                <Link to="/profile" onClick={() => setDropdownOpen(false)}>Profile</Link>
                </ul>
                <ul>
                <Link to="/settings" onClick={() => setDropdownOpen(false)}>Settings</Link>
                </ul>
                <ul>
                <button onClick={() => { logoutUser(setUser); setDropdownOpen(false); }} className="logout-btn">Sign Out</button>
                </ul>
    
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => loginWithGoogle(setUser)} className={`sign-in ${isMenuOpen ? "mobile" : ""}`}>
            Sign In
          </button>
        )}
        

        <div className="hamburger-menu">
          <Hamburger toggled={isMenuOpen} toggle={setMenuOpen} size={28} />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
