import React, { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskModal from "./TaskModal";
import "./TaskCard.css";

const TaskCard = ({ task, columnId, moveTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [milestones, setMilestones] = useState([...task.milestones]);

  useEffect(() => {
    setMilestones(task.milestones || []);
  }, [task.milestones]);

  const firstUncompletedMilestone = milestones.find(m => !m.completed);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
    data: { columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="task-card" {...attributes} {...listeners}>
        <div className="task-options">
          <button
            className={`move-btn ${columnId === "inbox" ? "disabled" : ""}`}
            onClick={() => moveTask(task.id, "inbox")}
            disabled={columnId === "inbox"}
          ></button>
          <button
            className={`move-btn ${columnId === "inprogress" ? "disabled" : ""}`}
            onClick={() => moveTask(task.id, "inprogress")}
            disabled={columnId === "inprogress"}
          ></button>
          <button
            className={`move-btn ${columnId === "completed" ? "disabled" : ""}`}
            onClick={() => moveTask(task.id, "completed")}
            disabled={columnId === "completed"}
          ></button>
        </div>

        <h3 className="task-title" onClick={() => setIsModalOpen(true)}>
          {task.title}
        </h3>

        <p className="task-milestone" onClick={() => setIsModalOpen(true)}>
          {firstUncompletedMilestone ? (
            <>
              <input type="checkbox" className="task-checkbox" checked={firstUncompletedMilestone.completed} readOnly /> 
              <span className="milestone-text">{firstUncompletedMilestone.text}</span>
            </>
          ) : (
            <span className="task-completed">All milestones completed!</span>
          )}
        </p>

        <div className="task-footer">
          <span className="task-date">{task.deadline}</span>
        </div>
      </div>

      {isModalOpen && <TaskModal task={task} columnId={columnId} onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default TaskCard;
