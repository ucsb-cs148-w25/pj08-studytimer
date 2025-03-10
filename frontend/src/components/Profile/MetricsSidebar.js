import React from "react";
import "./MetricsSidebar.css";
import MetricsChart from "../ToDo/MetricsChart.js";
import TaskCalendarChart from "../ToDo/TaskCalendarChart.js";


const MetricsSidebar = () => {
   return (
     <div className="metricssidebar">
        <h1>Metrics</h1>
          <TaskCalendarChart />
          <MetricsChart />
     </div>
   );
 };
  export default MetricsSidebar;
