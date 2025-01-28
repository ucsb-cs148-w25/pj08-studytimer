import { Link } from 'react-router-dom';
import "./NavbarStyles.css";
import { useState } from 'react';

function Navbar() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <nav>
      <div>
        <Link to="/" className="logo-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.9 595.3">
            {/* Your existing SVG paths */}
          </svg>
          <img id="logo" src="favicon.svg" alt="timewise logo" />
          <span id="webapp-title">timewise</span>
        </Link>
      </div>
      {/* Hamburger menu - hidden on larger screens */}
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!isMenuOpen)}
      >
        ☰
      </button>
      <ul id="navbar" className={isMenuOpen ? "active" : ""}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/calendar">Calendar</Link></li>
        <li><Link to="/task_manager">To-Do List</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li><Link to="/settings">Settings</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
