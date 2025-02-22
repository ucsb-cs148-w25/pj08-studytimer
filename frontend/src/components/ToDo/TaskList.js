import React, { useState, useEffect } from "react";
import "./TaskList.css";
import TaskToggle from "./TaskLabelToggle";

function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatSpelledOutDate(dateObj) {
  const now = new Date();
  const thisYear = now.getFullYear();
  const eventYear = dateObj.getFullYear();
  const monthName = dateObj.toLocaleString("default", { month: "long" });
  const day = dateObj.getDate();
  const suffix = getOrdinalSuffix(day);
  let result = `${monthName} ${day}${suffix}`;

  if (eventYear !== thisYear) {
    result += `, ${eventYear}`;
  }
  return result;
}

const formatDeadline = (deadline) => {
  if (!deadline) return "";

  const d = new Date(deadline);
  if (isNaN(d.getTime())) return "Invalid Date";

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dNoTime = new Date(d);
  dNoTime.setHours(0, 0, 0, 0);

  const diffDays = Math.round((dNoTime - now) / (1000 * 60 * 60 * 24));
  const spelledOut = formatSpelledOutDate(dNoTime);

  if (diffDays < 0) {
    return `Overdue: ${spelledOut}`;
  } 
  else if (diffDays === 0) {
    return "Today";
  } 
  else if (diffDays === 1) {
    return "Tomorrow";
  } 
  else if (diffDays < 7) {
    return dNoTime.toLocaleDateString(undefined, { weekday: "long" });
  } 
  else {
    return spelledOut;
  }
};

