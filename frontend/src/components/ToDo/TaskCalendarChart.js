import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { db, auth } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const TasksCalendarChart = () => {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchAllTasks(currentUser.uid);
      } else {
        setTasks([]); 
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAllTasks = async (uid) => {
    try {
      const listsSnapshot = await getDocs(collection(db, `users/${uid}/lists`));
      const listsData = listsSnapshot.docs.map((docSnap) => docSnap.id);

      let allTasks = [];
      for (const listId of listsData) {
        const tasksSnapshot = await getDocs(
          collection(db, `users/${uid}/lists/${listId}/tasks`)
        );
        const tasksForList = tasksSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          listId,
          ...docSnap.data(),
        }));
        allTasks = allTasks.concat(tasksForList);
      }
      setTasks(allTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  if (!user) {
    return <p>Please sign in to view your task metrics.</p>;
  }

  // Dates for the current week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
  endOfWeek.setHours(23, 59, 59, 999);

  // Filter out only pending (not completed) tasks
  const pendingTasks = tasks.filter((task) => task.completed !== true);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const tasksByDay = Array.from({ length: 7 }, () => []);

  pendingTasks.forEach((task) => {
    const taskDate = new Date(task.deadline);
    const dayIndex = taskDate.getDay();
    if (taskDate >= startOfWeek && taskDate < endOfWeek) {
      tasksByDay[dayIndex].push(task);
    }
  });

  // Use tasksByDay to get a count for each day
  const tasksPerDay = tasksByDay.map((tasksForDay) => tasksForDay.length);

  // Chart configuration
  const data = {
    labels: daysOfWeek,
    datasets: [
      {
        label: "Pending Tasks",
        data: tasksPerDay,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--in-progress-color').trim(),
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--in-progress-color').trim(),
        borderWidth: 1,
      },
    ],
  };


  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            // Show the day label in the tooltip title
            const dayIndex = tooltipItems[0].dataIndex;
            return daysOfWeek[dayIndex];
          },
          label: (tooltipItem) => {
            const dayIndex = tooltipItem.dataIndex;
            const tasksForThisDay = tasksByDay[dayIndex] || [];

            if (tasksForThisDay.length === 0) {
              return "No pending tasks";
            }

            // Display number of pending tasks
            const lines = [`${tasksForThisDay.length} pending tasks:`];

            // Show at most five tasks due to chart's dimensions
            const displayedTasks = tasksForThisDay.slice(0, 5);
            displayedTasks.forEach((task) => {
              lines.push(`• ${task.text || "Untitled Task"}`);
            });

            // If the total number of tasks is greater than 5, display "..." at the end
            if (tasksForThisDay.length > 6) {
              lines.push("• ...");
            }

            return lines;
          },
        },
      },
    },
  };

  return (
    <div>
      <p>This Week's Pending Tasks</p>
      <div style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "10px", overflow: "visible" }}>
      <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default TasksCalendarChart;