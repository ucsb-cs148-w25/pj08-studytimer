import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
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

  const addTask = (columnId, task) => {
    setColumns(
      columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            tasks: [
              ...col.tasks,
              { ...task, id: `task-${Date.now()}` },
            ],
          };
        }
        return col;
      })
    );
  };

  const moveTask = (taskId, targetColumnId) => {
    setColumns((prevColumns) => {
      let taskToMove = null;

      const updatedColumns = prevColumns.map((column) => {
        if (column.tasks.some((task) => task.id === taskId)) {
          taskToMove = column.tasks.find((task) => task.id === taskId);
          return { ...column, tasks: column.tasks.filter((task) => task.id !== taskId) };
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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceColumnId = active.data?.current?.columnId;
    const targetColumnId = over.data?.current?.columnId || over.id;
    if (!sourceColumnId || !targetColumnId) return;

    if (sourceColumnId === targetColumnId) {
      setColumns(
        columns.map((column) => {
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
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="Task-board">
        <div className="columns">
          {columns.map((column) => (
            <SortableContext key={column.id} items={column.tasks.map((task) => task.id)}>
              <TaskColumn column={column} addTask={addTask} moveTask={moveTask} />
            </SortableContext>
          ))}
        </div>
      </div>
    </DndContext>
  );
};

export default TaskBoard;
