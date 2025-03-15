import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from '../../firebase';
import './CurrentlyFocusedOn.css';

function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function formatSpelledOutDate(dateObj) {
  const now = new Date();
  const thisYear = now.getFullYear();
  const eventYear = dateObj.getFullYear();
  const monthName = dateObj.toLocaleString("default", { month: "long" });
  const day = dateObj.getDate();
  const suffix = getOrdinalSuffix(day);
  let result = `${monthName} ${day}${suffix}`;
  if (eventYear !== thisYear) {
    result += `, ${eventYear}`;
  }
  return result;
}

const formatDeadline = (deadline) => {
  if (!deadline) return "";
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return "Invalid Date";
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dNoTime = new Date(d);
  dNoTime.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dNoTime - now) / (1000 * 60 * 60 * 24));
  const spelledOut = formatSpelledOutDate(dNoTime);
  if (diffDays < 0) {
    return `Overdue: ${spelledOut}`;
  } else if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Tomorrow";
  } else if (diffDays < 7) {
    return dNoTime.toLocaleDateString(undefined, { weekday: "long" });
  } else {
    return spelledOut;
  }
};

const CurrentlyFocused = ({ uid, selectedView, isRunning, currentMode }) => {
  const [focusedTask, setFocusedTask] = useState(null);
  const [progressMs, setProgressMs] = useState(0);
  const lastTickRef = useRef(null);

  useEffect(() => {
    if (!selectedView || !selectedView.id) return;
    const tasksRef = collection(db, `users/${uid}/lists/${selectedView.id}/tasks`);
    const q = query(tasksRef, where("currentlyFocusedOn", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setFocusedTask(null);
        return;
      }
      const docSnap = snapshot.docs[0];
      setFocusedTask({
        id: docSnap.id,
        ...docSnap.data(),
      });
    }, (error) => {
      console.error("Error listening to currently focused task:", error);
    });
    return () => unsubscribe();
  }, [uid, selectedView]);

  useEffect(() => {
    setProgressMs(0);
    lastTickRef.current = null;
  }, [focusedTask?.id]);

  useEffect(() => {
    if (!focusedTask || currentMode !== 'focus' || !isRunning) {
      lastTickRef.current = null;
      return;
    }
    if (!lastTickRef.current) {
      lastTickRef.current = Date.now();
    }
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      setProgressMs(prev => prev + delta);
      lastTickRef.current = now;
    }, 1000);
    return () => clearInterval(interval);
  }, [focusedTask, currentMode, isRunning]);

  const progressMinutes = Math.floor(progressMs / 60000);

  let remainingETA = 0;
  if (focusedTask) {
    const rawETA = focusedTask.timeValue ? Number(focusedTask.timeValue) : 0;
    const totalETA_ms = (focusedTask.timeUnit === 'hours')
      ? rawETA * 60 * 60000
      : rawETA * 60000;
    remainingETA = Math.max(Math.floor((totalETA_ms - progressMs) / 60000), 0);
  }

  const handleComplete = async () => {
    if (!focusedTask) return;
    try {
      const taskRef = doc(db, `users/${uid}/lists/${selectedView.id}/tasks`, focusedTask.id);
      await updateDoc(taskRef, {
        completed: true,
        focusingOn: false,
        currentlyFocusedOn: false,
        timeValue: 0
      });
    } catch (error) {
      console.error("Error marking task as completed:", error);
    }
  };

  const handleRemove = async () => {
    if (!focusedTask) return;
    try {
      const taskRef = doc(db, `users/${uid}/lists/${selectedView.id}/tasks`, focusedTask.id);
      let newETA;
      if (focusedTask.timeUnit === "hours") {
        newETA = Number((remainingETA / 60).toFixed(1));
      } else {
        newETA = remainingETA;
      }
      await updateDoc(taskRef, {
        focusingOn: false,
        currentlyFocusedOn: false,
        timeValue: newETA
      });
    } catch (error) {
      console.error("Error removing task from focus:", error);
    }
  };

  return (
    <div className="currently-focused-container">
      <div className="currently-focused-header">Current</div>
      {focusedTask ? (
        <div className="focused-task-wrapper">
          <div className="currently-focused-card">
            <div className="task-title">
              {focusedTask.text || "Untitled Task"}
            </div>
            <div className="task-deadline">
              Deadline: <span>{formatDeadline(focusedTask.deadline)}</span>
            </div>
            <div className="task-progress">
              Session Progress: {progressMinutes} min
            </div>
            <div className="task-remaining">
              Remaining ETA: {remainingETA} min
            </div>
          </div>

          <div className="button-row-outside">
            <button className="complete-btn" onClick={handleComplete}>
              Completed
            </button>
            <button className="remove-btn" onClick={handleRemove}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="currently-focused-card empty">
          <div>No Task Focused!</div>
        </div>
      )}
    </div>
  );
};

export default CurrentlyFocused;