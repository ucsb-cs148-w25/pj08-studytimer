import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Squash as Hamburger } from 'hamburger-react';
import "./NavbarStyles.css";

function Navbar() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <nav>
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <img id="logo" src="favicon.svg" alt="timewise logo"/>
          <span id="webapp-title">timewise</span>
        </Link>

        <ul id="navbar" className={`desktop-navbar ${isMenuOpen ? "active" : ""}`}>
          <li><Link to="/calendar">Calendar</Link></li>
          <li><Link to="/task_manager">To-Do</Link></li>
          <li><Link to="/settings">Settings</Link></li>
        </ul>
      </div>

      <div className="nav-right">
        <Link to="/profile" className="user-profile">
          <span className="user-name">Hello! NAME</span>
        </Link>
        <Link to="/about" className="about-link">About</Link>

        <div className="hamburger-menu">
          <Hamburger toggled={isMenuOpen} toggle={setMenuOpen} />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;