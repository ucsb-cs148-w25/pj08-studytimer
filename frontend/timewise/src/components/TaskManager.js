import React, { useEffect, useState } from "react";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);
// -----------
// TODO:
// 1. store data locally (information saved until localhost connection ends)
// 2. drag and drop to allow users to customly order tasks if does not want to filter
// 3. Undo button?
// -----------
function TaskManager() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  }); // Store all tasks
  const [taskTitle, setTaskTitle] = useState(""); // Input for task title
  const [deadline, setDeadline] = useState(""); // Input for task deadline
  const [priority, setPriority] = useState("Low"); // Input for priority
  const [status] = useState("In Progress"); // Default status
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }); // Sort state
  const [editTaskTitle, setEditTaskTitle] = useState(null); // store title instead of index

  // loads tasks on page load (storing data locally)
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const sensors = useSensors(useSensor(PointerSensor));

  // handle drag and drop
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;  // if drag to outside do nothing

    const activeTask = tasks.find((task) => task.title === active.id);
    const overTask = tasks.find((task) => task.title === over.id);

    // only reorder within table
    if (activeTask.status === overTask.status) {
      const activeIndex = tasks.findIndex((task) => task.title === active.id);
      const overIndex = tasks.findIndex((task) => task.title === over.id);

      setTasks(arrayMove(tasks, activeIndex, overIndex));
    }
  };

  const TaskRow = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.title });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <tr ref={setNodeRef} style={style}>
        <td style={styles.td} {...attributes} {...listeners}>
          <span style={styles.dragHandle}>⠿</span> {task.title}
        </td>
        <td style={styles.td}>{task.deadline}</td>
        <td style={styles.td}>{task.priority}</td>
        <td style={styles.td}>
          {task.status === "In Progress" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                markAsDone(task.title);
              }}
              style={{ ...styles.button, backgroundColor: "#28a745", color: "white" }}
            >
              Mark as Done
            </button>
          )}
          {task.status === "Done" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                markAsInProgress(task.title);
              }}
              style={{ ...styles.button, backgroundColor: "#ffc107", color: "black" }}
            >
              Move to In Progress
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              startEditing(task.title)
            }}
            style={{ ...styles.button, backgroundColor: "#007bff", color: "white" }}
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.title);
            }}
            style={{ ...styles.button, backgroundColor: "#dc3545", color: "white" }}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  }

  // Add a new task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (taskTitle.trim() && deadline.trim()) {
      const newTask = { title: taskTitle, deadline, priority, status };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks); // Add new task to the list
      setTaskTitle(""); // Clear inputs
      setDeadline("");
      setPriority("Low");
    } else {
      alert("Please enter a valid task title and deadline!");
    }
  };

  // Move a task to the "Done" section
  const markAsDone = (title) => {
    setTasks(tasks.map(task => task.title === title ? { ...task, status: "Done" } : task));
  };

  // Move a task back to "In Progress"
  const markAsInProgress = (title) => {
    setTasks(tasks.map(task => task.title === title ? { ...task, status: "In Progress" } : task));
  };

  // Delete a task
  const deleteTask = (title) => {
    setTasks(tasks.filter(task => task.title !== title));
  };

  // Edit a task
  const startEditing = (title) => {
    const taskToEdit = tasks.find(task => task.title === title);
    setTaskTitle(taskToEdit.title);
    setDeadline(taskToEdit.deadline);
    setPriority(taskToEdit.priority);
    setEditTaskTitle(title);
  };

  // Save edited task
  const saveEdit = () => {
    if (taskTitle.trim() && deadline.trim()) {
      // find index of task to edit
      const taskIndex = tasks.findIndex((task) => task.title === editTaskTitle);

      if (taskIndex !== -1) {
        const updatedTasks = [...tasks];
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          title: taskTitle,
          deadline,
          priority,
        };

        // update state
        setTasks(updatedTasks);
        setTaskTitle("");
        setDeadline("");
        setPriority("Low");
        setEditTaskTitle(null); // Exit edit mode 
      }
    } else {
      alert("Please enter a valid task title and deadline!");
    }
  };

  // filters priority correctly (instead of alphabetically)
  const priorityOrder = {
    High: 3,
    Medium: 2,
    Low: 1,
  };

  // Sort tasks by column
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedTasks = [...tasks].sort((a, b) => {
      if (key === "priority") {
        return direction === "asc"
          ? priorityOrder[a[key]] - priorityOrder[b[key]]
          : priorityOrder[b[key]] - priorityOrder[a[key]];
      } else {
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        return 0;
      }
    });
    setTasks(sortedTasks);
  };
// Metrics chart for task statistics
  const taskStats = {
    labels: ["In Progress", "Done"],
    datasets: [
      {
        data: [
          tasks.filter((task) => task.status === "In Progress").length,
          tasks.filter((task) => task.status === "Done").length,
        ],
        backgroundColor: ["#87CEEB", "#CD5C5C"], // Yellow for In Progress, Green for Done
        hoverBackgroundColor: ["#ADD8E6", "#F08080"],
      },
    ],
  };

// display percentage of tasks inprogress/done
  const chartOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const dataset = tooltipItem.dataset.data;
            const total = dataset.reduce((sum, value) => sum + value, 0);
            const value = dataset[tooltipItem.dataIndex];
            const percentage = ((value / total) * 100).toFixed(0);
            return `${tooltipItem.label}: ${percentage}% (${value} tasks)`;
          },
        },
      },
    },
  };

  const renderTaskTable = (tasksToShow) => (
    <SortableContext items={tasksToShow.map(task => task.title)}>
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
          {tasksToShow.length > 0 ? tasksToShow.map(task => (
            <TaskRow key={task.title} task={task} />
          )) : (
            <tr><td colSpan="4" style={styles.td}>No tasks available.</td></tr>
          )}
        </tbody>
      </table>
    </SortableContext>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>My Tasks</h1>
      
      {/* Render Metrics Chart */} 
      <div style={{ width: "300px", marginBottom: "50px" }}><Doughnut data={taskStats} options={chartOptions}/></div>

      {/* Form to add or edit a task */}
      <form onSubmit={editTaskTitle !== null ? (e) => { e.preventDefault(); saveEdit(); } : handleAddTask} style={styles.form}>
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
          {editTaskTitle !== null ? "Save Task" : "Add Task"}
        </button>
        {editTaskTitle !== null && (
          <button
            onClick={() => {
              setEditTaskTitle(null);
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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {tasks.filter((task) => task.status === "In Progress").length > 0
          ? renderTaskTable(tasks.filter((task) => task.status === "In Progress"), "In Progress")
          : <p style={styles.noTasks}>No tasks in progress.</p>}
      </DndContext>
      {/* Done Section */}
      <h2 style={styles.sectionHeader}>Done</h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {tasks.filter((task) => task.status === "Done").length > 0
          ? renderTaskTable(tasks.filter((task) => task.status === "Done"), "Done")
          : <p style={styles.noTasks}>No completed tasks.</p>}
      </DndContext>
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
