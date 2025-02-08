import React from "react";
import Header from "./Header"; // Import Header
import Sidebar from "./Sidebar"; // Import Sidebar
import CalendarEmbed from "./CalendarEmbed" // import embed
import "./CalendarPage.css"; // Import styles for layout

const CalendarPage = () => {
  return (
    <div className="calendar-page">
      <Header />
      <div className="main-content">
        <CalendarEmbed className="calendarEmbed"/>
        <Sidebar />
      </div>
    </div>
  );
};

export default CalendarPage;
