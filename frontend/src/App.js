import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar/Navbar';
import Profile from './components/Profile/Profile';
import CalendarPage from './components/Calendar/CalendarPage';
import TaskManager from './components/ToDo/TaskManager';
import About from './components/About/About';
import Settings from './components/AppSettings/Settings';
import SettingsModal from './components/Home/SettingsModal';
import unlockAchievement from "./components/Profile/unlockAchievement";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import initializeAchievements from "./utils/initializeAchievements";
import initializeStats from "./utils/initializeStats";
import './App.css';

// Example sound effect
const freezeSound = new Audio('/sounds/freeze.mp3');

const App = () => {
  // ------------------------------------------------------------------
  // State: The total study time (in seconds) & break time (in seconds)
  // ------------------------------------------------------------------
  const [totalTime, setTotalTime] = useState(1800); // e.g. 30 minutes
  const [breakTime, setBreakTime] = useState(300);  // e.g. 5 minutes
  const [numBreaks, setNumBreaks] = useState(3);

  // ------------------------------------------------------------------
  // State: The main study timer and the break timer
  // ------------------------------------------------------------------
  const [studyTimeLeft, setStudyTimeLeft] = useState(totalTime);
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);

  // Are we currently studying or on break?
  const [onBreak, setOnBreak] = useState(false);

  // Overall session control
  const [isRunning, setIsRunning] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Keep track of how many breaks have started
  const [breakIndex, setBreakIndex] = useState(0);

  // ------------------------------------------------------------------
  // Modal state
  // ------------------------------------------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);

  const auth = getAuth();
  const db = getFirestore();


  // Update Firestore stats
  const updateUserStats = useCallback(async (studyTimeIncrement, breaksTaken = 0) => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const statsRef = doc(db, `users/${userId}`);
  
    try {
      const statsSnap = await getDoc(statsRef);
      let newStats = {
        totalStudyTime: studyTimeIncrement,
        totalBreaksTaken: breaksTaken,
        studySessions: 0,
        longestSession: 0,
        lastSessionDate: new Date().toISOString(),
      };
  
      if (statsSnap.exists() && statsSnap.data().stats) {
        const stats = statsSnap.data().stats;
        newStats = {
          totalStudyTime: stats.totalStudyTime + studyTimeIncrement,
          totalBreaksTaken: stats.totalBreaksTaken + breaksTaken,
          studySessions: stats.studySessions,
          longestSession: stats.longestSession,
          lastSessionDate: new Date().toISOString(),
        };
      }
  
      await updateDoc(statsRef, { stats: newStats });
  
      // Unlock Achievements
      const achievementsToCheck = [
        "first_timer", "study_5_sessions", "study_10_sessions", "study_20_sessions",
        "study_1_hour", "study_5_hours", "study_10_hours", "break_10_taken",
        "break_25_taken", "longest_30_min", "longest_1_hour", "consistency_week"
      ];
      for (const achievementId of achievementsToCheck) {
        await unlockAchievement(achievementId);
      }
  
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  }, [auth.currentUser, db]);

  // ------------------------------------------------------------------
  // Break thresholds: The time-left values at which a break occurs
  // For numBreaks = 3 and totalTime = 1800s, intervals of 600s:
  // => breaks happen when studyTimeLeft hits 1200, then 600, then 0.
  // We'll generate them in descending order for convenience.
  // ------------------------------------------------------------------
  const breakPoints = useCallback(() => {
    if (numBreaks <= 0) return [];
    const interval = totalTime / (numBreaks + 1); // Ensuring equal spacing
  
    return Array.from({ length: numBreaks }, (_, i) => Math.floor(totalTime - (i + 1) * interval));
  }, [totalTime, numBreaks]);
  
  
  // ------------------------------------------------------------------
  // Called when we finish the session or time hits 0 after final break
  // ------------------------------------------------------------------
  const finishSession = useCallback(() => {
    setIsRunning(false);
    setSessionComplete(true);
    setStudyTimeLeft(0);
    alert('Session complete!');
    updateUserStats(0, 0);
  }, []);
  
  

  // ------------------------------------------------------------------
  // Start a break: Pause the main study timer, set breakTimeLeft
  // ------------------------------------------------------------------
  const startBreak = useCallback(() => {
    if (!breakTime) return;
    setOnBreak(true);
    setBreakTimeLeft(breakTime);
    freezeSound.play();
  
    // Only update the break count in Firestore, don't affect breakIndex
    updateUserStats(0, 1);
  }, [breakTime, updateUserStats]);
  
  
  
  

  // ------------------------------------------------------------------
  // End the break (either time ran out or user clicked skip)
  // ------------------------------------------------------------------
  const endBreak = useCallback(() => {
    setOnBreak(false);
    setBreakTimeLeft(0);
  
    // Increment breakIndex properly, independent of Firestore updates
    setBreakIndex((prev) => (prev < numBreaks ? prev + 1 : prev));
  }, [numBreaks]);
  
  

  
  // ------------------------------------------------------------------
  // Initialize Achievements
  // ------------------------------------------------------------------

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        initializeAchievements(); // Initialize achievements
        initializeStats(); // Initialize stats
      }
    });
  
    return () => unsubscribe();
  }, []);

  // ------------------------------------------------------------------
  // The main "study" timer effect
  // Runs once per second if isRunning && !onBreak && !sessionComplete
  // ------------------------------------------------------------------

  useEffect(() => {
    if (!isRunning || onBreak || sessionComplete) return;
  
    const timer = setInterval(() => {
      setStudyTimeLeft((prev) => {
        const nextVal = prev - 1;
        updateUserStats(1); // Updates user study time every second
  
        const breakThresholds = breakPoints();
        if (breakIndex < breakThresholds.length && nextVal === breakThresholds[breakIndex]) {
          clearInterval(timer);
          startBreak();
          return nextVal;
        }
  
        if (nextVal <= 0) {
          clearInterval(timer);
          finishSession();
          return 0;
        }
  
        return nextVal;
      });
    }, 1000);
  
    return () => clearInterval(timer);
  }, [isRunning, onBreak, sessionComplete, breakIndex, finishSession, startBreak, breakPoints, updateUserStats]);
  

  // ------------------------------------------------------------------
  // The break timer effect
  // Runs once per second if onBreak && isRunning
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isRunning || !onBreak || sessionComplete) return;

    const timer = setInterval(() => {
      setBreakTimeLeft((prev) => {
        const nextVal = prev - 1;
        if (nextVal <= 0) {
          clearInterval(timer);
          // Break ended by countdown
          endBreak();
        }
        return nextVal > 0 ? nextVal : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, onBreak, sessionComplete, endBreak]);
  

  // ------------------------------------------------------------------
  // Reset everything
  // ------------------------------------------------------------------
  const resetTimer = () => {
    setIsRunning(false);
    setSessionComplete(false);
    setOnBreak(false);
    setBreakIndex(0);
    setStudyTimeLeft(totalTime);
    setBreakTimeLeft(0);
  };

  // ------------------------------------------------------------------
  // Skip break => end break immediately
  // ------------------------------------------------------------------
  const skipBreak = () => {
    if (!onBreak) return;
    setBreakTimeLeft(0);
    endBreak();
  };

  // ------------------------------------------------------------------
  // Helper: Add or subtract time from whichever timer is currently running
  // ------------------------------------------------------------------
  const handleAddTime = (seconds) => {
    if (!onBreak) {
      // Adjust study time
      const newVal = studyTimeLeft + seconds;
      setStudyTimeLeft(newVal > 0 ? newVal : 0);
    } else {
      // Adjust break time
      const newVal = breakTimeLeft + seconds;
      setBreakTimeLeft(newVal > 0 ? newVal : 0);
    }
  };

  // ------------------------------------------------------------------
  // Format time for display: HH:MM:SS → e.g. 00:20:15
  // ------------------------------------------------------------------
  const formatTime = (sec) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;

    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ------------------------------------------------------------------
  // Apply new settings from the modal (in HH:MM:SS)
  // ------------------------------------------------------------------
  const handleSettingsChange = (newTotalTime, newBreakTime, newNumBreaks) => {
    setIsRunning(false);
    setSessionComplete(false);
    setOnBreak(false);
    setBreakIndex(0);

    setTotalTime(newTotalTime);
    setBreakTime(newBreakTime);
    setNumBreaks(newNumBreaks);

    // Reset the timers
    setStudyTimeLeft(newTotalTime);
    setBreakTimeLeft(0);
  };

  // ------------------------------------------------------------------
  // Which timer do we display?
  //  - If on break, show breakTimeLeft
  //  - Otherwise show the main studyTimeLeft
  // ------------------------------------------------------------------
  const displayTime = onBreak ? breakTimeLeft : studyTimeLeft;

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <Router>
      <div className="app-container">
        <Navbar />

        <Routes>
          <Route
            path="/"
            element={
              <div className="timer-page">
                {/* Icy overlay if on break */}
                <div className={`icy-overlay ${onBreak ? 'visible' : ''}`}>
                  <div className="icy-text">Take a Break ❄️</div>
                </div>

                {/* Timer display */}
                <div className="timer-display">
                  {sessionComplete
                    ? "Session Complete!"
                    : formatTime(displayTime)}
                </div>

                {/* Info about how many breaks remain */}
                {!sessionComplete && (
                  <div className="segment-info">
                    {onBreak
                      ? `Break ${breakIndex + 1} of ${numBreaks}`
                      : `Study Time (breaks used: ${breakIndex}/${numBreaks})`
                    }
                  </div>
                )}

                {/* Quick-add time buttons */}
                <div className="time-adjust-buttons">
                  <button
                    className="adjust-button"
                    onClick={() => handleAddTime(60)}
                  >
                    +1 min
                  </button>
                  <button
                    className="adjust-button"
                    onClick={() => handleAddTime(180)}
                  >
                    +3 min
                  </button>
                  <button
                    className="adjust-button"
                    onClick={() => handleAddTime(300)}
                  >
                    +5 min
                  </button>
                </div>

                {/* Timer controls */}
                <div className="timer-controls">
                  {/* Start/Pause */}
                  <button
                    className="primary-button"
                    onClick={() => {
                      if (sessionComplete) {
                        // If session is over, this restarts
                        resetTimer();
                      } else {
                        setIsRunning(!isRunning);
                      }
                    }}
                  >
                    {sessionComplete
                      ? "Restart"
                      : isRunning
                      ? "Pause"
                      : "Start"
                    }
                  </button>

                  {/* Reset */}
                  <button className="reset-button" onClick={resetTimer}>
                    Reset
                  </button>

                  {/* Skip Break only if on break */}
                  {onBreak && (
                    <button className="skip-break-button" onClick={skipBreak}>
                      Skip Break
                    </button>
                  )}

                  {/* Settings modal */}
                  <button
                    className="settings-button"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <img
                      src="/settingsGear.svg"
                      alt="Settings"
                      className="settings-icon"
                    />
                  </button>
                </div>

                {/* Settings Modal */}
                <SettingsModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  totalTime={totalTime}
                  breakTime={breakTime}
                  numBreaks={numBreaks}
                  handleSettingsChange={handleSettingsChange}
                />
              </div>
            }
          />

          {/* Other routes */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/task_manager" element={<TaskManager />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
