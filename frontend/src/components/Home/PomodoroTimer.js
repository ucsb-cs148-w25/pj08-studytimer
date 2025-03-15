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
  const [cycle, setCycle] = useState(4); // after 4 flows, use a long break

  // This tracks how many Flow sessions have completed in the current cycle.
  const [currentCycle, setCurrentCycle] = useState(0);

  // Toggles (update without forcing a timer reset)
  const [startBreaksAutomatically, setStartBreaksAutomatically] = useState(false);
  const [startFlowsAutomatically, setStartFlowsAutomatically] = useState(false);

  // --------------------------------
  // TIMER STATE (timeLeft in seconds)
  // --------------------------------
  const [timeLeft, setTimeLeft] = useState(flowDuration * 60);
  const [isFlow, setIsFlow] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSessionDuration, setCurrentSessionDuration] = useState(flowDuration * 60);

  // Display current mode label: "focus", "shortBreak", or "longBreak"
  const [mode, setMode] = useState("focus");

  // --------------------------------
  // STATS STATE (in seconds)
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
  // RESTORE TIMER STATE FROM LOCALSTORAGE ON MOUNT USING finishTime
  // --------------------------------
  useEffect(() => {
    const storedIsRunning = localStorage.getItem("isRunning");
    const storedFinishTime = localStorage.getItem("finishTime");
    const storedIsFlow = localStorage.getItem("isFlow");
    const storedMode = localStorage.getItem("mode");
    const storedSessionDuration = localStorage.getItem("currentSessionDuration");
  
    let newTime;
    if (storedIsRunning === "true" && storedFinishTime) {
      const finishTime = parseInt(storedFinishTime, 10);
      newTime = Math.floor((finishTime - Date.now()) / 1000);
      if (newTime < 0) newTime = 0;
    } else {
      // Set fallback timer length based on stored mode
      if (storedMode === "shortBreak") {
        newTime = shortBreakDuration * 60;
      } else if (storedMode === "longBreak") {
        newTime = longBreakDuration * 60;
      } else {
        newTime = flowDuration * 60;
      }
    }
    setTimeLeft(newTime);
  
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
    // Resume running if it was running before leaving the page
    if (storedIsRunning === "true") {
      setIsRunning(true);
    }
  }, [flowDuration, shortBreakDuration, longBreakDuration]);

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
  // SESSION COMPLETE HANDLER (memoized)
  // --------------------------------
  const completeSession = useCallback((skip = false) => {
    if (isFlow) {
      const elapsedSeconds = currentSessionDuration - timeLeft;
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
        // End of cycle: move to long break.
        setIsFlow(false);
        newTime = longBreakDuration * 60;
        setCurrentCycle(0);
        setMode("longBreak");
        localStorage.setItem("mode", "longBreak");
        localStorage.setItem("isFlow", "false");
      } else {
        // Otherwise: move to short break.
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
      // Set finishTime for the new session
      localStorage.setItem("finishTime", Date.now() + newTime * 1000);

      if (skip && startBreaksAutomatically) {
        setIsRunning(true);
        localStorage.setItem("isRunning", "true");
      } else {
        setIsRunning(false);
        localStorage.setItem("isRunning", "false");
      }
    } else {
      // Break finished: move to focus.
      setIsFlow(true);
      const newTime = flowDuration * 60;
      setTimeLeft(newTime);
      setCurrentSessionDuration(newTime);
      localStorage.setItem("timeLeft", newTime);
      localStorage.setItem("currentSessionDuration", newTime);
      setMode("focus");
      localStorage.setItem("mode", "focus");
      // Set finishTime for the new session
      localStorage.setItem("finishTime", Date.now() + newTime * 1000);

      if (skip && startFlowsAutomatically) {
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
    stats 
  ]);

  const completeSessionRef = useRef(completeSession);
  useEffect(() => {
    completeSessionRef.current = completeSession;
  }, [completeSession]);

  // --------------------------------
  // MAIN TIMER EFFECT USING finishTime
  // --------------------------------
  useEffect(() => {
    if (!isRunning) return;
  
    let storedFinishTime = localStorage.getItem("finishTime");
    let finishTime = parseInt(storedFinishTime, 10);
    if (isNaN(finishTime)) {
      finishTime = Date.now() + flowDuration * 60 * 1000;
      localStorage.setItem("finishTime", finishTime);
    }
  
    const timer = setInterval(() => {
      // Use Math.ceil to avoid skipping a second due to slight delays
      const newTime = Math.ceil((finishTime - Date.now()) / 1000);
      if (newTime <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        setTimeout(() => completeSessionRef.current(true), 0);
      } else {
        setTimeLeft(newTime);
        localStorage.setItem("timeLeft", newTime);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isRunning, flowDuration, shortBreakDuration, longBreakDuration, mode]);

  // --------------------------------
  // RESET TIMER WHEN USER SIGNS OUT
  // --------------------------------
  const resetTimerOnAuthChange = useCallback(() => {
    localStorage.removeItem("finishTime");
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
    if (!stats) return;
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
    // Update toggles and cycle (these settings don’t force a timer reset by themselves)
    setStartBreaksAutomatically(newStartBreaks);
    setStartFlowsAutomatically(newStartFlows);
    setCycle(newCycle);
  
    // Update timer durations for focus and breaks
    setFlowDuration(newFlow);
    setShortBreakDuration(newShort);
    setLongBreakDuration(newLong);
  
    // Reset the timer state to the first iteration (focus mode)
    const newTime = newFlow * 60;
    setTimeLeft(newTime);
    setCurrentSessionDuration(newTime);
    setMode("focus");
    setCurrentCycle(0);
  
    // Update localStorage accordingly
    localStorage.setItem("timeLeft", newTime);
    localStorage.setItem("currentSessionDuration", newTime);
    localStorage.setItem("mode", "focus");
    localStorage.setItem("isFlow", "true");
    localStorage.setItem("isRunning", "false");
    localStorage.removeItem("finishTime");
  
    // Close the settings modal
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
      <div className="mode-label">
        {mode === "focus" ? "Focus" : mode === "shortBreak" ? "Break" : "Long Break"}
      </div>
      <div className="timer-display">{formatTime(timeLeft)}</div>
      <div className="controls-row">
        <button
          className="start-button"
          onClick={() => {
            if (!isRunning) {
              // Set finishTime when starting the timer
              localStorage.setItem("finishTime", Date.now() + timeLeft * 1000);
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
          <img
            src="/settingsGear.svg"
            alt="Settings"
            className={theme === "dark" ? "gear-icon dark-mode" : "gear-icon"}
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
  );
};

export default PomodoroTimer;
