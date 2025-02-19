import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const TaskCalendarChart = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(storedTasks);
  }, []);

  // Get today's date
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday

  // Create an array for each day of the week
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const tasksPerDay = new Array(7).fill(0); // Array to store task counts per day

  // **Filter only tasks that are not completed**
  const pendingTasks = tasks.filter((task) => task.status !== "Done");

  // Count pending tasks for each day of the current week
  pendingTasks.forEach((task) => {
    const taskDate = new Date(task.deadline);
    const dayIndex = taskDate.getDay(); // Get index (0 = Sunday, 6 = Saturday)
    
    if (taskDate >= startOfWeek && taskDate < new Date(startOfWeek).setDate(startOfWeek.getDate() + 7)) {
      tasksPerDay[dayIndex]++;
    }
  });

  // Chart Data
  const data = {
    labels: daysOfWeek, // Days of the week on x-axis
    datasets: [
      {
        label: "In Progress Tasks",
        data: tasksPerDay,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--in-progress-color').trim(), // Yellow to indicate pending tasks
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--in-progress-color').trim(),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1, // Adjust step size dynamically
        },
      },
    },
  };

  return (
    <div>
      <h4>Due This Week</h4>
      <div style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "10px" }}>
        <Bar data={data} options={options} />
    </div>
    </div>
  );
};

export default TaskCalendarChart;
