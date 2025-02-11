import React, { useState, useEffect } from 'react';
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
  const [time, setTime] = useState(1500);    // Current countdown (in seconds)
  const [totalTime, setTotalTime] = useState(1500); // Total study duration (in seconds)
  const [breakTime, setBreakTime] = useState(null); // Single break duration (in seconds) or null
  const [numBreaks, setNumBreaks] = useState(0);    // Number of breaks user wants

  const [isRunning, setIsRunning] = useState(false);  // Is the timer ticking?
  const [onBreak, setOnBreak] = useState(false);       // Are we currently on break?
  const [currentSegment, setCurrentSegment] = useState(1); // Which segment we’re on (1 to numBreaks+1)
  const [breaksUsed, setBreaksUsed] = useState(0);         // How many breaks have been used
  const [sessionComplete, setSessionComplete] = useState(false); // Did we finish?

  // ----------------------
  // Modal state
  // ----------------------
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ----------------------
  // Calculate the length of each study segment
  // (We divide totalTime by (numBreaks + 1) for multiple breaks)
  // ----------------------
  const segmentTime = () => {
    // Avoid dividing by zero: if numBreaks is 0, then we have 1 segment => totalTime
    const segments = numBreaks > 0 ? numBreaks + 1 : 1;
    return Math.floor(totalTime / segments);
  };

  // ----------------------
  // Effect: Main Timer Loop
  // ----------------------
  useEffect(() => {
    if (!isRunning || sessionComplete) return;

    const timer = setInterval(() => {
      setTime((prevTime) => {
        // If time hits 0, we do "handleTimeUp"
        if (prevTime <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup
    return () => clearInterval(timer);
  }, [isRunning, sessionComplete, onBreak, currentSegment, totalTime, breakTime, numBreaks]);

  // ----------------------
  // Logic: What happens when the countdown reaches 0?
  // ----------------------
  const handleTimeUp = () => {
    // If we are *on break*, then break just ended
    if (onBreak) {
      endBreak();
    }
    // If we are *not* on break, then the study segment ended
    else {
      endSegment();
    }
  };

  // ----------------------
  // End of a STUDY segment
  // ----------------------
  const endSegment = () => {
    // If we still have breaks left, go to break
    if (breaksUsed < numBreaks && breakTime) {
      setOnBreak(true);
      setTime(breakTime);
      freezeSound.play();
      // keep isRunning = true
    } else {
      // No breaks left or breakTime = 0/null => jump to next segment
      setCurrentSegment((prev) => {
        const nextSeg = prev + 1;
        // If we have used all segments => session is complete
        if (nextSeg > numBreaks + 1) {
          finishSession();
          return prev; // or nextSeg, but we won't use it
        } else {
          setTime(segmentTime());
          return nextSeg;
        }
      });
    }
  };

  // ----------------------
  // End of a BREAK
  // ----------------------
  const endBreak = () => {
    setOnBreak(false);
    // Increase breaksUsed
    setBreaksUsed((prev) => {
      const nextBreakCount = prev + 1;
      return nextBreakCount;
    });

    // Move to next segment
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
  };

  // ----------------------
  // Manually skip or end break early
  // (user clicks "Skip Break")
  // ----------------------
  const skipBreak = () => {
    if (!onBreak) return;
    endBreak(); // essentially treat break as finished
  };

  // ----------------------
  // Finish the session
  // ----------------------
  const finishSession = () => {
    setIsRunning(false);
    setSessionComplete(true);
    setTime(0);
    alert('Session complete!');
  };

  // ----------------------
  // "Reset" => stop everything & reset
  // ----------------------
  const resetTimer = () => {
    setIsRunning(false);
    setOnBreak(false);
    setSessionComplete(false);
    setBreaksUsed(0);
    setCurrentSegment(1);
    setTime(segmentTime()); // or setTime(totalTime) if you prefer
  };

  // ----------------------
  // Handle manual time additions
  // ----------------------
  const handleAddTime = (seconds) => {
    const newTime = time + seconds;
    if (newTime >= 0) {
      setTime(newTime);
    }
  };

  // ----------------------
  // Format time (HH:MM:SS or a more human-friendly style)
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

    // Recalculate initial timer display
    // e.g., default to the 1st segment right away
    const firstSegment = newNumBreaks > 0
      ? Math.floor(newTotalTime / (newNumBreaks + 1))
      : newTotalTime;
    setTime(firstSegment);
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
                
                {/* Blue overlay if on break */}
                <div className={`icy-overlay ${onBreak ? 'visible' : ''}`}>
                  <div className="icy-text">Take a Break ❄️</div>
                </div>

                {/* Timer Display */}
                <div className="timer-display">
                  {sessionComplete ? 'Session Complete!' : formatTime(time)}
                </div>

                {/* Optional: Show which segment we’re on */}
                <div className="segment-info">
                  {sessionComplete
                    ? null
                    : `Segment: ${currentSegment} / ${numBreaks + 1}`}
                </div>

                {/* Buttons to Add Time */}
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

                {/* Timer Controls */}
                <div className="timer-controls">
                  {/* Start/Pause */}
                  <button
                    className="primary-button"
                    onClick={() => {
                      // If session is complete, you may want to reset first or do a new session
                      if (sessionComplete) {
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

                  {/* Reset */}
                  <button
                    className="reset-button"
                    onClick={resetTimer}
                  >
                    Reset
                  </button>

                  {/* Skip Break if on break */}
                  {onBreak && (
                    <button
                      className="skip-break-button"
                      onClick={skipBreak}
                    >
                      Skip Break
                    </button>
                  )}

                  {/* Open Settings Modal */}
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