const formatInputDate = (deadline) => {
  if (!deadline) return "";
  const d = new Date(deadline);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDeadlineClass = (deadline) => {
  if (!deadline) return "";
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dNoTime = new Date(d);
  dNoTime.setHours(0, 0, 0, 0);

  const diffDays = Math.round((dNoTime - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "overdue";
  } 
  else if (diffDays === 0) {
    return "due-today";
  } 
  else if (diffDays <= 2) {
    return "due-soon";
  }
  return "";
};

const TaskList = ({ selectedTaskView }) => {
  const [listTitle, setListTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [labels, setLabels] = useState([]);
  const [activeOption, setActiveOption] = useState(null);
  const [activeLabelId, setActiveLabelId] = useState(null);
  const [timeDropdownTaskId, setTimeDropdownTaskId] = useState(null);
  const [hoveredLabelId, setHoveredLabelId] = useState(null);
  const [labelOptionsOpen, setLabelOptionsOpen] = useState(null);

  useEffect(() => {
    if (selectedTaskView?.title) {
      setListTitle(selectedTaskView.title);
    } else {
      setListTitle("Untitled List");
    }
  }, [selectedTaskView]);

  const addTask = () => {
    const newTask = {
      id: Date.now().toString(),
      text: "",
      labelId: activeLabelId,
      completed: false,
      isTitleEditing: true,
      deadline: null,
      isEditingDeadline: false,
      timeValue: "",
      timeUnit: "minutes",
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

  const startTaskEditing = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isTitleEditing: true } : task
      )
    );
  };

  const finishTaskEditing = (id, pressedKey) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;

        let updated = { ...task, isTitleEditing: false };

        if (pressedKey === "Enter" || pressedKey === "Tab") {
          if (!updated.deadline) {
            updated.isEditingDeadline = true;
          } else if (!updated.timeValue) {
            setTimeDropdownTaskId(updated.id);
          }
        }
        return updated;
      })
    );
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const updateTaskTime = (taskId, newValue, newUnit) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, timeValue: newValue, timeUnit: newUnit } : t
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
      prev.map((task) => {
        if (task.id !== id) return task;
        let updated = { ...task, isEditingDeadline: false };
        if (updated.deadline && !updated.timeValue) {
          setTimeDropdownTaskId(updated.id);
        }
        return updated;
      })
    );
  };

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

  const startLabelEditing = (id) => {
    setLabels((prev) =>
      prev.map((label) =>
        label.id === id ? { ...label, isEditing: true } : label
      )
    );
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

  const handleLabelHeaderClick = (label) => {
    if (label.isEditing) return;
    if (activeLabelId === label.id) {
      setLabels((prev) =>
        prev.map((l) =>
          l.id === label.id ? { ...l, isExpanded: false } : l
        )
      );
      setActiveLabelId(null);
    } else {
      setLabels((prev) =>
        prev.map((l) =>
          l.id === label.id ? { ...l, isExpanded: true } : l
        )
      );
      setActiveLabelId(label.id);
    }
  };

  const handleToggleClick = (option) => {
    setActiveOption(option);
    if (option === "task") {
      addTask();
    } else if (option === "label") {
      addLabel();
    }
  };

  const moveLabelUp = (index) => {
    setLabels((prev) => {
      if (index <= 0) return prev;
      const newArr = [...prev];
      [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
      return newArr;
    });
  };

  const moveLabelDown = (index) => {
    setLabels((prev) => {
      if (index >= prev.length - 1) return prev;
      const newArr = [...prev];
      [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]];
      return newArr;
    });
  };

  const deleteLabel = (labelId) => {
    setLabels((prev) => prev.filter((l) => l.id !== labelId));
    setTasks((prev) => prev.filter((t) => t.labelId !== labelId));
  };


  const getTasksForLabel = (labelId) => tasks.filter((t) => t.labelId === labelId);
  const generalTasks = tasks.filter((t) => t.labelId === null);

  const renderTaskItem = (task) => {
    const isEditingAnyField =
      task.isTitleEditing ||
      task.isEditingDeadline ||
      timeDropdownTaskId === task.id;

    const deadlineClass = getDeadlineClass(task.deadline);

    return (
      <div
        key={task.id}
        id={task.id}
        className={`task-item ${task.completed ? "task-done" : ""}`}
      >
        <img
          src={task.completed ? "/filledCheckBox.svg" : "/emptyCheckBox.svg"}
          alt="checkbox"
          className="checkbox-icon"
          onClick={() => toggleTaskCompleted(task.id)}/>
  
        <div className="task-title-container">
          {task.isTitleEditing ? (
            <input
              type="text"
              autoFocus
              value={task.text}
              onChange={(e) => handleTaskChange(task.id, e.target.value)}
              onBlur={() => finishTaskEditing(task.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Tab") {
                  e.preventDefault();
                  finishTaskEditing(task.id, e.key);
                }
              }}
            />
          ) : (
            <span onClick={() => startTaskEditing(task.id)}>
              {task.text || "Untitled Task"}
            </span>
          )}
  
          {task.isEditingDeadline ? (
            <div className="deadline-edit-container">
              <input
                type="date"
                autoFocus
                value={task.deadline ? formatInputDate(task.deadline) : ""}
                onChange={(e) => handleDeadlineDateChange(task.id, e.target.value)}
              />
              <button
                className="deadline-close-btn"
                onClick={() => finishEditingDeadline(task.id)}
              >
                Close
              </button>
            </div>
          ) : (
            <div className={`deadline-btn ${deadlineClass}`} 
                 onClick={() => startEditingDeadline(task.id)}>
              {task.deadline ? formatDeadline(task.deadline) : "Provide Deadline"}
            </div>
          )}
  
          <div
            className="time-estimate-btn"
            onClick={() => setTimeDropdownTaskId(task.id)}
          >
            {task.timeValue ? `${task.timeValue} ${task.timeUnit}` : "Provide Estimated Time"}
          </div>
          {timeDropdownTaskId === task.id && (
            <div className="time-estimate-dropdown">
              <input
                type="number"
                min="0"
                value={task.timeValue || ""}
                onChange={(e) =>
                  updateTaskTime(task.id, e.target.value, task.timeUnit || "minutes")
                }
              />
              <select
                value={task.timeUnit || "minutes"}
                onChange={(e) =>
                  updateTaskTime(task.id, task.timeValue || "", e.target.value)
                }
              >
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
              </select>
              <button onClick={() => setTimeDropdownTaskId(null)}>Close</button>
            </div>
          )}
        </div>
  
        <img
          src="/trash.svg"
          alt="Delete Task"
          className={`task-delete-btn ${isEditingAnyField ? "always-visible" : ""}`}
          onClick={() => deleteTask(task.id)}
        />
      </div>
    );
  };  

  const renderLabelHeader = (label, index) => {
    const labelTasks = getTasksForLabel(label.id);
    const completedCount = labelTasks.filter((t) => t.completed).length;
    return (
      <div
        className={`label-header ${activeLabelId === label.id ? "active-label" : ""}`}
        onDoubleClick={() => startLabelEditing(label.id)}
        onClick={() => handleLabelHeaderClick(label)}
        onMouseEnter={() => setHoveredLabelId(label.id)}
        onMouseLeave={() => {
          setHoveredLabelId(null);
          setLabelOptionsOpen(null);
        }}
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
        {hoveredLabelId === label.id && (
          <div
            className="label-options-icon"
            onClick={(e) => {
              e.stopPropagation();
              setLabelOptionsOpen(labelOptionsOpen === label.id ? null : label.id);
            }}
          >
            <img
              src={labelOptionsOpen === label.id ? "/closedOptions.svg" : "/openOptions.svg"}
              alt="Label Options"
            />
            {labelOptionsOpen === label.id && (
              <div className="label-options-menu" onClick={(e) => e.stopPropagation()}>
                {index > 0 && (
                  <div className="label-options-item" onClick={() => moveLabelUp(index)}>
                    Move Up
                  </div>
                )}
                {index < labels.length - 1 && (
                  <div className="label-options-item" onClick={() => moveLabelDown(index)}>
                    Move Down
                  </div>
                )}
                <div
                  className="label-options-item delete-item"
                  onClick={() => deleteLabel(label.id)}
                >
                  <img src="/trash.svg" alt="Delete" />
                  Delete
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const labelElements = labels.map((label, index) => {
    const labelTasks = getTasksForLabel(label.id);
    const isActiveLabel = activeLabelId === label.id;
    return (
      <div
        key={label.id}
        className={`label-section ${
          isActiveLabel ? "active-label-section" : ""
        }`}
      >
        {renderLabelHeader(label, index)}
        {label.isExpanded && !label.isEditing && (
          <div className="label-tasks">
            {labelTasks.length === 0 ? (
              <p className="no-tasks">No tasks yet</p>
            ) : (
              labelTasks.map((task) => renderTaskItem(task))
            )}
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>{listTitle}</h2>
      <TaskToggle onToggle={handleToggleClick} activeOption={activeOption} />
      </div>
      <div className="task-list-content">
        {generalTasks.length > 0 && (
          <div className="general-section">
            {generalTasks.map((task) => renderTaskItem(task))}
          </div>
        )}
        {labelElements}
      </div>
    </div>
  );
};

export default TaskList;
