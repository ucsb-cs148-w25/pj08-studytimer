import React, { useState, useEffect } from "react";
import "./TaskList.css";

// Simple date-only formatting
const formatDate = (d) => {
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const year = d.getFullYear().toString().slice(-2);
  return `${month}/${day}/${year}`;
};

// Extended logic for "Today", "Tomorrow", or Overdue, etc.
const formatDeadline = (deadline) => {
  if (!deadline) return "";
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return "Invalid Date";

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dNoTime = new Date(d);
  dNoTime.setHours(0, 0, 0, 0);

  const diffDays = Math.round((dNoTime - now) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Tomorrow";
  } else if (dNoTime < now) {
    return "Overdue: " + formatDate(d);
  } else if (diffDays < 7) {
    return d.toLocaleDateString(undefined, { weekday: "long" });
  } else {
    return formatDate(d);
  }
};

// Convert stored ISO string to YYYY-MM-DD for <input type="date" />
const formatInputDate = (deadline) => {
  if (!deadline) return "";
  const d = new Date(deadline);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const TaskList = ({ selectedTaskView }) => {
  const [listTitle, setListTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [labels, setLabels] = useState([]);
  const [activeOption, setActiveOption] = useState("null");
  const [activeLabelId, setActiveLabelId] = useState(null);

  useEffect(() => {
    if (selectedTaskView?.title) {
      setListTitle(selectedTaskView.title);
    } else {
      setListTitle("Untitled List");
    }
  }, [selectedTaskView]);

  // ---------- TASK LOGIC ----------
  const addTask = () => {
    const newTask = {
      id: Date.now().toString(),
      text: "",
      labelId: activeLabelId,
      completed: false,
      isTitleEditing: true,
      deadline: null,
      isEditingDeadline: false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleTaskChange = (id, newText) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, text: newText } : task
      )
    );
  };

  const finishTaskEditing = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isTitleEditing: false } : task
      )
    );
  };

  const startTaskEditing = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isTitleEditing: true } : task
      )
    );
  };

  const toggleTaskCompleted = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Deadline (date only)
  const startEditingDeadline = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isEditingDeadline: true } : task
      )
    );
  };

  const handleDeadlineDateChange = (id, newDate) => {
    if (!newDate) return;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const dateObj = new Date(newDate + "T00:00:00");
          const iso = dateObj.toISOString();
          return { ...task, deadline: iso };
        }
        return task;
      })
    );
  };

  const finishEditingDeadline = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isEditingDeadline: false } : task
      )
    );
  };

  // ---------- LABEL LOGIC ----------
  const addLabel = () => {
    const newLabel = {
      id: Date.now().toString(),
      title: "",
      isExpanded: true,
      isEditing: true,
    };
    setLabels((prev) => [...prev, newLabel]);
    setActiveLabelId(newLabel.id);
  };

  const handleLabelChange = (id, newTitle) => {
    setLabels((prev) =>
      prev.map((label) =>
        label.id === id ? { ...label, title: newTitle } : label
      )
    );
  };

  const finishLabelEditing = (id) => {
    setLabels((prev) =>
      prev.map((label) =>
        label.id === id ? { ...label, isEditing: false } : label
      )
    );
  };

  const startLabelEditing = (id) => {
    setLabels((prev) =>
      prev.map((label) =>
        label.id === id ? { ...label, isEditing: true } : label
      )
    );
  };

  const handleLabelHeaderClick = (label) => {
    if (label.isEditing) return;
    if (activeLabelId === label.id) {
      // collapse
      setLabels((prev) =>
        prev.map((l) =>
          l.id === label.id ? { ...l, isExpanded: false } : l
        )
      );
      setActiveLabelId(null);
    } else {
      // expand
      setLabels((prev) =>
        prev.map((l) =>
          l.id === label.id ? { ...l, isExpanded: true } : l
        )
      );
      setActiveLabelId(label.id);
    }
  };

  // ---------- TOGGLE HANDLER ----------
  const handleToggleClick = (option) => {
    setActiveOption(option);
    if (option === "task") {
      addTask();
    } else {
      addLabel();
    }
  };

  // ---------- RENDER HELPERS ----------
  const getTasksForLabel = (labelId) =>
    tasks.filter((task) => task.labelId === labelId);

  const generalTasks = tasks.filter((task) => task.labelId === null);

  const renderTaskItem = (task) => {
    return (
      <div
        key={task.id}
        className={`task-item ${task.completed ? "task-done" : ""}`}
      >
        {/* Custom checkbox on the far left */}
        <img
          src={task.completed ? "/filledCheckBox.svg" : "/emptyCheckBox.svg"}
          alt="checkbox"
          className="checkbox-icon"
          onClick={() => toggleTaskCompleted(task.id)}
        />

        {/* Title in the middle */}
        <div className="task-title-container">
          {task.isTitleEditing ? (
            <input
              type="text"
              autoFocus
              value={task.text}
              onChange={(e) => handleTaskChange(task.id, e.target.value)}
              onBlur={() => finishTaskEditing(task.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") finishTaskEditing(task.id);
              }}
            />
          ) : (
            <span onClick={() => startTaskEditing(task.id)}>
              {task.text || "Untitled Task"}
            </span>
          )}
        </div>

        {/* Deadline pill on the far right */}
        <div className="deadline-pill-container">
          {task.isEditingDeadline ? (
            <input
              type="date"
              autoFocus
              value={task.deadline ? formatInputDate(task.deadline) : ""}
              onChange={(e) => handleDeadlineDateChange(task.id, e.target.value)}
              onBlur={() => finishEditingDeadline(task.id)}
            />
          ) : task.deadline ? (
            <div
              className="deadline-pill"
              onClick={() => startEditingDeadline(task.id)}
            >
              {formatDeadline(task.deadline)}
            </div>
          ) : (
            <div className="deadline-pill" onClick={() => startEditingDeadline(task.id)}>
              Deadline
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLabelHeader = (label) => {
    const labelTasks = getTasksForLabel(label.id);
    const completedCount = labelTasks.filter((t) => t.completed).length;
    return (
      <div
        className={`label-header ${activeLabelId === label.id ? "active-label" : ""}`}
        onDoubleClick={() => startLabelEditing(label.id)}
        onClick={() => handleLabelHeaderClick(label)}
      >
        <img
          src="/dropdown.svg"
          alt="Expand/Collapse"
          className={`dropdown-icon-list ${label.isExpanded ? "open" : ""}`}
        />
        {label.isEditing ? (
          <input
            type="text"
            autoFocus
            value={label.title}
            onChange={(e) => handleLabelChange(label.id, e.target.value)}
            onBlur={() => finishLabelEditing(label.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") finishLabelEditing(label.id);
            }}
          />
        ) : (
          <h3>{label.title || "Untitled Label"}</h3>
        )}
        <span className="label-count">
          {completedCount}/{labelTasks.length} tasks done
        </span>
      </div>
    );
  };

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>{listTitle}</h2>
        <div className="toggle-container">
          <div className="toggle-options">
            <span
              className={`toggle-option ${activeOption === "task" ? "active" : ""}`}
              onClick={() => handleToggleClick("task")}
            >
              Add Task
            </span>
            <span
              className={`toggle-option ${activeOption === "label" ? "active" : ""}`}
              onClick={() => handleToggleClick("label")}
            >
              Add Label
            </span>
          </div>
        </div>
      </div>

      <div className="task-list-content">
        {generalTasks.length > 0 && (
          <div className="general-section">
            {generalTasks.map(renderTaskItem)}
          </div>
        )}
        {labels.map((label) => {
          const labelTasks = getTasksForLabel(label.id);
          const isActiveLabel = activeLabelId === label.id; // convenience

          return (
            <div
              key={label.id}
              className={`label-section ${isActiveLabel ? "active-label-section" : ""}`}
            >
              {renderLabelHeader(label)}
              {label.isExpanded && !label.isEditing && (
                <div className="label-tasks">
                  {labelTasks.length === 0 ? (
                    <p className="no-tasks">No tasks yet</p>
                  ) : (
                    labelTasks.map(renderTaskItem)
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskList;
