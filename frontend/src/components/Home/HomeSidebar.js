import React from "react";
import "./HomeSidebar.css";
import MetricsChart from "../ToDo/MetricsChart.js";
import TaskCalendarChart from "../ToDo/TaskCalendarChart.js";


const Sidebar = () => {
   return (
     <div className="sidebar">
       <h2>Metrics</h2>
       <TaskCalendarChart />
     </div>
   );
 };
  export default Sidebar;
