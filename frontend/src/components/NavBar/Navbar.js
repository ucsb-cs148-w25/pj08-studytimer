import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Squash as Hamburger } from "hamburger-react";
import { loginWithGoogle, logoutUser } from "../../auth.js"; 
import { auth } from "../../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName,
          email: currentUser.email,
          // photoURL: currentUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

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
            <button onClick={() => logoutUser()} className="logout-btn">
              Sign Out
            </button>
          </div>
        ) : (
          <button onClick={loginWithGoogle} className={`sign-in ${isMenuOpen ? "mobile" : ""}`}>
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
