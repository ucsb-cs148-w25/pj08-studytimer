import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from '../../firebase';
import './FocusSessionQueue.css';

const FocusSessionQueue = ({ uid, selectedView }) => {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (!selectedView || !selectedView.id) return;

    const tasksRef = collection(db, `users/${uid}/lists/${selectedView.id}/tasks`);
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const tasksData = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: Number(docSnap.id)
      }));

      const focusingTasks = tasksData.filter(task => task.focusingOn === true);

      const sortedTasks = focusingTasks.sort((a, b) => {
        const aHasDeadline = !!a.deadline;
        const bHasDeadline = !!b.deadline;
        
        if (!aHasDeadline && !bHasDeadline) {
          return b.createdAt - a.createdAt;
        }
        if (!aHasDeadline && bHasDeadline) return -1;
        if (aHasDeadline && !bHasDeadline) return 1;
        
        const aDeadline = new Date(a.deadline).getTime();
        const bDeadline = new Date(b.deadline).getTime();
        if (aDeadline !== bDeadline) {
          return bDeadline - aDeadline;
        }
        
        const aETA = a.timeValue 
          ? (a.timeUnit === "hours" ? Number(a.timeValue) * 60 : Number(a.timeValue))
          : Infinity;
        const bETA = b.timeValue 
          ? (b.timeUnit === "hours" ? Number(b.timeValue) * 60 : Number(b.timeValue))
          : Infinity;
        if (aETA !== bETA) {
          return bETA - aETA;
        }
        return b.createdAt - a.createdAt;
      });

      const alreadyFocused = tasksData.some(task => task.currentlyFocusedOn === true);
      if (!alreadyFocused && sortedTasks.length > 0) {
        const mostPrioritized = sortedTasks[sortedTasks.length - 1];
        const taskRef = doc(db, `users/${uid}/lists/${selectedView.id}/tasks`, mostPrioritized.id);
        updateDoc(taskRef, { currentlyFocusedOn: true }).catch((error) => {
          console.error("Error updating currentlyFocusedOn:", error);
        });
      }

      const queueTasks = sortedTasks.filter(task => !task.currentlyFocusedOn);
      const reversedTasks = [...queueTasks].reverse();
      setTasks(reversedTasks);
    }, (error) => {
      console.error("Error listening to tasks:", error);
    });

    return () => unsubscribe();
  }, [uid, selectedView]);

  const handleTaskClick = (taskId) => {
    setSelectedTaskIds(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const handleRemoveSelectedTasks = async () => {
    if (selectedTaskIds.length === 0) return;
    setIsRemoving(true);
    setTimeout(async () => {
      try {
        for (const taskId of selectedTaskIds) {
          const taskRef = doc(db, `users/${uid}/lists/${selectedView.id}/tasks`, taskId);
          await updateDoc(taskRef, { focusingOn: false });
        }
        setSelectedTaskIds([]);
        setIsRemoving(false);
      } catch (error) {
        console.error("Error removing tasks from focus session:", error);
        setIsRemoving(false);
      }
    }, 300); 
  };

  return (
    <div className="focus-session-queue-container">
      <div className="focus-session-queue-header">Upcoming</div>

      {tasks.length === 0 ? (
        <div className="queue-empty-card">
          <div className="queue-empty-text">Nice! No Tasks in Queue</div>
        </div>
      ) : (
        <div className="focus-session-queue-tasks">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`focus-session-queue-task ${selectedTaskIds.includes(task.id) ? "task-selected" : ""}`}
              onClick={() => handleTaskClick(task.id)}
            >
              {task.text || "Untitled Task"}
            </div>
          ))}
        </div>
      )}

      {selectedTaskIds.length > 0 && (
        <div className={`remove-button-container ${isRemoving ? "removing" : ""}`}>
          <button className="remove-button" onClick={handleRemoveSelectedTasks}>
            Remove from Focus Session
          </button>
        </div>
      )}
    </div>
  );
};

export default FocusSessionQueue;
