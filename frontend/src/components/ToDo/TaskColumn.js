import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import TaskModal from "./AddModal";
import "./TaskColumn.css";

const TaskColumn = ({ column, addTask, moveTask }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const { setNodeRef } = useDroppable({ id: column.id });

  const getColumnClass = () => {
    switch (column.id) {
      case "inbox":
        return "inbox";
      case "inprogress":
        return "in-progress";
      case "completed":
        return "completed";
      default:
        return "";
    }
  };

  const handleAddTask = (task) => {
    addTask(column.id, task);
    setIsTaskModalOpen(false);
  };

  return (
    <div className={`Task-column-outer ${getColumnClass()}`} ref={setNodeRef}>
      <div className="column-header">
        <h3>{column.title}</h3>
      </div>

      {/* SCROLLABLE INNER CONTAINER */}
      <div className="Task-column-inner">
        <div className="cards-container">
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columnId={column.id}
              moveTask={moveTask}
            />
          ))}
        </div>
      </div>

      {/* FADE + ADD BUTTON PINNED IN THE OUTER CONTAINER */}
      <div className="bottom-fade"></div>
      <div className="add-task-section">
        <button onClick={() => setIsTaskModalOpen(true)} className="add-task-btn">
          + Add Task
        </button>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />
    </div>
  );
};

export default TaskColumn;
