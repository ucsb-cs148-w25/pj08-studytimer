import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { addTaskToCalendar } from "../../services/CalendarService";
import TaskColumn from "./TaskColumn";
import "./TaskBoard.css";

const TaskBoard = () => {
  const [columns, setColumns] = useState([
    { id: "inbox", title: "Inbox", tasks: [] },
    { id: "inprogress", title: "In Progress", tasks: [] },
    { id: "completed", title: "Completed", tasks: [] },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Adds a new task to the specified column
  const addTask = (columnId, task) => {
    // Create a unique ID for the task
    const newTask = { ...task, id: `task-${Date.now()}` };

    // Update local state for immediate UI feedback
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      )
    );
    return newTask;
  };

  // Moves a task between columns
  const moveTask = (taskId, targetColumnId) => {
    setColumns((prevColumns) => {
      let taskToMove = null;

      const updatedColumns = prevColumns.map((column) => {
        if (column.tasks.some((task) => task.id === taskId)) {
          taskToMove = column.tasks.find((task) => task.id === taskId);
          return {
            ...column,
            tasks: column.tasks.filter((task) => task.id !== taskId),
          };
        }
        return column;
      });

      if (taskToMove) {
        return updatedColumns.map((column) =>
          column.id === targetColumnId
            ? { ...column, tasks: [...column.tasks, taskToMove] }
            : column
        );
      }
      return prevColumns;
    });
  };

  // Handler to add a task and sync it to Google Calendar
  const handleAddTask = async (columnId, taskData) => {
    try {
      // Make sure taskData includes a valid 'date' property.
      if (!taskData.date) {
        console.error("Task must include a date.");
        return;
      }
      // Add the task locally (update UI)
      addTask(columnId, taskData);
      // Sync to Google Calendar via your backend.
      const calendarResponse = await addTaskToCalendar(taskData);
      console.log("Task added to Google Calendar:", calendarResponse);
    } catch (error) {
      console.error("Failed to sync task to Google Calendar:", error);
    }
  };

  // Handle drag-and-drop events
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceColumnId = active.data?.current?.columnId;
    const targetColumnId = over.data?.current?.columnId || over.id;
    if (!sourceColumnId || !targetColumnId) return;

    if (sourceColumnId === targetColumnId) {
      // Reorder tasks within the same column
      setColumns((prevColumns) =>
        prevColumns.map((column) => {
          if (column.id === sourceColumnId) {
            const oldIndex = column.tasks.findIndex(
              (task) => task.id === active.id
            );
            const newIndex = column.tasks.findIndex(
              (task) => task.id === over.id
            );
            if (oldIndex !== -1 && newIndex !== -1) {
              return {
                ...column,
                tasks: arrayMove(column.tasks, oldIndex, newIndex),
              };
            }
          }
          return column;
        })
      );
    } else {
      // Move a task from one column to another
      let taskToMove;
      const updatedColumns = columns.map((column) => {
        if (column.id === sourceColumnId) {
          taskToMove = column.tasks.find((task) => task.id === active.id);
          return {
            ...column,
            tasks: column.tasks.filter((task) => task.id !== active.id),
          };
        }
        return column;
      });
      if (taskToMove) {
        setColumns(
          updatedColumns.map((column) =>
            column.id === targetColumnId
              ? { ...column, tasks: [...column.tasks, taskToMove] }
              : column
          )
        );
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="task-board">
        <div className="columns">
          {columns.map((column) => (
            <SortableContext
              key={column.id}
              items={column.tasks.map((task) => task.id)}
            >
              <TaskColumn
                column={column}
                // Pass a callback that handles both local state update and calendar sync
                addTask={(task) => handleAddTask(column.id, task)}
                moveTask={moveTask}
              />
            </SortableContext>
          ))}
        </div>
      </div>
    </DndContext>
  );
};

export default TaskBoard;
