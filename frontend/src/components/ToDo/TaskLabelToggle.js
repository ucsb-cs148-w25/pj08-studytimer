import React, { useState, useRef, useEffect } from "react";
import "./TaskLabelToggle.css";

export default function TaskToggle({ onToggle, activeOption }) {
  const [dimensions, setDimensions] = useState({ taskWidth: 0, labelWidth: 0 });
  const taskBtnRef = useRef(null);
  const labelBtnRef = useRef(null);
  const slideBgRef = useRef(null);

  useEffect(() => {
    if (taskBtnRef.current && labelBtnRef.current) {
      const taskWidth = taskBtnRef.current.offsetWidth;
      const labelWidth = labelBtnRef.current.offsetWidth;
      setDimensions({ taskWidth, labelWidth });
    }
  }, [activeOption]);

  let slideLeft = 0;
  let slideWidth = 0;
  if (activeOption === "task") {
    slideLeft = 0;
    slideWidth = dimensions.taskWidth
  } else if (activeOption === "label") {
    slideLeft = dimensions.taskWidth;
    slideWidth = dimensions.labelWidth;
  }

  const handleToggle = (option) => {
    onToggle(option);
  };

  return (
    <div className="task-toggle-container">
      <div className="toggle-container">
        <div
          className="sliding-bg"
          ref={slideBgRef}
          // forgive me JS gods, that I have sinned with a inline style
          style = {{
            transform: `translateX(${slideLeft}px)`,
            width: slideWidth,
          }}
        />
        <div className="toggle-buttons">
          <button
            ref={taskBtnRef}
            onClick={() => handleToggle("task")}
            className={`toggle-btn ${activeOption === "task" ? "active" : ""}`}
          >
            Add Task
          </button>
          <button
            ref={labelBtnRef}
            onClick={() => handleToggle("label")}
            className={`toggle-btn ${activeOption === "label" ? "active" : ""}`}
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
}
