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
  const userMenuRef = useRef(null);

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

  // Close desktop dropdown when clicking outside the user menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobileMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logoutUser(setUser);
    closeMobileMenu();
  };

  return (
    <nav>
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <img id="logo" src="favicon.svg" alt="timewise logo" />
          <span id="webapp-title">timewise</span>
        </Link>
        {/* Original Desktop Navbar */}
        <ul id="navbar" className="desktop-navbar">
          {user && (
            <>
              <li><Link to="/calendar">Calendar</Link></li>
              <li><Link to="/taskpage">Tasks</Link></li>
            </>
          )}
        </ul>
      </div>

      <div className="nav-right">
        {/* Original Desktop About Link */}
        <Link to="/about" className="about">About</Link>
        {user ? (
          <div className="user-menu-container" ref={userMenuRef}>
            <button className="user-btn" onClick={() => setDropdownOpen(!isDropdownOpen)}>
              User ▼
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <h3>{user.name}</h3>
                <ul>
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>Profile</Link>
                </ul>
                <ul>
                  <Link to="/community" onClick={() => setDropdownOpen(false)}>Community</Link>
                </ul>
                <ul>
                  <Link to="/settings" onClick={() => setDropdownOpen(false)}>Settings</Link>
                </ul>
                <ul>
                  <button 
                    onClick={() => {
                      logoutUser(setUser);
                      setDropdownOpen(false);
                    }} 
                    className="logout-btn"
                  >
                    Sign Out
                  </button>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => loginWithGoogle(setUser)} className="sign-in">
            Sign In
          </button>
        )}

        {/* Hamburger menu for mobile */}
        <div className="hamburger-menu">
          <Hamburger toggled={isMenuOpen} toggle={setMenuOpen} size={28} />
        </div>
      </div>

      {/* Mobile Menu Dropdown (non-fullscreen) */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <ul>
            {user ? (
              <>
                <li onClick={closeMobileMenu}><Link to="/calendar">Calendar</Link></li>
                <li onClick={closeMobileMenu}><Link to="/taskpage">Tasks</Link></li>
                <li onClick={closeMobileMenu}><Link to="/profile">Profile</Link></li>
                <li onClick={closeMobileMenu}><Link to="/community">Community</Link></li>
                <li onClick={closeMobileMenu}><Link to="/settings">Settings</Link></li>
                <li onClick={closeMobileMenu}><Link to="/about">About</Link></li>
              </>
            ) : (
              <>
                <li onClick={closeMobileMenu}><Link to="/about">About</Link></li>
                <li>
                  <button
                    onClick={() => {
                      loginWithGoogle(setUser);
                      closeMobileMenu();
                    }}
                    className="sign-in"
                  >
                    Sign In
                  </button>
                </li>
              </>
            )}
          </ul>
          {user && (
            <div className="mobile-logout">
              <button onClick={handleLogout} className="logout-btn">Sign Out</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
