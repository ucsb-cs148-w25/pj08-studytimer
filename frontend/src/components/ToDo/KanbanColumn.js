import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import "./KanbanColumn.css";

const KanbanColumn = ({ column, addTask }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const { setNodeRef } = useDroppable({ id: column.id });

  const handleAddTask = (task) => {
    addTask(column.id, task);
    setIsTaskModalOpen(false);
  };

  return (
    <div className="kanban-column" ref={setNodeRef}>
      <h3>{column.title}</h3>
      {column.tasks.map(task => (
        <TaskCard key={task.id} task={task} columnId={column.id} />
      ))}
      <div className="add-task-section">
        <button onClick={() => setIsTaskModalOpen(true)} className="add-task-btn">+ Add Task</button>
      </div>
      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onAddTask={handleAddTask} />
    </div>
  );
};

export default KanbanColumn;