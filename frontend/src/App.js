import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar/Navbar';
import Profile from './components/Profile/Profile';
import CalendarPage from './components/Calendar/CalendarPage';
import TaskPage from './components/ToDo/TaskPage';
import About from './components/About/About';
import Settings from './components/AppSettings/Settings';
import SettingsModal from './components/Home/SettingsModal';
import PrivateRoute from './privateRoute';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import unlockAchievement from "./components/Profile/unlockAchievement";
import initializeAchievements from "./utils/initializeAchievements";
import initializeStats from "./utils/initializeStats";
import './App.css'; // Import external styles

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
  
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  // ------------------------------------------------------------------
  // Update Firestore stats function
  // ------------------------------------------------------------------
  // Parameters:
  //   studyTimeIncrement: seconds of study time to add
  //   breaksTaken: number of breaks to add (e.g. 1 per break event)
  //   sessionCompleted: if true, also increments studySessions,
  //                     updates longestSession, and sets lastSessionDate
  const updateUserStats = useCallback(async (studyTimeIncrement, breaksTaken = 0, sessionCompleted = false) => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const statsRef = doc(db, `users/${userId}`);
  
    try {
      const statsSnap = await getDoc(statsRef);
      let currentStats = {
        totalStudyTime: 0,
        totalBreaksTaken: 0,
        studySessions: 0,
        longestSession: 0,
        lastSessionDate: '',
      };
  
      if (statsSnap.exists() && statsSnap.data().stats) {
        currentStats = statsSnap.data().stats;
      }
  
      const newTotalStudyTime = currentStats.totalStudyTime + studyTimeIncrement;
      const newTotalBreaksTaken = currentStats.totalBreaksTaken + breaksTaken;
      const newStudySessions = sessionCompleted ? currentStats.studySessions + 1 : currentStats.studySessions;
      const newLongestSession = sessionCompleted ? Math.max(currentStats.longestSession, studyTimeIncrement) : currentStats.longestSession;
      const newLastSessionDate = sessionCompleted ? new Date().toISOString() : currentStats.lastSessionDate;
  
      const newStats = {
        totalStudyTime: newTotalStudyTime,
        totalBreaksTaken: newTotalBreaksTaken,
        studySessions: newStudySessions,
        longestSession: newLongestSession,
        lastSessionDate: newLastSessionDate,
      };
  
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

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", storedTheme);
  }, []);

  // ------------------------------------------------------------------
  // Break thresholds: The time-left values at which a break occurs
  // ------------------------------------------------------------------
  const breakPoints = useCallback(() => {
    if (numBreaks <= 0) return [];
    const interval = totalTime / numBreaks; // e.g., 1800 / 3 = 600
    const points = [];
    for (let i = 1; i <= numBreaks; i++) {
      points.push(Math.floor(totalTime - i * interval));
    }
    return points;
  }, [totalTime, numBreaks]);

  // ------------------------------------------------------------------
  // Called when we finish the session or time hits 0 after final break
  // ------------------------------------------------------------------
  const finishSession = useCallback(() => {
    setIsRunning(false);
    setSessionComplete(true);
    setStudyTimeLeft(0);

    // Update stats for completed session:
    // - Add the full study time (totalTime)
    // - Do not add additional break count (they are updated separately)
    // - Mark session as completed to increment studySessions,
    //   update longestSession, and lastSessionDate
    updateUserStats(totalTime, 0, true);
  }, [totalTime, updateUserStats]);

  // ------------------------------------------------------------------
  // Start a break: Pause the main study timer, set breakTimeLeft
  // ------------------------------------------------------------------
  const startBreak = useCallback(() => {
    if (!breakTime) {
      return;
    }
    setOnBreak(true);
    setBreakTimeLeft(breakTime);
    freezeSound.play();
  }, [breakTime]);

  // ------------------------------------------------------------------
  // End the break (either time ran out or user clicked skip)
  // ------------------------------------------------------------------
  const endBreak = useCallback(() => {
    setOnBreak(false);
    setBreakTimeLeft(0);

    // If we haven't reached the final break, increment breakIndex
    setBreakIndex((prev) => prev + 1);

    // Record that a break was taken (study time not increased, but 1 break)
    updateUserStats(0, 1, false);
  }, [updateUserStats]);

  // ------------------------------------------------------------------
  // Initialize Achievements and Stats on user login
  // ------------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        initializeAchievements();
        initializeStats();
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // ------------------------------------------------------------------
  // The main "study" timer effect
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isRunning || onBreak || sessionComplete) return;

    const timer = setInterval(() => {
      setStudyTimeLeft((prev) => {
        const nextVal = prev - 1;
        if (nextVal <= 0) {
          clearInterval(timer);
          finishSession();
          return 0;
        }

        // Check if we've hit the next break threshold
        const bPoints = breakPoints();
        if (breakIndex < bPoints.length) {
          const nextBreakThreshold = bPoints[breakIndex];
          if (nextVal <= nextBreakThreshold) {
            clearInterval(timer);
            startBreak();
            return nextVal;
          }
        }

        return nextVal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isRunning,
    onBreak,
    sessionComplete,
    breakIndex,
    finishSession,
    breakPoints,
    startBreak,
  ]);

  // ------------------------------------------------------------------
  // The break timer effect
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isRunning || !onBreak || sessionComplete) return;

    const timer = setInterval(() => {
      setBreakTimeLeft((prev) => {
        const nextVal = prev - 1;
        if (nextVal <= 0) {
          clearInterval(timer);
          // End the break when countdown finishes
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
      const newVal = studyTimeLeft + seconds;
      setStudyTimeLeft(newVal > 0 ? newVal : 0);
    } else {
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

    setStudyTimeLeft(newTotalTime);
    setBreakTimeLeft(0);
  };

  // ------------------------------------------------------------------
  // Which timer do we display?
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
              <>
                <div className="timer-page">
                  <div className={`icy-overlay ${onBreak ? 'visible' : ''}`}>
                    <div className="icy-text">Take a Break ❄️</div>
                  </div>
                  <div className="timer-display">
                    {sessionComplete
                      ? "Session Complete!"
                      : formatTime(displayTime)}
                  </div>
                  {!sessionComplete && (
                    <div className="segment-info">
                      {onBreak
                        ? `Break ${breakIndex + 1} of ${numBreaks}`
                        : `Study Time (breaks used: ${breakIndex}/${numBreaks})`}
                    </div>
                  )}
                  <div className="time-adjust-buttons">
                    <button className="adjust-button" onClick={() => handleAddTime(60)}>
                      +1 min
                    </button>
                    <button className="adjust-button" onClick={() => handleAddTime(180)}>
                      +3 min
                    </button>
                    <button className="adjust-button" onClick={() => handleAddTime(300)}>
                      +5 min
                    </button>
                  </div>
                  <div className="timer-controls">
                    <button
                      className="primary-button"
                      onClick={() => {
                        if (sessionComplete) {
                          resetTimer();
                        } else {
                          setIsRunning(!isRunning);
                        }
                      }}
                    >
                      {sessionComplete ? "Restart" : isRunning ? "Pause" : "Start"}
                    </button>
                    <button className="reset-button" onClick={resetTimer}>
                      Reset
                    </button>
                    {onBreak && (
                      <button className="skip-break-button" onClick={skipBreak}>
                        Skip Break
                      </button>
                    )}
                    <button className="settings-button" onClick={() => setIsModalOpen(true)}>
                      <img src="/settingsGear.svg" alt="Settings" className="settings-icon" />
                    </button>
                  </div>
                  <SettingsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    totalTime={totalTime}
                    breakTime={breakTime}
                    numBreaks={numBreaks}
                    handleSettingsChange={handleSettingsChange}
                  />
                </div>
              </>
            }
          />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/calendar" element={
            <PrivateRoute>
              <CalendarPage />
            </PrivateRoute>
          } />
          <Route path="/taskpage" element={
            <PrivateRoute>
              <TaskPage uid={user ? user.uid : null} />
            </PrivateRoute>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
