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

// ----------------------
// Sounds
// ----------------------
const freezeSound = new Audio('/sounds/freeze.mp3');

const App = () => {
  // ----------------------
  // Timer states
  // ----------------------
  const [time, setTime] = useState(1500);       // Current countdown (in seconds)
  const [totalTime, setTotalTime] = useState(1500); // Total study duration (in seconds)
  const [breakTime, setBreakTime] = useState(null); // Single break duration (in seconds) or null
  const [numBreaks, setNumBreaks] = useState(0);    // Number of breaks user wants

  const [isRunning, setIsRunning] = useState(false);    // Is the timer ticking?
  const [onBreak, setOnBreak] = useState(false);         // Are we currently on break?
  const [currentSegment, setCurrentSegment] = useState(1); // Which segment we're on (1..numBreaks+1)
  const [breaksUsed, setBreaksUsed] = useState(0);       // How many breaks have been used so far
  const [sessionComplete, setSessionComplete] = useState(false); // Did we finish all segments?

  // ----------------------
  // Modal state
  // ----------------------
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ----------------------
  // Calculate length of each study segment
  // (Divide totalTime by numBreaks + 1)
  // ----------------------
  const segmentTime = useCallback(() => {
    const segments = numBreaks > 0 ? numBreaks + 1 : 1;
    return Math.floor(totalTime / segments);
  }, [numBreaks, totalTime]);

  // ----------------------
  // Finish the session
  // ----------------------
  const finishSession = useCallback(() => {
    setIsRunning(false);
    setSessionComplete(true);
    setTime(0);
    alert('Session complete!');
  }, []);

  // ----------------------
  // End of a STUDY segment
  // ----------------------
  const endSegment = useCallback(() => {
    // If we still have breaks left, go on break
    if (breaksUsed < numBreaks && breakTime) {
      setOnBreak(true);
      setTime(breakTime);
      freezeSound.play();
      // remain isRunning = true
    } else {
      // No break left => move to next segment
      setCurrentSegment((prev) => {
        const nextSeg = prev + 1;
        // If we exceed the total # of segments => session complete
        if (nextSeg > numBreaks + 1) {
          finishSession();
          return prev;
        } else {
          setTime(segmentTime());
          return nextSeg;
        }
      });
    }
  }, [breaksUsed, numBreaks, breakTime, finishSession, segmentTime]);

  // ----------------------
  // End of a BREAK
  // ----------------------
  const endBreak = useCallback(() => {
    setOnBreak(false);
    setBreaksUsed((prev) => prev + 1);

    setCurrentSegment((prev) => {
      const nextSeg = prev + 1;
      if (nextSeg > numBreaks + 1) {
        finishSession();
        return prev;
      } else {
        setTime(segmentTime());
        return nextSeg;
      }
    });
  }, [numBreaks, finishSession, segmentTime]);

  // ----------------------
  // Main Timer Loop
  // ----------------------
  useEffect(() => {
    // If not running or session is done, do nothing
    if (!isRunning || sessionComplete) return;

    const timer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // On time up:
          if (onBreak) {
            endBreak();
          } else {
            endSegment();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup
    return () => clearInterval(timer);
    // Make sure to include everything used in this effect:
  }, [
    isRunning,
    sessionComplete,
    onBreak,
    endBreak,
    endSegment,
  ]);

  // ----------------------
  // "Reset" => stop & reset everything
  // ----------------------
  const resetTimer = () => {
    setIsRunning(false);
    setOnBreak(false);
    setSessionComplete(false);
    setBreaksUsed(0);
    setCurrentSegment(1);
    // Reinitialize time to first segment
    setTime(segmentTime());
  };

  // ----------------------
  // Manually skip or end break early
  // ----------------------
  const skipBreak = () => {
    if (!onBreak) return;
    endBreak(); // treat break as if time ran out
  };

  // ----------------------
  // Helper: Add or subtract time
  // ----------------------
  const handleAddTime = (seconds) => {
    const newTime = time + seconds;
    if (newTime >= 0) {
      setTime(newTime);
    }
  };

  // ----------------------
  // Format time for display
  // ----------------------
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const hDisplay = hrs > 0 ? `${hrs}h ` : '';
    const mDisplay = mins > 0 ? `${mins}m ` : '';
    const sDisplay = `${secs}s`;
    return hDisplay + mDisplay + sDisplay;
  };

  // ----------------------
  // Update states from SettingsModal
  // ----------------------
  const handleSettingsChange = (newTotalTime, newBreakTime, newNumBreaks) => {
    // Stop any current timer
    setIsRunning(false);

    // Update states
    setTotalTime(newTotalTime);
    setBreakTime(newBreakTime);
    setNumBreaks(newNumBreaks);

    // Reset derived states
    setOnBreak(false);
    setSessionComplete(false);
    setBreaksUsed(0);
    setCurrentSegment(1);

    // Initialize time to the first study segment
    const firstSeg =
      newNumBreaks > 0
        ? Math.floor(newTotalTime / (newNumBreaks + 1))
        : newTotalTime;
    setTime(firstSeg);
  };

  // ----------------------
  // Render
  // ----------------------
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
                  {sessionComplete ? 'Session Complete!' : formatTime(time)}
                </div>

                {/* Which segment are we on? */}
                {!sessionComplete && (
                  <div className="segment-info">
                    Segment {currentSegment} of {numBreaks + 1}
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
                    +5 mins
                  </button>
                </div>

                {/* Timer controls */}
                <div className="timer-controls">
                  <button
                    className="primary-button"
                    onClick={() => {
                      if (sessionComplete) {
                        // If already complete, let this button reset or start new session
                        resetTimer();
                      } else {
                        setIsRunning(!isRunning);
                      }
                    }}
                  >
                    {sessionComplete
                      ? 'Restart Session'
                      : isRunning
                      ? 'Pause'
                      : 'Start'}
                  </button>

                  <button className="reset-button" onClick={resetTimer}>
                    Reset
                  </button>

                  {/* Skip break only if on break */}
                  {onBreak && (
                    <button className="skip-break-button" onClick={skipBreak}>
                      Skip Break
                    </button>
                  )}

                  {/* Open settings modal */}
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
