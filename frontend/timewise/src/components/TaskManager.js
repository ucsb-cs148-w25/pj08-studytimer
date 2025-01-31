import React, { useState } from "react";
import DoughnutChart from "./DoughnutChart";

function TaskManager() {
  const [tasks, setTasks] = useState([]); // Store all tasks
  const [taskTitle, setTaskTitle] = useState(""); // Input for task title
  const [deadline, setDeadline] = useState(""); // Input for task deadline
  const [priority, setPriority] = useState("Low"); // Input for priority
  const [status] = useState("In Progress"); // Default status
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }); // Sort state
  const [editIndex, setEditIndex] = useState(null); // Track the task being edited

  // Add a new task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (taskTitle.trim() && deadline.trim()) {
      const newTask = { title: taskTitle, deadline, priority, status };
      setTasks([...tasks, newTask]); // Add new task to the list
      setTaskTitle(""); // Clear inputs
      setDeadline("");
      setPriority("Low");
    } else {
      alert("Please enter a valid task title and deadline!");
    }
  };

  // Move a task to the "Done" section
  const markAsDone = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].status = "Done";
    setTasks(updatedTasks);
  };

  // Move a task back to "In Progress"
  const markAsInProgress = (index) => {
    const taskToUpdate = tasks.findIndex((task) => 
      task.status === "Done" && tasks.indexOf(task) === index
    );
    if (taskToUpdate !== -1) {
      const updatedTasks = [...tasks];
      updatedTasks[taskToUpdate].status = "In Progress";
      setTasks(updatedTasks);
    }
  };

  // Delete a task
  const deleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // Edit a task
  const startEditing = (index) => {
    const taskToEdit = tasks[index];
    setTaskTitle(taskToEdit.title);
    setDeadline(taskToEdit.deadline);
    setPriority(taskToEdit.priority);
    setEditIndex(index);
  };

  // Save edited task
  const saveEdit = () => {
    if (taskTitle.trim() && deadline.trim()) {
      const updatedTasks = [...tasks];
      updatedTasks[editIndex] = {
        ...updatedTasks[editIndex],
        title: taskTitle,
        deadline,
        priority,
      };
      setTasks(updatedTasks);
      setTaskTitle("");
      setDeadline("");
      setPriority("Low");
      setEditIndex(null); // Exit edit mode
    } else {
      alert("Please enter a valid task title and deadline!");
    }
  };

  // Sort tasks by column
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedTasks = [...tasks].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setTasks(sortedTasks);
  };

  const renderTaskTable = (tasksToShow, status) => (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th} onClick={() => handleSort("title")}>
            Task Title {sortConfig.key === "title" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
          </th>
          <th style={styles.th} onClick={() => handleSort("deadline")}>
            Deadline {sortConfig.key === "deadline" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
          </th>
          <th style={styles.th} onClick={() => handleSort("priority")}>
            Priority {sortConfig.key === "priority" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
          </th>
          <th style={styles.th}>Actions</th>
        </tr>
      </thead>
      <tbody>
      {tasksToShow.map((task) => {
        const originalIndex = tasks.indexOf(task); // Get the correct index in the original tasks array
        return (
          <tr key={originalIndex}>
            <td style={styles.td}>{task.title}</td>
            <td style={styles.td}>{task.deadline}</td>
            <td style={styles.td}>{task.priority}</td>
            <td style={styles.td}>
              {status === "In Progress" && (
                <button
                  onClick={() => markAsDone(originalIndex)}
                  style={{ ...styles.button, backgroundColor: "#28a745", color: "white" }}
                >
                  Mark as Done
                </button>
              )}
              {status === "Done" && (
                <button
                  onClick={() => markAsInProgress(originalIndex)}
                  style={{ ...styles.button, backgroundColor: "#ffc107", color: "black" }}
                >
                  Move to In Progress
                </button>
              )}
              <button
                onClick={() => startEditing(originalIndex)}
                style={{ ...styles.button, backgroundColor: "#007bff", color: "white" }}
              >
                Edit
              </button>
              <button
                onClick={() => deleteTask(originalIndex)}
                style={{ ...styles.button, backgroundColor: "#dc3545", color: "white" }}
              >
                Delete
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

return (
    <div style={styles.container}>
      <h1 style={styles.header}>My Tasks</h1>
      <DoughnutChart tasks={tasks} />

      {/* Form to add or edit a task */}
      <form onSubmit={editIndex !== null ? (e) => { e.preventDefault(); saveEdit(); } : handleAddTask} style={styles.form}>
        <input
          type="text"
          placeholder="Task Title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          style={styles.input}
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          style={styles.input}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={styles.input}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button type="submit" style={styles.button}>
          {editIndex !== null ? "Save Task" : "Add Task"}
        </button>
        {editIndex !== null && (
          <button
            onClick={() => {
              setEditIndex(null);
              setTaskTitle("");
              setDeadline("");
              setPriority("Low");
            }}
            style={{ ...styles.button, backgroundColor: "#6c757d", color: "white" }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* In Progress Section */}
      <h2 style={styles.sectionHeader}>In Progress</h2>
      {tasks.filter((task) => task.status === "In Progress").length > 0
        ? renderTaskTable(tasks.filter((task) => task.status === "In Progress"), "In Progress")
        : <p style={styles.noTasks}>No tasks in progress.</p>}

      {/* Done Section */}
      <h2 style={styles.sectionHeader}>Done</h2>
      {tasks.filter((task) => task.status === "Done").length > 0
        ? renderTaskTable(tasks.filter((task) => task.status === "Done"), "Done")
        : <p style={styles.noTasks}>No completed tasks.</p>}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#282c34",
    color: "white",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    padding: "20px",
  },
  header: {
    fontSize: "2rem",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ddd",
    outline: "none",
  },
  button: {
    padding: "12px 20px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#61dafb",
    color: "black",
    cursor: "pointer",
    transition: "all 0.3s ease",
    margin: "0 8px",
  },
  sectionHeader: {
    fontSize: "1.5rem",
    marginTop: "20px",
  },
  table: {
    width: "80%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  th: {
    border: "1px solid white",
    padding: "10px",
    textAlign: "left",
    backgroundColor: "#3a3f47",
    cursor: "pointer",
  },
  td: {
    border: "1px solid white",
    padding: "10px",
    textAlign: "left",
  },
  noTasks: {
    marginTop: "20px",
    fontSize: "1.2rem",
  },
};

export default TaskManager;
