import React, { useState } from "react";
import "./TaskModal.css";

const TaskModal = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Low");
  const [description, setDescription] = useState("");
  const [milestones, setMilestones] = useState([""]);
  const [labels, setLabels] = useState([]);
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  const handleMilestoneChange = (index, value) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = value;
    setMilestones(updatedMilestones);
  };

  const addMilestone = () => {
    setMilestones([...milestones, ""]);
  };

  const toggleLabel = (label) => {
    setLabels((prevLabels) =>
      prevLabels.includes(label)
        ? prevLabels.filter((l) => l !== label)
        : [...prevLabels, label]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTask({
      id: Date.now(),
      title,
      deadline,
      priority,
      description,
      milestones,
      labels,
      files,
      status: "To Do"
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="task-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="modal-form">
          <input type="text" placeholder="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="milestones">
            <label>Milestones:</label>
            {milestones.map((milestone, index) => (
              <input
                key={index}
                type="text"
                value={milestone}
                onChange={(e) => handleMilestoneChange(index, e.target.value)}
              />
            ))}
            <button type="button" onClick={addMilestone}>+ Add Milestone</button>
          </div>

          <div className="labels">
            <label>Labels:</label>
            {["Urgent", "Feature", "Bug", "Improvement"].map((label) => (
              <button type="button" key={label} className={`label-btn ${labels.includes(label) ? 'selected' : ''}`} onClick={() => toggleLabel(label)}>
                {label}
              </button>
            ))}
          </div>

          <div className="file-upload">
            <label>Upload Files:</label>
            <input type="file" multiple onChange={handleFileChange} />
          </div>

          <button type="submit">PUSH</button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
