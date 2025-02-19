import React, { useEffect, useState } from "react";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import MetricsChart from "./MetricsChart"; // The separated chart component
import "./TaskManager.css"; 

import { db, auth } from "../../firebase";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import LoginModal from "./AddModal";

function TaskManager() {
  // State
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

  // Local storage effect
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // DnD kit
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((task) => task.title === active.id);
    const overTask = tasks.find((task) => task.title === over.id);

    // Only reorder within the same status
    if (activeTask.status === overTask.status) {
      const activeIndex = tasks.findIndex((task) => task.title === active.id);
      const overIndex = tasks.findIndex((task) => task.title === over.id);
      setTasks(arrayMove(tasks, activeIndex, overIndex));
    }
  };

  // Sortable row component
  const TaskRow = ({ task }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition
    } = useSortable({ id: task.title });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition
    };

    return (
      <tr ref={setNodeRef} style={style}>
        <td className="td" {...attributes} {...listeners}>
          <span className="dragHandle">⠿</span> {task.title}
        </td>
        <td className="td">{task.deadline}</td>
        <td className="td">{task.priority}</td>
        <td className="td">
          {task.status === "In Progress" && (
            <button
              className="button buttonGreen"
              onClick={(e) => {
                e.stopPropagation();
                markAsDone(task.title);
              }}
            >
              Mark as Done
            </button>
          )}
          {task.status === "Done" && (
            <button
              className="button buttonYellow"
              onClick={(e) => {
                e.stopPropagation();
                markAsInProgress(task.title);
              }}
            >
              Move to In Progress
            </button>
          )}
          <button
            className="button buttonBlue"
            onClick={(e) => {
              e.stopPropagation();
              startEditing(task.title);
            }}
          >
            Edit
          </button>
          <button
            className="button buttonRed"
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.title);
            }}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  };

  // Add a new task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (taskTitle.trim() && deadline.trim()) {
      const newTask = { title: taskTitle, deadline, priority, status };
      setTasks((prev) => [...prev, newTask]);
      setTaskTitle("");
      setDeadline("");
      setPriority("Low");
    } else {
      alert("Please enter a valid task title and deadline!");
    }
  };

  // Move a task to Done
  const markAsDone = (title) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.title === title ? { ...task, status: "Done" } : task
      )
    );
  };

  // Move a task to In Progress
  const markAsInProgress = (title) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.title === title ? { ...task, status: "In Progress" } : task
      )
    );
  };

  // Delete a task
  const deleteTask = (title) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.title !== title));
  };

  // Editing
  const startEditing = (title) => {
    const taskToEdit = tasks.find((t) => t.title === title);
    setTaskTitle(taskToEdit.title);
    setDeadline(taskToEdit.deadline);
    setPriority(taskToEdit.priority);
    setEditTaskTitle(title);
  };

  const saveEdit = (e) => {
    e.preventDefault();
    if (taskTitle.trim() && deadline.trim()) {
      const updatedTasks = [...tasks];
      const taskIndex = updatedTasks.findIndex((t) => t.title === editTaskTitle);
      if (taskIndex !== -1) {
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          title: taskTitle,
          deadline,
          priority
        };
        setTasks(updatedTasks);
        // Clear form
        setTaskTitle("");
        setDeadline("");
        setPriority("Low");
        setEditTaskTitle(null);
      }
    } else {
      alert("Please enter a valid task title and deadline!");
    }
  };

  // Priority custom sorting
  const priorityOrder = {
    High: 3,
    Medium: 2,
    Low: 1
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

  // Utility to render table
  const renderTaskTable = (tasksToShow) => (
    <SortableContext items={tasksToShow.map((t) => t.title)}>
      <table className="table">
        <thead>
          <tr>
            <th className="th" onClick={() => handleSort("title")}>
              Task Title
              {sortConfig.key === "title"
                ? sortConfig.direction === "asc"
                  ? " ↑"
                  : " ↓"
                : ""}
            </th>
            <th className="th" onClick={() => handleSort("deadline")}>
              Deadline
              {sortConfig.key === "deadline"
                ? sortConfig.direction === "asc"
                  ? " ↑"
                  : " ↓"
                : ""}
            </th>
            <th className="th" onClick={() => handleSort("priority")}>
              Priority
              {sortConfig.key === "priority"
                ? sortConfig.direction === "asc"
                  ? " ↑"
                  : " ↓"
                : ""}
            </th>
            <th className="th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasksToShow.length > 0 ? (
            tasksToShow.map((task) => <TaskRow key={task.title} task={task} />)
          ) : (
            <tr>
              <td className="td" colSpan="4">
                No tasks available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </SortableContext>
  );

  return (
    <div className="container">
      {/* Chart component */}
      <MetricsChart tasks={tasks} />

      {/* Form to add or edit a task */}
      <span className="newEntryQuestion">Have a New Task? </span>
      <form
        className="form"
        onSubmit={
          editTaskTitle !== null ? (e) => saveEdit(e) : (e) => handleAddTask(e)
        }
      >
        <input
          type="text"
          placeholder="Title of Task (ie. H05)"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          className="input"
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="input"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="input"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button type="submit" className="button">
          {editTaskTitle !== null ? "Save Task" : "Add Task"}
        </button>

        {editTaskTitle !== null && (
          <button
            className="button buttonGray"
            onClick={() => {
              setEditTaskTitle(null);
              setTaskTitle("");
              setDeadline("");
              setPriority("Low");
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* In Progress Section */}
      <h2 className="sectionHeader">In Progress</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {tasks.filter((task) => task.status === "In Progress").length > 0 ? (
          renderTaskTable(tasks.filter((task) => task.status === "In Progress"))
        ) : (
          <p className="noTasks">No tasks in progress!</p>
        )}
      </DndContext>

      {/* Done Section */}
      <h2 className="sectionHeader">Completed Tasks</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {tasks.filter((task) => task.status === "Done").length > 0 ? (
          renderTaskTable(tasks.filter((task) => task.status === "Done"))
        ) : (
          <p className="noTasks">No completed tasks...</p>
        )}
      </DndContext>
    </div>
  );
}

export default TaskManager;