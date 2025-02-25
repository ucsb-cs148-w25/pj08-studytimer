import React from "react";
import "./Sidebar.css";
import TaskCalendarChart from "../ToDo/TaskCalendarChart.js";

const Sidebar = () => {
    return (
      <div className="sidebar">
        <h2>Your Events</h2>
        <h2>Upcoming Deadlines</h2>
        <TaskCalendarChart />
        <h2>Recommendations by timewise</h2>
      </div>
    );
  };
  
  export default Sidebar;
  