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
          photoURL: currentUser.photoURL || "/default-profile.png",
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
        {user ? (
          <div className="menu-container" ref={dropdownRef}>
            {/* Profile Image & Dropdown Button */}
            <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="profile-btn">
              <img
                className="nav_profile_picture"
                src={user.photoURL}
                alt="Profile"
                referrerPolicy="no-referrer"
                onError={(e) => (e.target.src = "/default-profile.png")}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <ul>
                  <DropdownItem link="/profile" text="Profile" />
                  <DropdownItem link="/settings" text="Settings" />
                  <DropdownItem isLogout text="Sign Out" onClick={() => logoutUser(setUser)} />
                </ul>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => loginWithGoogle(setUser)} className={`sign-in ${isMenuOpen ? "mobile" : ""}`}>
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

// Dropdown Item Component
function DropdownItem({ link, text, isLogout, onClick }) {
  return (
    <li className="dropdownItem">
      {isLogout ? (
        <button onClick={onClick} className="logout-btn">
          {text}
        </button>
      ) : (
        <Link to={link} className="dropdown-link">
          {text}
        </Link>
      )}
    </li>
  );
}

export default Navbar;