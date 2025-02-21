import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { db, auth } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const TasksCalendarChart = () => {
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
  }, []);

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

  // Get today's date
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const tasksPerDay = new Array(7).fill(0); 

  // **Filter only tasks that are not completed**
  const pendingTasks = tasks.filter((task) => task.status !== "Done");

  // Count pending tasks for each day of the current week
  pendingTasks.forEach((task) => {
    const taskDate = new Date(task.deadline);
    const dayIndex = taskDate.getDay(); 
    
    if (taskDate >= startOfWeek && taskDate < new Date(startOfWeek).setDate(startOfWeek.getDate() + 7)) {
      tasksPerDay[dayIndex]++;
    }
  });

  // Chart Data
  const data = {
    labels: daysOfWeek,
    datasets: [
      {
        label: "Pending Tasks",
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

  // **Render nothing if user is not signed in**
  if (!user) {
    return <p>Please sign in to view your tasks chart.</p>;
  }

  return (
    <div>
      <p>Tasks Remaining This Week</p>
      <div style={{ backgroundColor: "#fff", padding: "10px", borderRadius: "10px" }}>
      <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default TasksCalendarChart;