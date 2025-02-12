import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar/Navbar';
import Profile from './components/Profile/Profile';
import CalendarPage from './components/Calendar/CalendarPage';
import TaskManager from './components/ToDo/TaskManager';
import About from './components/About/About';
import Settings from './components/AppSettings/Settings';
import SettingsModal from './components/Home/SettingsModal';
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

  // ------------------------------------------------------------------
  // Break thresholds: The time-left values at which a break occurs
  // For numBreaks = 3 and totalTime = 1800s, intervals of 600s:
  // => breaks happen when studyTimeLeft hits 1200, then 600, then 0.
  // We'll generate them in descending order for convenience.
  // ------------------------------------------------------------------
  const breakPoints = useCallback(() => {
    if (numBreaks <= 0) return [];
    const interval = totalTime / numBreaks; // e.g., 1800 / 3 = 600
    const points = [];
    for (let i = 1; i <= numBreaks; i++) {
      points.push(Math.floor(totalTime - i * interval)); 
      // e.g. i=1 => 1200, i=2 => 600, i=3 => 0
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
    alert('Session complete!');
  }, []);

  // ------------------------------------------------------------------
  // Start a break: Pause the main study timer, set breakTimeLeft
  // ------------------------------------------------------------------
  const startBreak = useCallback(() => {
    if (!breakTime) {
      // If there's no breakTime set, just continue or finish
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
        // If the main timer hits 0 => session ends
        if (nextVal <= 0) {
          clearInterval(timer);
          finishSession();
          return 0;
        }

        // Check if we've hit the next break threshold
        const bPoints = breakPoints();
        // If we still have breaks to trigger:
        if (breakIndex < bPoints.length) {
          const nextBreakThreshold = bPoints[breakIndex]; 
          // e.g. if breakIndex=0 => threshold=1200
          // If nextVal <= that threshold => time for a break
          if (nextVal <= nextBreakThreshold) {
            clearInterval(timer);
            // Start the break
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
        </Routes>
      </div>
    </Router>
  );
};

export default App;
