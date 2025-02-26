import React, { useEffect, useState } from "react";
import "./Settings.css";

const SettingsPage = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="settings">
      <h2>Choose Theme</h2>
      <div className="theme-options">
        <button className="theme-btn" onClick={() => setTheme("light")}>
          Light
        </button>
        <button className="theme-btn" onClick={() => setTheme("dark")}>
          Dark
        </button>
        <button className="theme-btn" onClick={() => setTheme("forest")}>
          Pistachio
        </button>
        {/* <button className="theme-btn" onClick={() => setTheme("playdoh")}>
          Play-Doh
        </button> */}
      </div>
    </div>
  );
};

export default SettingsPage;
