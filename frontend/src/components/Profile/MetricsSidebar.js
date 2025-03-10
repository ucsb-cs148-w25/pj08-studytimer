import React from "react";
import MetricsChart from "../ToDo/MetricsChart.js";
import TaskCalendarChart from "../ToDo/TaskCalendarChart.js";

const MetricsSidebar = () => {
  return (
    // Just return the content—no extra wrapper class needed
    <>
      <h1>Metrics</h1>
      <TaskCalendarChart />
      <MetricsChart />
    </>
  );
};

export default MetricsSidebar;
