import React from "react";
// import Sidebar from "./Sidebar"; // Import Sidebar
import CalendarEmbed from "./CalendarEmbed" // import embed
import "./CalendarPage.css"; // Import styles for layout

const CalendarPage = () => {
  return (
    <div className="calendar-page">
      <div className="main-content">
        <CalendarEmbed className="calendarEmbed"/>
      </div>
    </div>
  );
};

export default CalendarPage;
