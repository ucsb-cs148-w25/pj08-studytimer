import React from "react";
import "./TaskLabelToggle.css";

export default function TaskToggle({ onToggle, activeOption }) {
  const handleToggle = (option) => {
    onToggle(option);
  };

  return (
    <div className="task-toggle-container">
      <div className="toggle-container">
        {activeOption !== null && (
          <div
            className={`sliding-bg ${
              activeOption === "task" ? "slide-left" : "slide-right"
            }`}
          ></div>
        )}
        <div className="toggle-buttons">
          <button
            onClick={() => handleToggle("task")}
            className={`toggle-btn ${activeOption === "task" ? "active" : ""}`}
          >
            Add Task
          </button>
          <button
            onClick={() => handleToggle("label")}
            className={`toggle-btn ${activeOption === "label" ? "active" : ""}`}
          >
            Add Label
          </button>
        </div>
      </div>
    </div>
  );
}
