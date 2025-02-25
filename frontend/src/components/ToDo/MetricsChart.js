import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { db, auth } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./MetricsChart.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const MetricsChart = () => {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null); // Track authentication state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchTasks(currentUser.uid);
      } else {
        setTasks([]); // Clear tasks if user logs out
      }
    });

    return () => unsubscribe();
  }, [])

  // Fetch tasks from Firestore
  const fetchTasks = async (uid) => {
    try {
      const querySnapshot = await getDocs(collection(db, `users/${uid}/tasks`));
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Prepare chart data
  const taskStats = {
    labels: ["In Progress", "Completed"],
    datasets: [
      {
        data: [
          tasks.filter((task) => task.completed === false).length,
          tasks.filter((task) => task.completed === true).length
        ],
        backgroundColor: [
          getComputedStyle(document.documentElement).getPropertyValue('--in-progress-color').trim(),
          getComputedStyle(document.documentElement).getPropertyValue('--completed-color').trim()
        ],
        hoverBackgroundColor: [
          getComputedStyle(document.documentElement).getPropertyValue('--in-progress-hover').trim(),
          getComputedStyle(document.documentElement).getPropertyValue('--completed-hover').trim()
        ]
      }
    ]
  };

  // Display percentage of tasks in progress/done
  const chartOptions = {
    cutout: "0%",
    plugins: {
      legend: {
        position: "bottom",  // Move legend below the chart
        labels: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim()
        }
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const dataset = tooltipItem.dataset.data;
            const total = dataset.reduce((sum, value) => sum + value, 0);
            const value = dataset[tooltipItem.dataIndex];
            const percentage = ((value / total) * 100).toFixed(0);
            return `${tooltipItem.label}: ${percentage}% (${value} tasks)`;
          }
        }
      }
    }
  };

  return (
    <div className="chartContainer">
      <p>Total Tasks</p>
      <Doughnut data={taskStats} options={chartOptions} />
    </div>
  );
};

export default MetricsChart;
