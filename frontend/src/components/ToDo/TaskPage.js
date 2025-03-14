import React from "react";
import { useFocusSession } from "../../focusSessionContext";
import TaskNav from "./TaskNav";
import TaskList from "./TaskList";
import "./TaskPage.css";

const TaskPage = ({ uid }) => {
  const { selectedView } = useFocusSession();

  return (
    <div className="task-page">
      <TaskNav uid={uid} />

      <div className="task-content">
        {selectedView?.type === "list" && uid && (
            <TaskList uid={uid} />
        )}
      </div>
    </div>
  );
};

export default TaskPage;
