import React, { useState } from "react";
import TaskNav from "./TaskNav";
import TaskBoard from "./TaskBoard";
import TaskList from "./TaskList";
import "./TaskPage.css";

const TaskPage = ({ uid }) => {
  const [selectedView, setSelectedTaskView] = useState(null);

  return (
    <div className="task-page">
      <TaskNav uid={uid} setSelectedTaskView={setSelectedTaskView} />

      <div className="task-content">
        {selectedView?.type === "board" && <TaskBoard />}
        {selectedView?.type === "list" && uid && (
            <TaskList uid={uid} selectedView={selectedView} />
        )}
      </div>
    </div>
  );
};

export default TaskPage;
