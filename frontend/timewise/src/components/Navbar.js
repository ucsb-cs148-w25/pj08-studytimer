import { Link } from 'react-router-dom';
import "./NavbarStyles.css";

function Navbar() {
  return(
    <nav>
      <Link to="/">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.9 595.3">
          {/* Your existing SVG paths */}
        </svg>
        <img id="logo" src="favicon.png" alt="timewise logo"/>
        <span id="webapp-title">timewise</span>
      </Link>
      <div>
        <ul id="navbar">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/calendar">Calendar</Link></li>
          <li><Link to="/task_manager">To-Do List</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/settings">Settings</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar;
