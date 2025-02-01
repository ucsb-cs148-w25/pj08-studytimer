import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import CalendarPage from './components/CalendarPage';
import TaskManager from './components/TaskManager';
import About from './components/About';
import Settings from './components/Settings';
import SettingsModal from './components/SettingsModal';
import './App.css'; // Import external styles

// ----------------------
// Sounds
// ----------------------
const freezeSound = new Audio('/sounds/freeze.mp3');

const App = () => {
  // ----------------------
  // Timer state variables
  // ----------------------
  const [time, setTime] = useState(1500); // Default timer in seconds (25 minutes)
  const [totalTime, setTotalTime] = useState(1500);
  const [breakTime, setBreakTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [halfwayReached, setHalfwayReached] = useState(false);

  // ----------------------
  // Modal state
  // ----------------------
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ----------------------
  // Timer logic
  // ----------------------
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    }

    if (time === Math.floor(totalTime / 2) && !halfwayReached) {
      if (breakTime) {
        setIsRunning(true);
        setOnBreak(true);
        setHalfwayReached(true);
        setTime(breakTime);
        freezeSound.play();
      }
    }

    if (time === 0) {
      if (onBreak) {
        setOnBreak(false);
        setTime(totalTime / 2);
        freezeSound.play();
      } else {
        setIsRunning(false);
        setHalfwayReached(false);
        setTime(totalTime);
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, time, onBreak, halfwayReached, totalTime, breakTime]);

  // ----------------------
  // Handle settings change
  // ----------------------
  const handleSettingsChange = (newTotalTime, newBreakTime) => {
    setIsRunning(false);
    setTime(newTotalTime);
    setTotalTime(newTotalTime);
    setBreakTime(newBreakTime);
    setHalfwayReached(false);
  };

  // ----------------------
  // Helper function
  // ----------------------
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <div className="timer-page">
                <div className={`icy-overlay ${onBreak ? 'visible' : ''}`}>
                  <div className="icy-text">Take a Break ❄️</div>
                </div>
                <div className="timer-display">{formatTime(time)}</div>
                <div className="timer-controls">
                  <button
                    className="primary-button"
                    onClick={() => setIsRunning(!isRunning)}
                  >
                    {isRunning ? 'Pause' : 'Start'}
                  </button>
                  <button
                    className="reset-button"
                    onClick={() => {
                      setIsRunning(false);
                      setTime(totalTime);
                      setHalfwayReached(false);
                    }}
                  >
                    Reset
                  </button>
                  <button
                    className="settings-button"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Settings
                  </button>
                </div>

                {/* Settings Modal */}
                <SettingsModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  totalTime={totalTime}
                  setTotalTime={(newTime) => handleSettingsChange(newTime, breakTime)}
                  breakTime={breakTime}
                  setBreakTime={(newBreakTime) => handleSettingsChange(totalTime, newBreakTime)}
                />
              </div>
            }
          />
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
