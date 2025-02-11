import React, { useState } from "react";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragOverlay } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";
import "./KanbanBoard.css";

const KanbanBoard = () => {
  const [columns, setColumns] = useState([
    { id: "todo", title: "To Do", tasks: [] },
    { id: "inprogress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] }
  ]);
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const addTask = (columnId, task) => {
    setColumns(columns.map(col => {
      if (col.id === columnId) {
        return { ...col, tasks: [...col.tasks, task] };
      }
      return col;
    }));
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = columns.flatMap(col => col.tasks).find(task => task.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveTask(null);
      return;
    }

    const sourceColumnId = active.data?.current?.columnId;
    const targetColumnId = over.data?.current?.columnId || over.id;

    if (!sourceColumnId || !targetColumnId) {
      setActiveTask(null);
      return;
    }

    if (sourceColumnId === targetColumnId) {
      setColumns(columns.map(column => {
        if (column.id === sourceColumnId) {
          const oldIndex = column.tasks.findIndex(task => task.id === active.id);
          const newIndex = column.tasks.findIndex(task => task.id === over.id);
          const updatedTasks = arrayMove(column.tasks, oldIndex, newIndex);
          return { ...column, tasks: updatedTasks };
        }
        return column;
      }));
    } else {
      let taskToMove;
      const updatedColumns = columns.map(column => {
        if (column.id === sourceColumnId) {
          taskToMove = column.tasks.find(task => task.id === active.id);
          return { ...column, tasks: column.tasks.filter(task => task.id !== active.id) };
        }
        return column;
      }).map(column => {
        if (column.id === targetColumnId && taskToMove) {
          return { ...column, tasks: [...column.tasks, taskToMove] };
        }
        return column;
      });
      setColumns(updatedColumns);
    }
    setActiveTask(null);
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        <div className="columns">
          {columns.map(column => (
            <SortableContext key={column.id} items={column.tasks.map(task => task.id)}>
              <KanbanColumn column={column} addTask={addTask} columnId={column.id} />
            </SortableContext>
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} columnId={activeTask.columnId} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
