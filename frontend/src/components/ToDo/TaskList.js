import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFocusSession } from "../../focusSessionContext";
import TaskToggle from "./TaskLabelToggle";
import SelectPopUp from "./SelectPopUp";
import "./TaskList.css";

import { db } from "../../firebase";
import { query, where, writeBatch, collection, doc, setDoc, getDocs, onSnapshot, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { addDeadlineTaskToCalendar, deleteCalendarEvent, updateCalendarEvent, fetchEvents } from "../../services/CalendarService";

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
  } 
  else if (diffDays === 0) {
    return "Today";
  } 
  else if (diffDays === 1) {
    return "Tomorrow";
  } 
  else if (diffDays < 7) {
    return dNoTime.toLocaleDateString(undefined, { weekday: "long" });
  } 
  else {
    return spelledOut;
  }
};

const formatInputDate = (deadline) => {
  if (!deadline) return "";
  const d = new Date(deadline);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDeadlineClass = (deadline) => {
  if (!deadline) return "";
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dNoTime = new Date(d);
  dNoTime.setHours(0, 0, 0, 0);

  const diffDays = Math.round((dNoTime - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "overdue";
  } 
  else if (diffDays === 0) {
    return "due-today";
  } 
  else if (diffDays <= 2) {
    return "due-soon";
  }
  return "";
};

const TaskList = ({ uid }) => {
  const [listTitle, setListTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [labels, setLabels] = useState([]);
  const [activeOption, setActiveOption] = useState(null);
  const [activeLabelId, setActiveLabelId] = useState(null);
  const [timeDropdownTaskId, setTimeDropdownTaskId] = useState(null);
  const [hoveredLabelId, setHoveredLabelId] = useState(null);
  const [labelOptionsOpen, setLabelOptionsOpen] = useState(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const { setInFocusSession, selectedView } = useFocusSession();
  const navigate = useNavigate();

  console.log("the current uid is:", uid);

  const syncInProgressRef = useRef({});
  useEffect(() => {
    if (!uid || !selectedView?.id) return;
    const docRef = doc(db, `users/${uid}/lists`, selectedView.id.toString());
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setListTitle(data.title || "Untitled List");
        } else {
          setListTitle("Untitled List");
        }
      },
      (error) => {
        console.error("Error reading list doc snapshot:", error);
      }
    );
    return () => unsubscribe();
  }, [uid, selectedView]);

  const updateTaskDoc = async (id, data) => {
    if (!uid || !selectedView) {
      console.error("Cannot update task, user not signed in or task not selected");
      return;
    }
    try {
      const taskDocRef = doc(
        db,
        `users/${uid}/lists/${selectedView.id.toString()}/tasks`,
        id.toString()
      );
      await updateDoc(taskDocRef, data);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  useEffect(() => {
    if (!uid || !selectedView) return;
    const tasksRef = collection(
      db,
      `users/${uid}/lists/${selectedView.id.toString()}/tasks`
    );
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const tasksData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setTasks(tasksData);
    }, (error) => {
      console.error("Error listening to tasks:", error);
    });
    return () => unsubscribe();
  }, [uid, selectedView]);

  const addTask = async() => {
    if (!uid) {
      console.error("User not signed in. cannot add new task");
      return;
    }
    const customID = Date.now().toString();
    const newTask = {
      text: "",
      timeValue: "",
      timeUnit: "minutes",
      labelId: activeLabelId || null,
      completed: false,
      selected: false,
      focusingOn: false,
      currentlyFocusedOn: false,
      isTitleEditing: true,
      deadline: null,
      isEditingDeadline: false,
    };
    try {
      const taskDocRef = doc(db, `users/${uid}/lists/${selectedView.id.toString()}/tasks`, customID);
      await setDoc(taskDocRef, newTask);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const deleteTask = async (id) => {
    if (!uid) {
      console.error("User not signed in, cannot delete the task");
      return;
    }
  
    // Find the task to delete from the current state.
    const taskToDelete = tasks.find((task) => task.id.toString() === id.toString());
    if (!taskToDelete) {
      console.error("Task not found");
      return;
    }
  
    try {
      setTasks((prev) => prev.filter((task) => task.id.toString() !== id.toString()));

      // If the task has a stored Google Calendar event ID, attempt to delete it.
      if (taskToDelete.googleEventId) {
        try {
          await deleteCalendarEvent(taskToDelete.googleEventId);
        } catch (err) {
          // If the event is already deleted, ignore the error.
          if (err.response && err.response.status === 410) {
            console.log("Calendar event already deleted (410), proceeding with Firestore deletion.");
          } else {
            console.error("Error deleting calendar event:", err);
            throw err; // rethrow if it's a different error
          }
        }
      } else {
        console.log("No googleEventId found for task, skipping calendar deletion.");
      }
  
      // Now delete the task from Firestore.
      await deleteDoc(doc(db, `users/${uid}/lists/${selectedView.id.toString()}/tasks`, id.toString()));
      console.log("Task deleted successfully from Firestore!");
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  async function syncDeletedCalendarEvents(uid, selectedView) {
    console.log("Polling Google Calendar events...");
    try {
      const calendarEvents = await fetchEvents();
      console.log("Fetched events:", calendarEvents);
      const eventIds = calendarEvents.map((event) => event.id);
  
      // Get all tasks that might have a googleEventId.
      const tasksRef = collection(db, `users/${uid}/lists/${selectedView.id.toString()}/tasks`);
      const tasksSnapshot = await getDocs(tasksRef);
  
      tasksSnapshot.forEach(async (docSnap) => {
        const taskData = docSnap.data();
        if (taskData.googleEventId && taskData.syncedFromTaskList) {
          if (!eventIds.includes(taskData.googleEventId)) {
            console.log(`Deleting task ${docSnap.id} because its calendar event is missing.`);
            await deleteDoc(doc(db, `users/${uid}/lists/${selectedView.id.toString()}/tasks`, docSnap.id));
          }
        }
      });
    } catch (error) {
      console.error("Error syncing deleted calendar events:", error);
    }
  }  
  
  // Set an interval to run the polling function every 5 minutes.
  setInterval(() => {
    // Ensure you have uid and selectedView defined in your scope.
    if (uid && selectedView) {
      syncDeletedCalendarEvents(uid, selectedView);
    }
  }, 5 * 60 * 1000);

  const startTaskEditing = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isTitleEditing: true } : task
      )
    );
  };

  const handleTaskChange = (id, newText) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const updated = { ...task, text: newText };
          return updated;
        }
        return task;
      })
    );
  };

  const finishTaskEditing = (id, pressedKey) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        let updated = { ...task, isTitleEditing: false };
        // Update Firestore with the new title
        updateTaskDoc(id.toString(), { text: updated.text, isTitleEditing: false });
        
        // Force a calendar sync even if the deadline hasn't changed
        if (updated.googleEventId) {
          syncTaskToGoogleCalendar(updated, true);
        }
  
        if (pressedKey === "Enter" || pressedKey === "Tab") {
          if (!updated.deadline) {
            updated = { ...updated, isEditingDeadline: true };
          } else if (!updated.timeValue) {
            setTimeDropdownTaskId(updated.id);
          }
          updateTaskDoc(id.toString(), { isEditingDeadline: updated.isEditingDeadline || false });
        }
        return updated;
      })
    );
  };

  const updateTaskTime = (id, newValue, newUnit) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const updated = { ...task, timeValue: newValue, timeUnit: newUnit };
          updateTaskDoc(id.toString(), {timeValue: newValue, timeUnit: newUnit });
          return updated;
        }
        return task;
      })
    );
  };

  const toggleTaskSelected = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === id) {
          return { ...task, selected: !task.selected };
        }
        return task;
      })
    );
  };

  function handleToggleClick(option) {
    setActiveOption(option);
    if (option === "task") {
      addTask();
    } else if (option === "label") {
      addLabel();
    }
  }

  const toggleTaskCompleted = (id) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const updated = { ...task, completed: !task.completed };
          updateTaskDoc(id.toString(), { completed: updated.completed });
          return updated;
        }
        return task;
      })
    );
  };

  const startEditingDeadline = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, isEditingDeadline: true } : task
      )
    );
  };

  const handleDeadlineDateChange = (id, newDate) => {
    if (!newDate) return;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const dateObj = new Date(newDate + "T00:00:00");
          const iso = dateObj.toISOString();
          return { ...task, deadline: iso };
        }
        return task;
      })
    );
  };
  
  const syncTaskToGoogleCalendar = (task, forceSync = false) => {
    if (!task.deadline) return;
  
    // Format the deadline as "YYYY-MM-DD"
    const deadlineDate = new Date(task.deadline);
    const yyyy = deadlineDate.getFullYear();
    const mm = (deadlineDate.getMonth() + 1).toString().padStart(2, "0");
    const dd = deadlineDate.getDate().toString().padStart(2, "0");
    const deadlineStr = `${yyyy}-${mm}-${dd}`;
  
    // If not forcing sync and the deadline hasn't changed, skip syncing.
    if (!forceSync && task.lastSyncedDeadline === deadlineStr) {
      return;
    }
  
    // Prevent multiple syncs for the same task.
    if (syncInProgressRef.current[task.id]) return;
    syncInProgressRef.current[task.id] = true;
    updateTaskDoc(task.id, { isSyncingCalendar: true });
  
    const calendarSyncPromise = task.googleEventId
      ? updateCalendarEvent(task.googleEventId, {
          text: task.text || "Untitled Task",
          deadline: deadlineStr,
          description: task.description || ""
        })
      : addDeadlineTaskToCalendar({
          text: task.text || "Untitled Task",
          deadline: deadlineStr,
          description: task.description || ""
        });
  
    calendarSyncPromise
      .then((response) => {
        // Update the task document with the new synced deadline, event ID,
        // and mark it as a TaskList-synced task.
        updateTaskDoc(task.id, {
          lastSyncedDeadline: deadlineStr,
          isSyncingCalendar: false,
          isEditingDeadline: false,
          googleEventId: response.id,
          syncedFromTaskList: true
        });
        delete syncInProgressRef.current[task.id];
      })
      .catch((err) => {
        console.error("Calendar sync error:", err);
        updateTaskDoc(task.id, { isSyncingCalendar: false });
        delete syncInProgressRef.current[task.id];
      });
  };

  const finishEditingDeadline = (id, pressedKey) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const updated = { ...task, isEditingDeadline: false };
        updateTaskDoc(task.id, { deadline: updated.deadline, isEditingDeadline: false });
        // Now call our dedicated sync function.
        syncTaskToGoogleCalendar(updated);
        return updated;
      })
    );
  };

  const updateLabelDoc = async (id, data) => {
    try {
      const labelDocRef = doc(db, `users/${uid}/lists/${selectedView.id.toString()}/labels`, 
                                   id.toString()
                              );
      await updateDoc(labelDocRef, data);
    }
    catch (error) {
      console.error("Error updating label:", error);
    }
  };

  useEffect(() => {
    if (!uid) return;
    const loadLabels = async () => {
      try {
        const labelRef = collection(db, `users/${uid}/lists/${selectedView.id.toString()}/labels`);
        const q = query(labelRef, orderBy("order"));
        const labelsSnapshot = await getDocs(q);
        const labelsData = labelsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        setLabels(labelsData);
      } catch (error) {
        console.error("Error loading labels:", error);
      }
    };
    loadLabels();
  }, [uid, selectedView]);

  const addLabel = async() => {
    console.log("User uid:", uid);
    if (!uid) {
      console.error("User not signed in, cannot add new label");
      return;
    }
    const customID = Date.now().toString();
    const newLabel = {
      title: "",
      isExpanded: true,
      isEditing: true,
      order: labels.length,
    };
    try {
      setLabels((prev) => [...prev, { ...newLabel, id: customID }]);
      setActiveLabelId(customID);
      const labelDocRef = doc(db, `users/${uid}/lists/${selectedView.id.toString()}/labels`, customID);
      await setDoc(labelDocRef, newLabel);
    }
    catch (error) {
      console.error("Error adding label:", error);
    }
  };

  const deleteLabel = async (id) => {
    if (!uid) {
      console.error("User not signed in, cannot delete the label");
      return;
    }
    try {
      // Delete the label document from Firestore.
      await deleteDoc(doc(db, `users/${uid}/lists/${selectedView.id.toString()}/labels`, id.toString()));
  
      // Gather all tasks with this label.
      const taskQuery = query(
        collection(db, `users/${uid}/lists/${selectedView.id.toString()}/tasks`), 
        where("labelId", "==", id.toString())
      );
      const tasksSnapshot = await getDocs(taskQuery);
  
      // Create an array of promises for calendar deletion.
      const deletionPromises = [];
      tasksSnapshot.forEach((taskSnap) => {
        const taskData = taskSnap.data();
        if (taskData.googleEventId) {
          deletionPromises.push(deleteCalendarEvent(taskData.googleEventId));
        }
      });
      // Wait for all calendar event deletions to complete.
      await Promise.all(deletionPromises);
  
      // Use a batch to delete all tasks from Firestore.
      const batch = writeBatch(db);
      tasksSnapshot.forEach((taskSnap) => {
        batch.delete(doc(db, `users/${uid}/lists/${selectedView.id.toString()}/tasks`, taskSnap.id.toString()));
        console.log("Task deleted from Firestore:", taskSnap.id);
      });
      await batch.commit();
  
      // Update local state.
      setLabels((prev) => prev.filter((label) => label.id.toString() !== id.toString()));
      setTasks((prev) => prev.filter((task) => task.labelId !== id));
  
      console.log("Label and all associated tasks (and their Google Calendar events) deleted successfully!");
    } catch (error) {
      console.error("Error deleting label:", error);
    }
  };

  const startLabelEditing = (id) => {
    setLabels((prev) =>
      prev.map((label) =>
        label.id === id ? { ...label, isEditing: true } : label
      )
    );
  };

  const handleLabelChange = (id, newTitle) => {
    setLabels((prev) =>
      prev.map((label) =>
        label.id === id ? { ...label, title: newTitle } : label
      )
    );
  };

  const finishLabelEditing = (id) => {
    setLabels((prev) =>
      prev.map((label) => {
        if (label.id !== id) return label;
        let updated = { ...label, isEditing: false };
        updateLabelDoc(id.toString(), { title: updated.title, isEditing: false });
        return updated;
      })
    );
  };

  const handleLabelHeaderClick = (label) => {
    if (label.isEditing) return;
    if (activeLabelId === label.id) {
      setLabels((prev) =>
        prev.map((l) =>
          l.id === label.id ? { ...l, isExpanded: false } : l
        )
      );
      updateLabelDoc(label.id, { isExpanded: false });
      setActiveLabelId(null);
    } else {
      setLabels((prev) =>
        prev.map((l) =>
          l.id === label.id ? { ...l, isExpanded: true } : l
        )
      );
      updateLabelDoc(label.id, { isExpanded: true });
      setActiveLabelId(label.id);
    }
  };

  const moveLabelUp = (index) => {
    if (index <= 0) return;
    const newLabel = [...labels];
    [newLabel[index], newLabel[index - 1]] = [newLabel[index - 1], newLabel[index]];
    setLabels(newLabel);

    const batch = writeBatch(db);
    const labelA = newLabel[index - 1];
    const labelB = newLabel[index];

    batch.update(doc(db, `users/${uid}/lists/${selectedView.id.toString()}/labels`, labelA.id.toString()), { order: index - 1});
    batch.update(doc(db, `users/${uid}/lists/${selectedView.id.toString()}/labels`, labelB.id.toString()), { order: index });
    batch.commit().then(() => {
      console.log("Labels re-ordered successfully!");
    }).catch((error) => {
      console.error("Error re-ordering labels:", error);
    });
  };

  const moveLabelDown = (index) => {
    if (index >= labels.length - 1) return;
    const newLabel = [...labels];
    [newLabel[index], newLabel[index + 1]] = [newLabel[index + 1], newLabel[index]];
    setLabels(newLabel);

    const batch = writeBatch(db);
    const labelA = newLabel[index];
    const labelB = newLabel[index + 1];

    batch.update(doc(db, `users/${uid}/lists/${selectedView.id.toString()}/labels`, labelA.id.toString()), { order: index });
    batch.update(doc(db, `users/${uid}/lists/${selectedView.id.toString()}/labels`, labelB.id.toString()), { order: index + 1 });
    batch.commit().then(() => {
      console.log("Labels re-ordered successfully!");
    }).catch((error) => {
      console.error("Error re-ordering labels:", error);
    });
  };

  const generalTasks = tasks.filter((t) => t.labelId === null);

  const renderTaskItem = (task) => {
    const isEditingAnyField =
      task.isTitleEditing || task.isEditingDeadline || timeDropdownTaskId === task.id;
    const deadlineClass = getDeadlineClass(task.deadline);

    return (
      <div
        key={task.id}
        id={task.id}
        className={`task-item ${
          task.completed ? "task-done" : ""
        } ${task.selected ? "task-selected" : ""}`}
      >
        <img
          src={
            isSelectMode
              ? task.selected
                ? "/filledSelectCircle.svg"
                : "/emptySelectCircle.svg"
              : task.completed
              ? "/filledCheckBox.svg"
              : "/emptyCheckBox.svg"
          }
          alt={isSelectMode ? "Select Circle" : "Checkbox"}
          className={isSelectMode ? "select-icon" : "checkbox-icon"}
          onClick={() => {
            if (isSelectMode) {
              toggleTaskSelected(task.id);
            } else {
              toggleTaskCompleted(task.id);
            }
          }}
        />

        <div className="task-title-container">
          {task.isTitleEditing ? (
            <input
              type="text"
              autoFocus
              value={task.text}
              onChange={(e) => handleTaskChange(task.id, e.target.value)}
              onBlur={() => {
                finishTaskEditing(task.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Tab") {
                  e.preventDefault();
                  finishTaskEditing(task.id, e.key);
                }
              }}
            />
          ) : (
            <span onClick={() => !isSelectMode && startTaskEditing(task.id)}>
              {task.text || "Untitled Task"}
            </span>
          )}

          {task.isEditingDeadline ? (
            <div className="deadline-edit-container">
              <input
                type="date"
                autoFocus
                value={task.deadline ? formatInputDate(task.deadline) : ""}
                onChange={(e) =>
                  handleDeadlineDateChange(task.id, e.target.value)
                }
              />
              <button
                className="deadline-close-btn"
                onClick={() => finishEditingDeadline(task.id)}
              >
                Save
              </button>
            </div>
          ) : (
            <div
              className={`deadline-btn ${deadlineClass}`}
              onClick={() => startEditingDeadline(task.id)}
            >
              {task.deadline ? formatDeadline(task.deadline) : "Provide Deadline"}
            </div>
          )}

          <div
            className="time-estimate-btn"
            onClick={() => !isSelectMode && setTimeDropdownTaskId(task.id)}
          >
            {(task.timeValue !== false && task.timeValue !== null)
              ? `${task.timeValue} ${task.timeUnit}`
              : "Provide Estimated Time"}
          </div>
          {timeDropdownTaskId === task.id && (
            <div className="time-estimate-dropdown">
              <input
                type="number"
                min="0"
                value={task.timeValue || ""}
                onChange={(e) =>
                  updateTaskTime(task.id, e.target.value, task.timeUnit || "minutes")
                }
              />
              <select
                value={task.timeUnit || "minutes"}
                onChange={(e) =>
                  updateTaskTime(task.id, task.timeValue || "", e.target.value)
                }
              >
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
              </select>
              <button onClick={() => setTimeDropdownTaskId(null)}>Save</button>
            </div>
          )}
        </div>

        <img
          src="/trash.svg"
          alt="Delete Task"
          className={`task-delete-btn ${isEditingAnyField ? "always-visible" : ""}`}
          onClick={() => deleteTask(task.id)}
        />
      </div>
    );
  };

  const getTasksForLabel = (labelId) => tasks.filter((t) => t.labelId === labelId);
  const labelElements = labels.map((label, index) => {
    const labelTasks = getTasksForLabel(label.id);
    const completedCount = labelTasks.filter((t) => t.completed).length;
    return (
      <div
        key={label.id}
        className={`label-section ${
          activeLabelId === label.id ? "active-label-section" : ""
        }`}
      >
        <div
          className={`label-header ${
            activeLabelId === label.id ? "active-label" : ""
          }`}
          onDoubleClick={() => startLabelEditing(label.id)}
          onClick={() => handleLabelHeaderClick(label)}
          onMouseEnter={() => setHoveredLabelId(label.id)}
          onMouseLeave={() => {
            setHoveredLabelId(null);
            setLabelOptionsOpen(null);
          }}
        >
          <img
            src="/dropdown.svg"
            alt="Expand/Collapse"
            className={`dropdown-icon-list ${label.isExpanded ? "open" : ""}`}
          />
          {label.isEditing ? (
            <input
              type="text"
              autoFocus
              value={label.title}
              onChange={(e) => handleLabelChange(label.id, e.target.value)}
              onBlur={() => finishLabelEditing(label.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") finishLabelEditing(label.id);
              }}
            />
          ) : (
            <h3>{label.title || "Untitled Category"}</h3>
          )}
          <span className="label-count">
            {completedCount}/{labelTasks.length} tasks done
          </span>
          {hoveredLabelId === label.id && (
            <div
              className="label-options-icon"
              onClick={(e) => {
                e.stopPropagation();
                setLabelOptionsOpen(labelOptionsOpen === label.id ? null : label.id);
              }}
            >
              <img
                src={labelOptionsOpen === label.id ? "/closedOptions.svg" : "/openOptions.svg"}
                alt="Label Options"
              />
              {labelOptionsOpen === label.id && (
                <div className="label-options-menu" onClick={(e) => e.stopPropagation()}>
                  {index > 0 && (
                    <div className="label-options-item" onClick={() => moveLabelUp(index)}>
                      Move Up
                    </div>
                  )}
                  {index < labels.length - 1 && (
                    <div className="label-options-item" onClick={() => moveLabelDown(index)}>
                      Move Down
                    </div>
                  )}
                  <div className="label-options-item delete-item" onClick={() => deleteLabel(label.id)}>
                    <img src="/trash.svg" alt="Delete" />
                    Delete
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {label.isExpanded && !label.isEditing && (
          <div className="label-tasks">
            {labelTasks.length === 0 ? (
              <p className="no-tasks">No tasks here!</p>
            ) : (
              labelTasks.map((task) => renderTaskItem(task))
            )}
          </div>
        )}
      </div>
    );
  });

  const selectedCount = tasks.filter((t) => t.selected).length;

  const handleUnselectAll = () => {
    setTasks((prev) => prev.map((t) => ({ ...t, selected: false })));
  };

  const handleDeleteAllSelected = async () => {
    const selectedTaskIds = tasks.filter((t) => t.selected).map((t) => t.id);
    if (selectedTaskIds.length === 0) return;
    try {
      const batch = writeBatch(db);
      selectedTaskIds.forEach((taskId) => {
        const ref = doc(
          db,
          `users/${uid}/lists/${selectedView.id.toString()}/tasks`,
          taskId.toString()
        );
        batch.delete(ref);
      });
      await batch.commit();
      setTasks((prev) => prev.filter((t) => !t.selected));
      console.log("All selected tasks deleted!");
    } catch (error) {
      console.error("Error deleting selected tasks:", error);
    }
    setIsSelectMode(false);
  };

  const handleStartFocusSession = async () => {
    if (selectedCount === 0) {
      alert("No tasks selected to start a focus session!");
      return;
    }
    for (const task of tasks) {
      if (task.selected) {
        await updateTaskDoc(task.id, { focusingOn: true });
      }
    }
    console.log("Focus session started with", selectedCount, "tasks!");
    setInFocusSession(true);
    setIsSelectMode(false);
    navigate("/");
  };

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>{listTitle}</h2>
        <div className="task-list-header-controls">
        <button 
          className={`select-button ${isSelectMode ? "active" : ""}`} 
          onClick={() => {
            if (isSelectMode) {
              setTasks(prev => prev.map(t => ({ ...t, selected: false})));
            }
            setIsSelectMode(!isSelectMode)
          }}
        >
          {isSelectMode ? "Cancel" : "Select"}
        </button>
        <TaskToggle onToggle={handleToggleClick} activeOption={activeOption} />
        </div>
      </div>

      <div className="task-list-content">
        <div className="general-section">
          {generalTasks.map((task) => renderTaskItem(task))}
        </div>
        {labelElements}
      </div>

      {isSelectMode && (
        <div className="select-popup-wrapper">
          <SelectPopUp
            selectedCount={selectedCount}
            onUnselectAll={handleUnselectAll}
            onDeleteAll={handleDeleteAllSelected}
            onStartFocusSession={handleStartFocusSession}
          />
        </div>
      )}
    </div>
  );
};

export default TaskList;