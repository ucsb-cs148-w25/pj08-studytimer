import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  // timeLeft is in seconds
  const [timeLeft, setTimeLeft] = useState(flowDuration * 60);
  const [isFlow, setIsFlow] = useState(true); 
  const [isRunning, setIsRunning] = useState(false);
  const [currentSessionDuration, setCurrentSessionDuration] = useState(flowDuration * 60);

  // Display current mode label: "focus", "shortBreak", or "longBreak"
  const [mode, setMode] = useState("focus");

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
  // RESTORE TIMER STATE FROM LOCALSTORAGE ON MOUNT
  // --------------------------------
  useEffect(() => {
    const storedIsRunning = localStorage.getItem("isRunning");
    const storedTimeLeft = localStorage.getItem("timeLeft");
    const storedTimerStart = localStorage.getItem("timerStart");
    const storedIsFlow = localStorage.getItem("isFlow");
    const storedMode = localStorage.getItem("mode");
    const storedSessionDuration = localStorage.getItem("currentSessionDuration");

    let time = parseInt(storedTimeLeft, 10);
    if (isNaN(time)) {
      time = flowDuration * 60;
    }
    if (storedIsRunning === "true" && storedTimerStart) {
      const timerStartParsed = parseInt(storedTimerStart, 10);
      if (!isNaN(timerStartParsed)) {
        const elapsed = Math.floor((Date.now() - timerStartParsed) / 1000);
        time = time - elapsed;
        if (time < 0) time = 0;
        setIsRunning(true);
      }
    } else {
      setIsRunning(false);
    }
    setTimeLeft(time);

    if (storedIsFlow !== null) {
      setIsFlow(storedIsFlow === "true");
    }
    if (storedMode !== null) {
      setMode(storedMode);
    }
    if (storedSessionDuration !== null) {
      const sessionDur = parseInt(storedSessionDuration, 10);
      setCurrentSessionDuration(isNaN(sessionDur) ? flowDuration * 60 : sessionDur);
    }
  }, [flowDuration]);

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
  
      // Only update stats if they exist (i.e., user is logged in)
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
      // For break sessions, update the break count if stats exists.
      if (stats) {
        setStats(prev => ({
          ...prev,
          totalBreaksTaken: prev.totalBreaksTaken + 1,
        }));
      }
    }
  
    if (isFlow) {
      let newTime;
      if (currentCycle + 1 === cycle) {
        // Completed a full cycle → Long Break
        setIsFlow(false);
        newTime = longBreakDuration * 60;
        setCurrentCycle(0);
        setMode("longBreak");
        localStorage.setItem("mode", "longBreak");
        localStorage.setItem("isFlow", "false");
      } else {
        // Otherwise, use a Short Break
        setIsFlow(false);
        newTime = shortBreakDuration * 60;
        setCurrentCycle(currentCycle + 1);
        setMode("shortBreak");
        localStorage.setItem("mode", "shortBreak");
        localStorage.setItem("isFlow", "false");
      }
      setTimeLeft(newTime);
      setCurrentSessionDuration(newTime);
      localStorage.setItem("timeLeft", newTime);
      localStorage.setItem("currentSessionDuration", newTime);
      if (skip && startBreaksAutomatically) {
        setIsRunning(true);
        localStorage.setItem("isRunning", "true");
        localStorage.setItem("timerStart", Date.now());
      } else {
        setIsRunning(false);
        localStorage.setItem("isRunning", "false");
      }
    } else {
      // Finished a Break session → Start a new Flow
      setIsFlow(true);
      const newTime = flowDuration * 60;
      setTimeLeft(newTime);
      setCurrentSessionDuration(newTime);
      localStorage.setItem("timeLeft", newTime);
      localStorage.setItem("currentSessionDuration", newTime);
      setMode("focus");
      localStorage.setItem("mode", "focus");
      if (skip && startFlowsAutomatically) {
        setIsRunning(true);
        localStorage.setItem("isRunning", "true");
        localStorage.setItem("timerStart", Date.now());
      } else {
        setIsRunning(false);
        localStorage.setItem("isRunning", "false");
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

  // Create a ref to hold the latest completeSession so our timer effect doesn’t depend on it.
  const completeSessionRef = useRef(completeSession);
  useEffect(() => {
    completeSessionRef.current = completeSession;
  }, [completeSession]);

  // --------------------------------
  // MAIN TIMER EFFECT
  // --------------------------------
  useEffect(() => {
    if (!isRunning) return;

    // Read initial values only once when the timer starts.
    let storedTimeLeft = localStorage.getItem("timeLeft");
    let initialTimeLeft = parseInt(storedTimeLeft, 10);
    if (isNaN(initialTimeLeft)) {
      initialTimeLeft = flowDuration * 60;
    }

    let storedTimerStart = localStorage.getItem("timerStart");
    let timerStart = parseInt(storedTimerStart, 10);
    if (isNaN(timerStart)) {
      timerStart = Date.now();
      localStorage.setItem("timerStart", timerStart);
    }

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStart) / 1000);
      const newTime = initialTimeLeft - elapsed;
      if (newTime <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        setTimeout(() => completeSessionRef.current(), 0);
      } else {
        setTimeLeft(newTime);
        localStorage.setItem("timeLeft", newTime);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, flowDuration]);

  // --------------------------------
  // RESET TIMER WHEN USER SIGNS OUT
  // --------------------------------
  const resetTimerOnAuthChange = useCallback(() => {
    localStorage.removeItem("timerStart");
    localStorage.removeItem("timeLeft");
    localStorage.removeItem("isFlow");
    localStorage.removeItem("mode");
    localStorage.setItem("isRunning", "false");

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
    // Only update if any value changed
    if (
      newFlow === flowDuration &&
      newShort === shortBreakDuration &&
      newLong === longBreakDuration &&
      newCycle === cycle &&
      newStartBreaks === startBreaksAutomatically &&
      newStartFlows === startFlowsAutomatically
    ) {
      // no changes, close modal
      setIsModalOpen(false);
      return;
    }
    
    setFlowDuration(newFlow);
    setShortBreakDuration(newShort);
    setLongBreakDuration(newLong);
    setCycle(newCycle);
    setStartBreaksAutomatically(newStartBreaks);
    setStartFlowsAutomatically(newStartFlows);

    // Reset current cycle count and update timeLeft based on current mode.
    setCurrentCycle(0);

    let newTime;
    if (isFlow) {
      newTime = newFlow * 60;
      setMode("focus");
      localStorage.setItem("mode", "focus");
    } else {
      if (mode === "longBreak") {
        newTime = newLong * 60;
      } else {
        newTime = newShort * 60;
      }
    }
    setTimeLeft(newTime);
    setCurrentSessionDuration(newTime);
    localStorage.setItem("timeLeft", newTime);
    localStorage.setItem("currentSessionDuration", newTime);
    setIsRunning(false);
    localStorage.setItem("isRunning", "false");
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
          onClick={() => {
            if (!isRunning) {
              // When starting the timer, record the start time.
              localStorage.setItem("timerStart", Date.now());
              localStorage.setItem("isRunning", "true");
              setIsRunning(true);
            } else {
              localStorage.setItem("isRunning", "false");
              setIsRunning(false);
            }
          }}
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
