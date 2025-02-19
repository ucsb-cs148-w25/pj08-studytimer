import React, { useState } from "react";
import "./TaskModal.css";

const TaskModal = ({ task, onClose, updateMilestones }) => {
  const [milestones, setMilestones] = useState([...task.milestones]);

  const toggleMilestone = (index) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index].completed = !updatedMilestones[index].completed;
    setMilestones(updatedMilestones);
    updateMilestones(updatedMilestones);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        <h2 className="modal-title">{task.title}</h2>

        <div className="modal-milestones">
          {milestones.length > 0 ? (
            milestones.map((milestone, index) => (
              <div key={index} className="milestone-item">
                <input
                  type="checkbox"
                  className="milestone-checkbox"
                  checked={milestone.completed}
                  onChange={() => toggleMilestone(index)}
                />
                <span className={milestone.completed ? "milestone-text completed" : "milestone-text"}>
                  {milestone.text}
                </span>
              </div>
            ))
          ) : (
            <p className="no-milestones">No milestones added.</p>
          )}
        </div>

        <div className="modal-footer">
          <span className="modal-date">Deadline: {task.deadline}</span>
        </div>

        <button className="modal-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default TaskModal;
