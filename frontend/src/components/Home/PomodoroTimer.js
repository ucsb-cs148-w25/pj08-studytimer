import React, { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, getDoc, collection, query, where, writeBatch, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useFocusSession } from '../../focusSessionContext';
import { db } from '../../firebase';

import FocusSessionQueue from './FocusSessionQueue';
import CurrentlyFocused from './CurrentlyFocusedOn';
import SettingsModal from './SettingsModal';
import './PomodoroTimer.css';

const PomodoroTimer = ({ uid }) => {
  // GENERAL TIMER SETTINGS
  const [flowDuration, setFlowDuration] = useState(25); 
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(30);
  const [cycle, setCycle] = useState(4);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [startBreaksAutomatically, setStartBreaksAutomatically] = useState(false);
  const [startFlowsAutomatically, setStartFlowsAutomatically] = useState(false);

  // TIMER STATE
  const [timeLeft, setTimeLeft] = useState(flowDuration * 60);
  const [isFlow, setIsFlow] = useState(true); 
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("focus");
  const [currentSessionDuration, setCurrentSessionDuration] = useState(flowDuration * 60);

  // STATS STATE (stored in seconds)
  const [stats, setStats] = useState(null);

  // MODAL STATE
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { inFocusSession, setInFocusSession, selectedView, setSelectedView } = useFocusSession();
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      const auth = getAuth();
      if (!auth.currentUser) {
        console.error("User is not authenticated.");
        return;
      }
      const statsRef = doc(db, `users/${auth.currentUser.uid}`);
      try {
        const statsSnap = await getDoc(statsRef);
        if (statsSnap.exists() && statsSnap.data().stats) {
          setStats(statsSnap.data().stats);
        } else {
          // Initialize stats if not present.
          setStats({
            totalStudyTime: 0,
            totalBreaksTaken: 0,
            studySessions: 0,
            longestSession: 0,
            lastSessionDate: "N/A",
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  // --------------------------------
  // COMPLETE SESSION HANDLER
  // --------------------------------
  const completeSession = useCallback((skip = false) => {
    if (isFlow) {
      const elapsedSeconds = currentSessionDuration - timeLeft;
      setStats(prev => ({
        ...prev,
        totalStudyTime: prev.totalStudyTime + elapsedSeconds,
        studySessions: prev.studySessions + 1,
        longestSession: Math.max(prev.longestSession, elapsedSeconds),
        lastSessionDate: new Date().toLocaleString(),
      }));
    } else {
      setStats(prev => ({
        ...prev,
        totalBreaksTaken: prev.totalBreaksTaken + 1,
      }));
    }

    if (isFlow) {
      if (currentCycle + 1 === cycle) {
        // Full cycle complete → Long Break
        setIsFlow(false);
        setTimeLeft(longBreakDuration * 60);
        setCurrentSessionDuration(longBreakDuration * 60);
        setCurrentCycle(0);
        setMode("longBreak");
        if (skip && startBreaksAutomatically) {
          setIsRunning(true);
        } else if (!skip && !startBreaksAutomatically) {
          setIsRunning(false);
        }
      } else {
        // Short break case
        setIsFlow(false);
        setTimeLeft(shortBreakDuration * 60);
        setCurrentSessionDuration(shortBreakDuration * 60);
        setCurrentCycle(currentCycle + 1);
        setMode("shortBreak");
        if (skip && startBreaksAutomatically) {
          setIsRunning(true);
        } else if (!skip && !startBreaksAutomatically) {
          setIsRunning(false);
        }
      }
    } else {
      // End of break → Start new Flow
      setIsFlow(true);
      setTimeLeft(flowDuration * 60);
      setCurrentSessionDuration(flowDuration * 60);
      setMode("focus");
      if (skip && startFlowsAutomatically) {
        setIsRunning(true);
      } else if (!skip && !startFlowsAutomatically) {
        setIsRunning(false);
      }
    }
  }, [
    isFlow,
    currentCycle,
    cycle,
    shortBreakDuration,
    longBreakDuration,
    flowDuration,
    startBreaksAutomatically,
    startFlowsAutomatically,
    currentSessionDuration,
    timeLeft
  ]);

  // --------------------------------
  // MAIN TIMER EFFECT
  // --------------------------------
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, completeSession]);

  // --------------------------------
  // UPDATE FIREBASE STATS WHEN LOCAL STATS CHANGE
  // --------------------------------
  useEffect(() => {
    if (!stats) return;
    const updateFirebaseStats = async () => {
      const auth = getAuth();
      if (!auth.currentUser) {
        console.error("User is not authenticated.");
        return;
      }
      const statsRef = doc(db, `users/${auth.currentUser.uid}`);
      try {
        await setDoc(statsRef, { stats }, { merge: true });
      } catch (error) {
        console.error("Error updating stats on Firebase:", error);
      }
    };

    updateFirebaseStats();
  }, [stats]);

  useEffect(() => {
    if (!inFocusSession && uid) {
      const checkFocusedTasks = async () => {
        try {
          // Fetch all lists for the user as objects.
          const listsSnapshot = await getDocs(collection(db, `users/${uid}/lists`));
          const listsData = listsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

          let allTasks = [];
          // Loop through each list to fetch its tasks.
          for (const list of listsData) {
            const tasksSnapshot = await getDocs(collection(db, `users/${uid}/lists/${list.id}/tasks`));
            const tasksForList = tasksSnapshot.docs.map(docSnap => ({
              id: docSnap.id,
              listId: list.id,
              ...docSnap.data()
            }));
            allTasks = allTasks.concat(tasksForList);
          }

          // Find the first task that is still marked as focused.
          const focusedTask = allTasks.find(task => task.focusingOn === true);
          if (focusedTask) {
            const focusedList = listsData.find(list => list.id === focusedTask.listId);
            if (focusedList) {
              setSelectedView(focusedList);
              setShowResumePrompt(true);
            }
          }
        } catch (error) {
          console.error("Error checking/updating focused tasks:", error);
        }
      };
      checkFocusedTasks();
    }
  }, [inFocusSession, uid, setSelectedView]);


  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSettingsSave = (
    newFlow,
    newShort,
    newLong,
    newCycle,
    newStartBreaks,
    newStartFlows
  ) => {
    setFlowDuration(newFlow);
    setShortBreakDuration(newShort);
    setLongBreakDuration(newLong);
    setCycle(newCycle);
    setStartBreaksAutomatically(newStartBreaks);
    setStartFlowsAutomatically(newStartFlows);

    setCurrentCycle(0);

    if (isFlow) {
      setTimeLeft(newFlow * 60);
      setCurrentSessionDuration(newFlow * 60);
      setMode("focus");
    } else {
      if (mode === "longBreak") {
        setTimeLeft(newLong * 60);
        setCurrentSessionDuration(newLong * 60);
      } else {
        setTimeLeft(newShort * 60);
        setCurrentSessionDuration(newShort * 60);
      }
    }

    setIsRunning(false);
  };

  const handleToggleTimer = () => {
    setIsRunning(prev => !prev);
  };

  const handleSkip = () => {
    completeSession(true);
  };

  const handleExitFocusSession = async () => {
    setInFocusSession(false);
    try {
      if (uid && selectedView && selectedView.id) {
        const tasksRef = collection(db, `users/${uid}/lists/${selectedView.id.toString()}/tasks`);
        const q = query(tasksRef, where("focusingOn", "==", true));
        const tasksSnapshot = await getDocs(q);
        const batch = writeBatch(db);

        tasksSnapshot.docs.forEach((taskDoc) => {
          const taskRef = doc(db, `users/${uid}/lists/${selectedView.id.toString()}/tasks`, taskDoc.id);
          batch.update(taskRef, { focusingOn: false, currentlyFocusedOn: false });
        });

        await batch.commit();
      }
    } catch (error) {
      console.error("Error updating tasks on exit:", error);
    }
  };

  const handleResumeFlowSession = () => {
    setInFocusSession(true);
    setShowResumePrompt(false);
  };

  const modeLabel = mode === "focus" ? "Focus" : mode === "shortBreak" ? "Break" : "Long Break";

  return (
    <div className="pomodoro-timer-container">
      {uid && inFocusSession && (
        <FocusSessionQueue uid={uid} selectedView={selectedView} />
      )}

      <div className="pomodoro-timer-main">
        <div className="mode-label">
          <div className="mode-text">{modeLabel}</div>
          {uid && (
            inFocusSession ? (
              <div className="flow-session-row">
                <span className="flow-session-text">Flow Session Active</span>
                <img
                  src="/exitIcon.svg"
                  alt="Exit Flow Session"
                  className="exit-flow-session-icon"
                  onClick={handleExitFocusSession}
                />
              </div>
            ) : (
              showResumePrompt && (
                <div className="resume-flow-session-prompt">
                  <button className={"resume-flow-session-button"} onClick={handleResumeFlowSession}>
                    Continue Previous Flow Session?
                  </button>
                </div>
              )
            )
          )}
        </div>

        <div className="timer-display">
          {formatTime(timeLeft)}
        </div>

        <div className="timer-controls">
          <button className="timer-button play-pause-button" onClick={handleToggleTimer}>
            <img
              className="play-pause-icon"
              src={isRunning ? "/pauseTimer.svg" : "/playTimer.svg"}
              alt={isRunning ? "Pause" : "Play"}
            />
          </button>

          <button className="timer-button skip-button" onClick={handleSkip}>
            <img
              className="skip-icon"
              src="/skipTimer.svg"
              alt="Skip"
            />
          </button>

          <button
            className="settings-button"
            onClick={() => setIsModalOpen(true)}
            aria-label="Settings"
          >
            <img
              className="settings-icon"
              src="/settingsGear.svg"
              alt="Settings"
            />
          </button>
        </div>

        <SettingsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          flowDuration={flowDuration}
          shortBreakDuration={shortBreakDuration}
          longBreakDuration={longBreakDuration}
          cycle={cycle}
          startBreaksAutomatically={startBreaksAutomatically}
          startFlowsAutomatically={startFlowsAutomatically}
          onSave={handleSettingsSave}
        />
      </div>

      {uid && inFocusSession && (
        <CurrentlyFocused 
          uid={uid} 
          selectedView={selectedView}
          isRunning={isRunning}
          currentMode={mode}  
        />
      )}
    </div>
  );
};

export default PomodoroTimer;
