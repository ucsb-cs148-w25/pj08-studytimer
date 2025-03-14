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

  // NEW: Force transition flag
  const [forceTransition, setForceTransition] = useState(false);

  // --------------------------------
  // BREAK NOTIFICATION STATE
  // --------------------------------
  const [showBreakNotification, setShowBreakNotification] = useState(false);
  const [breakNotificationTriggered, setBreakNotficationTriggered] = useState(false);
  const breakAudioRef = useRef(new Audio('/sounds/breakNotification.mp3'));

  useEffect(() => {
    const handleStorageChange = () => {
      setTheme(localStorage.getItem("theme") || "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // --------------------------------
  // RESTORE TIMER STATE FROM LOCALSTORAGE ON MOUNT (TIMER PERSISTENCE)
  // --------------------------------
  useEffect(() => {
    const storedIsRunning = localStorage.getItem("isRunning");
    const storedTimeLeft = localStorage.getItem("timeLeft");
    const storedEndTime = localStorage.getItem("endTime");
    const storedIsFlow = localStorage.getItem("isFlow");
    const storedMode = localStorage.getItem("mode");
    const storedSessionDuration = localStorage.getItem("currentSessionDuration");

    let time = flowDuration * 60;
    if (storedIsRunning === "true" && storedEndTime) {
      const endTime = parseInt(storedEndTime, 10);
      if (!isNaN(endTime)) {
        time = Math.ceil((endTime - Date.now()) / 1000);
        if (time < 0) time = 0;
        setIsRunning(true);
      }
    } else if (storedTimeLeft) {
      const parsedTime = parseInt(storedTimeLeft, 10);
      if (!isNaN(parsedTime)) {
        time = parsedTime;
      }
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
    // If we're in a focus session, and skip is pressed while forceTransition is true,
    // then immediately transition to break mode.
    if (isFlow && skip && forceTransition) {
      setForceTransition(false);
      let newTime;
      if (currentCycle + 1 === cycle) {
        setIsFlow(false);
        newTime = longBreakDuration * 60;
        setCurrentCycle(0);
        setMode("longBreak");
        localStorage.setItem("mode", "longBreak");
        localStorage.setItem("isFlow", "false");
      } else {
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
      setIsRunning(false);
      localStorage.setItem("isRunning", "false");
      return;
    }

    // Otherwise, use the normal completion logic.
    const elapsedSeconds = currentSessionDuration - timeLeft;
  
    if (isFlow) {
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
        setIsFlow(false);
        newTime = longBreakDuration * 60;
        setCurrentCycle(0);
        setMode("longBreak");
        localStorage.setItem("mode", "longBreak");
        localStorage.setItem("isFlow", "false");
      } else {
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
        const newEndTime = Date.now() + newTime * 1000;
        localStorage.setItem("endTime", newEndTime);
        setIsRunning(true);
        localStorage.setItem("isRunning", "true");
      } else {
        setIsRunning(false);
        localStorage.setItem("isRunning", "false");
      }
    } else {
      setIsFlow(true);
      const newTime = flowDuration * 60;
      setTimeLeft(newTime);
      setCurrentSessionDuration(newTime);
      localStorage.setItem("timeLeft", newTime);
      localStorage.setItem("currentSessionDuration", newTime);
      setMode("focus");
      localStorage.setItem("mode", "focus");
      if (skip && startFlowsAutomatically) {
        const newEndTime = Date.now() + newTime * 1000;
        localStorage.setItem("endTime", newEndTime);
        setIsRunning(true);
        localStorage.setItem("isRunning", "true");
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
    stats,
    forceTransition
  ]);
  

  // Create a ref to hold the latest completeSession so the timer effect doesn’t depend on it.
  const completeSessionRef = useRef(completeSession);
  useEffect(() => {
    completeSessionRef.current = completeSession;
  }, [completeSession]);

  // --------------------------------
  // MAIN TIMER EFFECT using absolute endTime
  // --------------------------------
  useEffect(() => {
    if (!isRunning) return;

    const storedEndTime = parseInt(localStorage.getItem("endTime"), 10);
    const timer = setInterval(() => {
      const newTime = Math.ceil((storedEndTime - Date.now()) / 1000);
      if (newTime <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        completeSessionRef.current();
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
    localStorage.removeItem("endTime");
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
  // FLOATING BREAK NOTIFICATION EFFECT
  // --------------------------------
  useEffect(() => {
    if (!breakNotificationTriggered && isRunning && isFlow && timeLeft <= 30 && timeLeft > 0) {
      setShowBreakNotification(true);
      breakAudioRef.current.play();
      setBreakNotficationTriggered(true);
      setTimeout(() => setShowBreakNotification(false), 5000);  // hide after 5 seconds
    }
  }, [timeLeft, isRunning, isFlow, breakNotificationTriggered]);

  // reset break notification when new focus session starts
  useEffect(() => {
    if (mode === "focus") {
      setBreakNotficationTriggered(false);
    }

  }, [mode]);

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
    if (
      newFlow === flowDuration &&
      newShort === shortBreakDuration &&
      newLong === longBreakDuration &&
      newCycle === cycle &&
      newStartBreaks === startBreaksAutomatically &&
      newStartFlows === startFlowsAutomatically
    ) {
      setIsModalOpen(false);
      return;
    }
    
    // Update settings for future sessions.
    setFlowDuration(newFlow);
    setShortBreakDuration(newShort);
    setLongBreakDuration(newLong);
    setCycle(newCycle);
    setStartBreaksAutomatically(newStartBreaks);
    setStartFlowsAutomatically(newStartFlows);
    setCurrentCycle(0);

    if (isFlow) {
      // Update the focus timer to show the new focus duration.
      const newTime = newFlow * 60;
      setTimeLeft(newTime);
      setCurrentSessionDuration(newTime);
      localStorage.setItem("timeLeft", newTime);
      localStorage.setItem("currentSessionDuration", newTime);
      // Set forceTransition to signal that the next skip should transition to break.
      setForceTransition(true);
    } else {
      // If in break mode, update the timer based on the break duration.
      let newTime = mode === "longBreak" ? newLong * 60 : newShort * 60;
      setTimeLeft(newTime);
      setCurrentSessionDuration(newTime);
      localStorage.setItem("timeLeft", newTime);
      localStorage.setItem("currentSessionDuration", newTime);
    }
    
    setIsRunning(false);
    localStorage.setItem("isRunning", "false");
    setIsModalOpen(false);
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
      {/* Floating Notification for break */}
      {showBreakNotification && (
        <div className='floating-notification'>
          Break coming in 30 seconds!
        </div>
      )}

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
              // When starting the timer, calculate and store the absolute end time.
              const newEndTime = Date.now() + timeLeft * 1000;
              localStorage.setItem("endTime", newEndTime);
              localStorage.setItem("isRunning", "true");
              setIsRunning(true);
            } else {
              // Pause the timer and update timeLeft based on the remaining time.
              const storedEndTime = parseInt(localStorage.getItem("endTime"), 10);
              const newTime = Math.ceil((storedEndTime - Date.now()) / 1000);
              setTimeLeft(newTime);
              localStorage.setItem("timeLeft", newTime);
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
