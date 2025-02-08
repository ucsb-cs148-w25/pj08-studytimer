import React, { useEffect, useState } from "react";
import "./Settings.css";
import "../index.css";  // Ensures the theme is applied

const SettingsPage = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="settings">
      <h2>Choose Theme</h2>
      <div className="theme-options">
        <button className="theme-btn" onClick={() => setTheme("dark")}>
          Dark
        </button>
        <button className="theme-btn" onClick={() => setTheme("light")}>
          Light
        </button>
        <button className="theme-btn" onClick={() => setTheme("sky")}>
          Sky
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
