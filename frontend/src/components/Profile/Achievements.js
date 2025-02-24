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
  const [totalTime, setTotalTime] = useState(1800); // e.g. 30 minutes
  const [breakTime, setBreakTime] = useState(300);  // e.g. 5 minutes
  const [numBreaks, setNumBreaks] = useState(3);
  const [studyTimeLeft, setStudyTimeLeft] = useState(totalTime);
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);
  const [onBreak, setOnBreak] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [breakIndex, setBreakIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  // ------------------------------------------------------------------
  // Update Firestore stats in real-time
  // ------------------------------------------------------------------
  const updateUserStats = async (studyTimeIncrement, breaksTaken = 0) => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const statsRef = doc(db, `users/${userId}`);

    try {
      const statsSnap = await getDoc(statsRef);
      let newStats = {
        totalStudyTime: studyTimeIncrement,
        totalBreaksTaken: breaksTaken,
        studySessions: 0, // Incremented only at the end of a session
        longestSession: 0,
        lastSessionDate: new Date().toISOString(),
      };

      if (statsSnap.exists() && statsSnap.data().stats) {
        const stats = statsSnap.data().stats;
        newStats = {
          totalStudyTime: stats.totalStudyTime + studyTimeIncrement,
          totalBreaksTaken: stats.totalBreaksTaken + breaksTaken,
          studySessions: stats.studySessions, // Don't count new sessions mid-session
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
  };

  // ------------------------------------------------------------------
  // Called when the session is completed
  // ------------------------------------------------------------------
  const finishSession = useCallback(() => {
    setIsRunning(false);
    setSessionComplete(true);
    setStudyTimeLeft(0);
    alert('Session complete!');
    updateUserStats(0, breakIndex); // Now only tracks session completion
  }, [breakIndex]);

  // ------------------------------------------------------------------
  // Initialize Achievements & Stats when user logs in
  // ------------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        initializeAchievements(); // Initialize achievements
        initializeStats(); // Initialize stats
      }
    });

    return () => unsubscribe();
  }, []);

  // ------------------------------------------------------------------
  // The main "study" timer effect (now updates Firestore every second)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isRunning || onBreak || sessionComplete) return;

    const timer = setInterval(() => {
      setStudyTimeLeft((prev) => {
        const nextVal = prev - 1;
        updateUserStats(1); // Update Firestore every second

        if (nextVal <= 0) {
          clearInterval(timer);
          finishSession();
          return 0;
        }
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, onBreak, sessionComplete, finishSession]);

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
          setOnBreak(false);
          setBreakTimeLeft(0);
          setBreakIndex((prev) => prev + 1);
        }
        return nextVal > 0 ? nextVal : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, onBreak, sessionComplete]);

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
  // Render
  // ------------------------------------------------------------------
  return (
    <Router>
      <div className="app-container">
        <Navbar />

        <Routes>
          <Route path="/" element={
            <div className="timer-page">
              {/* Timer Display */}
              <div className="timer-display">
                {sessionComplete ? "Session Complete!" : new Date(studyTimeLeft * 1000).toISOString().substr(11, 8)}
              </div>

              {/* Timer Controls */}
              <div className="timer-controls">
                <button onClick={() => setIsRunning(!isRunning)}>
                  {isRunning ? "Pause" : "Start"}
                </button>
                <button onClick={resetTimer}>Reset</button>
              </div>

              {/* Settings Modal */}
              <SettingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>
          } />

          {/* Other routes */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/task_manager" element={<TaskManager />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
