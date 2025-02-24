import React, { useState } from "react";
import TaskNav from "./TaskNav";
import TaskBoard from "./TaskBoard";
import TaskList from "./TaskList";
import "./TaskPage.css";

const TaskPage = ({ uid }) => {
  const [selectedTaskView, setSelectedTaskView] = useState(null);

  return (
    <div className="task-page">
      <TaskNav setSelectedTaskView={setSelectedTaskView} />

      <div className="task-content">
        {selectedTaskView?.type === "board" && <TaskBoard />}
        {selectedTaskView?.type === "list" && uid && (
            <TaskList uid={uid} selectedTaskView={selectedTaskView} />
        )}
      </div>
    </div>
  );
};

export default TaskPage;
