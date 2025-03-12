import React, { useState, useEffect, useCallback } from 'react';
import SettingsModal from './SettingsModal';
import './PomodoroTimer.css';
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const PomodoroTimer = () => {
  // --------------------------------
  // DEFAULT SETTINGS (in minutes)
  // --------------------------------
  const [flowDuration, setFlowDuration] = useState(25); 
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(30);
  const [cycle, setCycle] = useState(4); // e.g., after 4 flows, use a long break

  // This tracks how many Flow sessions have completed in the current cycle.
  const [currentCycle, setCurrentCycle] = useState(0);

  // Toggles
  const [startBreaksAutomatically, setStartBreaksAutomatically] = useState(false);
  const [startFlowsAutomatically, setStartFlowsAutomatically] = useState(false);

  // --------------------------------
  // TIMER STATE
  // --------------------------------
  const [timeLeft, setTimeLeft] = useState(flowDuration * 60);
  const [isFlow, setIsFlow] = useState(true); 
  const [isRunning, setIsRunning] = useState(false);

  // Display current mode label: "focus", "shortBreak", or "longBreak"
  const [mode, setMode] = useState("focus");

  // Store the full duration (in seconds) of the current session for calculating elapsed time.
  const [currentSessionDuration, setCurrentSessionDuration] = useState(flowDuration * 60);

  // --------------------------------
  // STATS STATE (stored in seconds)
  // --------------------------------
  const [stats, setStats] = useState(null);

  // --------------------------------
  // MODAL STATE
  // --------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);


  // --------------------------------
  // BACKGROUND THEME
  // --------------------------------
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const handleStorageChange = () => {
      setTheme(localStorage.getItem("theme") || "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  
  // --------------------------------
  // FETCH STATS FROM FIREBASE ON MOUNT
  // --------------------------------
  useEffect(() => {
    const fetchStats = async () => {
      const auth = getAuth();
      if (!auth.currentUser) {
        console.error("User is not authenticated.");
        return;
      }
      const db = getFirestore();
      const statsRef = doc(db, `users/${auth.currentUser.uid}`);
      try {
        const statsSnap = await getDoc(statsRef);
        if (statsSnap.exists() && statsSnap.data().stats) {
          setStats(statsSnap.data().stats);
        } else {
          // If stats do not exist, initialize with defaults.
          setStats({
            totalStudyTime: 0,    // in seconds
            totalBreaksTaken: 0,
            studySessions: 0,
            longestSession: 0,    // in seconds
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
  // SESSION COMPLETE HANDLER (memoized)
  // --------------------------------
  const completeSession = useCallback((skip = false) => {
    if (isFlow) {
      // Calculate elapsed time in seconds for the current study session.
      const elapsedSeconds = currentSessionDuration - timeLeft;
  
      // Only update stats if they exist (usr logged in)
      if (stats) {
        setStats(prev => ({
          ...prev,
          totalStudyTime: prev.totalStudyTime + elapsedSeconds,
          studySessions: prev.studySessions + 1,
          longestSession: Math.max(prev.longestSession, elapsedSeconds),
          lastSessionDate: new Date().toLocaleString(),
        }));
      }
    } else {
      // For break sessions, only update the break count if stats exists.
      if (stats) {
        setStats(prev => ({
          ...prev,
          totalBreaksTaken: prev.totalBreaksTaken + 1,
        }));
      }
    }
  
    if (isFlow) {
      if (currentCycle + 1 === cycle) {
        // Completed a full cycle → Long Break
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
        // Otherwise, use a Short Break
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
      // Finished a Break session → Start a new Flow
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
    timeLeft,
    stats 
  ]);  

  // --------------------------------
  // EFFECT: MAIN TIMER
  // --------------------------------
  useEffect(() => {
    if (!isRunning) return;

    const startTime = Date.now();
    localStorage.setItem("timerStart", startTime);
    localStorage.setItem("timeLeft", timeLeft);
    localStorage.setItem("isFlow", isFlow);
    localStorage.setItem("mode", mode);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeSession();
          return 0;
        }
        localStorage.setItem("timeLeft", prev - 1);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, completeSession, timeLeft, isFlow, mode]);

  // --------------------------------
  // TIMER PERSISTENCE AFTER NAVIGATING TABS
  // --------------------------------
  useEffect(() => {
    const savedTimeLeft = localStorage.getItem("timeLeft");
    const savedStartTime = localStorage.getItem("timerStart");
    const savedIsFlow = localStorage.getItem("isFlow");
    const savedMode = localStorage.getItem("mode");
  
    if (savedTimeLeft && savedStartTime) {
      const elapsedTime = Math.floor((Date.now() - parseInt(savedStartTime)) / 1000);
      const updatedTimeLeft = Math.max(0, parseInt(savedTimeLeft) - elapsedTime);
  
      setTimeLeft(updatedTimeLeft);
      setIsFlow(savedIsFlow === "true");
      setMode(savedMode || "focus");
  
      if (updatedTimeLeft > 0) {
        setIsRunning(true);
      } else {
        completeSession(true);
      }
    }
  }, [completeSession]);

  // --------------------------------
  // RESET TIMER WHEN USER SIGNS OUT
  // --------------------------------
  const resetTimerOnAuthChange = useCallback(() => {
    localStorage.removeItem("timerStart");
    localStorage.removeItem("timeLeft");
    localStorage.removeItem("isFlow");
    localStorage.removeItem("mode");

    setIsRunning(false);
    setTimeLeft(flowDuration * 60);
    setIsFlow(true);
    setMode("focus");
    setCurrentCycle(0);
  }, [flowDuration]);

  useEffect(() => {
    const auth = getAuth();
    let initialLoad = true;
  
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!initialLoad) {
        // Only reset if auth state changes after the initial page load
        resetTimerOnAuthChange();
      }
      initialLoad = false;
    });
  
    return () => unsubscribe();
  }, [resetTimerOnAuthChange]);

  // --------------------------------
  // UPDATE FIREBASE STATS WHEN LOCAL STATS CHANGE
  // --------------------------------
  useEffect(() => {
    if (!stats) return; // Wait until stats are loaded
    const updateFirebaseStats = async () => {
      const auth = getAuth();
      if (!auth.currentUser) {
        console.error("User is not authenticated.");
        return;
      }
      const db = getFirestore();
      const statsRef = doc(db, `users/${auth.currentUser.uid}`);
      try {
        await setDoc(statsRef, { stats }, { merge: true });
        console.log("Stats updated successfully on firebase");
      } catch (error) {
        console.error("Error updating stats on firebase:", error);
      }
    };

    updateFirebaseStats();
  }, [stats]);

  // --------------------------------
  // FORMAT TIME FOR DISPLAY
  // --------------------------------
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // --------------------------------
  // HANDLE SETTINGS SAVE
  // --------------------------------
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

    // Reset current cycle count and update timeLeft based on current mode.
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

  // --------------------------------
  // HANDLE SKIP BUTTON
  // --------------------------------
  const handleSkip = () => {
    completeSession(true);
  };

  // --------------------------------
  // RENDER
  // --------------------------------
  return (
    <div className="pomodoro-timer-container">
      {/* Mode Label */}
      <div className="mode-label">
        {mode === "focus" ? "Focus" : mode === "shortBreak" ? "Break" : "Long Break"}
      </div>

      {/* TIME DISPLAY */}
      <div className="timer-display">{formatTime(timeLeft)}</div>

      {/* BUTTONS: START, SKIP, SETTINGS */}
      <div className="controls-row">
        <button
          className="start-button"
          onClick={() => setIsRunning((prev) => !prev)}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>

        <button className="skip-button" onClick={handleSkip}>
          Skip
        </button>

        <button
          className="gear-button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Settings"
        >
          <img src="/settingsGear.svg" alt="Settings" className={theme === "dark" ? "gear-icon dark-mode" : "gear-icon"}/>
        </button>
      </div>

      {/* SETTINGS MODAL */}
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
  );
};

export default PomodoroTimer;
