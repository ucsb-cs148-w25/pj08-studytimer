import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import CalendarPage from './components/CalendarPage';
import TaskManager from './components/TaskManager';
import SettingsModal from './components/SettingsModal';

// ----------------------
// Sounds
// ----------------------

const freezeSound = new Audio('/sounds/freeze.mp3');

const App = () => {
  // ----------------------
  // Timer state variables
  // ----------------------
  const [time, setTime] = useState(1500); // Default timer in seconds (25 minutes)
  const [totalTime, setTotalTime] = useState(1500); // User-defined total timer duration
  const [breakTime, setBreakTime] = useState(null); // Default break time: null
  const [isRunning, setIsRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [halfwayReached, setHalfwayReached] = useState(false);

  // ----------------------
  // Modal state
  // ----------------------
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ----------------------
  // Styles
  // ----------------------
  const styles = {
    app: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#282c34',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    timer: {
      fontSize: '4rem',
      margin: '20px',
    },
    button: {
      padding: '10px 20px',
      margin: '10px',
      fontSize: '1rem',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    icyOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(173, 216, 230, 0.5)', // Light icy blue with transparency
      backdropFilter: 'blur(8px)', // Frosted glass effect
      display: onBreak ? 'block' : 'none',
      zIndex: 10, // Ensure it's on top
    },
    icyText: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '3rem',
      fontWeight: 'bold',
      color: '#ffffff',
      textShadow: '2px 2px 10px rgba(0, 0, 255, 0.8)', // Icy glow effect
    },
  };

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
    setIsRunning(false); // Stop the timer
    setTime(newTotalTime); // Update the time immediately
    setTotalTime(newTotalTime); // Update total time
    setBreakTime(newBreakTime); // Update break time
    setHalfwayReached(false); // Reset halfway reached flag
  };

  // ----------------------
  // Helper function
  // ----------------------
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ----------------------
  // Return with Routes
  // ----------------------
  return (
    <Router>
      <div style={{ width: '100%' }}>
        <Navbar />
      </div>

      <Routes>
        {/* HOME route — displays your timer logic */}
        <Route
          path="/"
          element={
            <div style={styles.app}>
              {/* Icy Overlay when on break */}
              <div style={styles.icyOverlay}>
                <div style={styles.icyText}>Take a Break ❄️</div>
              </div>

              <h1>timewise</h1>
              <p>Your companion for focused productivity and mindful breaks.</p>

              <div style={styles.timer}>{formatTime(time)}</div>

              <div>
                <button
                  style={{ ...styles.button, backgroundColor: '#61dafb' }}
                  onClick={() => setIsRunning(!isRunning)}
                >
                  {isRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  style={{ ...styles.button, backgroundColor: '#ff6666' }}
                  onClick={() => {
                    setIsRunning(false);
                    setTime(totalTime);
                    setHalfwayReached(false);
                  }}
                >
                  Reset
                </button>
                <button
                  style={{ ...styles.button, backgroundColor: '#ffcc00' }}
                  onClick={() => setIsModalOpen(true)}
                >
                  Settings ⚙️
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

        {/* PROFILE route — displays your Profile component */}
        <Route path="/profile" element={<Profile />} />
        {/* CALENDAR route — displays your Calendar component */}
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/task_manager" element={<TaskManager />} />
      </Routes>
    </Router>
  );
};

export default App;
