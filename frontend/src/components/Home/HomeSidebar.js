import React from "react";
import "./HomeSidebar.css";
import MetricsChart from "../ToDo/MetricsChart.js";
import TaskCalendarChart from "../ToDo/TaskCalendarChart.js";


const HomeSidebar = () => {
   return (
     <div className="homesidebar">
        <h1>Metrics</h1>
       <div>
            <TaskCalendarChart />
       </div>
       <div>
        <MetricsChart/></div>
     </div>
   );
 };
  export default HomeSidebar;
