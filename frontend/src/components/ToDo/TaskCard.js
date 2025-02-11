import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./TaskCard.css";

const TaskCard = ({ task, columnId }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
    data: { columnId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="task-card" style={style}>
      {task.title}
    </div>
  );
};

export default TaskCard;
