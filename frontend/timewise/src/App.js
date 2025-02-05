import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import CalendarPage from './components/CalendarPage';
import TaskManager from './components/TaskManager';
import About from './components/About';
import Settings from './components/Settings';
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
      backgroundColor: '#1e1e2f',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    timerText: {
      fontSize: '3rem',
      fontWeight: 'bold',
      margin: '20px 0',
    },
    button: {
      padding: '15px 30px', // Increased padding for larger buttons
      margin: '15px',
      fontSize: '1.2rem', // Larger font size
      border: 'none',
      borderRadius: '10px', // Rounded buttons for better aesthetics
      cursor: 'pointer',
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)', // Subtle shadow for depth
      transition: 'all 0.3s ease-in-out',
    },
    buttonsContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px', // Adds space between buttons
      margin: '15px 0', // Adds spacing from the timer and other buttons
    },    
    incrementButton: {
      padding: '12px 24px', // More padding for better appearance
      fontSize: '1rem',
      fontWeight: 'bold',
      borderRadius: '8px', // Rounded edges for a modern look
      backgroundColor: '#3b82f6', // Nice blue color
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.15)',
    },
    // Hover Effect
    incrementButtonHover: {
      backgroundColor: '#2563eb', // Darker blue on hover
      transform: 'scale(1.05)', // Slight scaling effect
    },
    startButton: {
      backgroundColor: '#61dafb',
      color: '#1e1e2f',
    },
    resetButton: {
      backgroundColor: '#ff6666',
      color: 'white',
    },
    settingsButton: {
      backgroundColor: '#ffcc00',
      color: '#1e1e2f',
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
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
  };

  const handleAddTime = (seconds) => {
    const newTime = time + seconds;
    if (newTime >= 0) {
      setTime(newTime);
    }
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

              {/* Timer */}
              <div style={styles.timerText}>{formatTime(time)}</div>

              {/* Increment Buttons */}
              <div style={styles.buttonsContainer}>
                <button
                  style={styles.incrementButton}
                  onMouseOver={(e) => (e.target.style.backgroundColor = styles.incrementButtonHover.backgroundColor)}
                  onMouseOut={(e) => (e.target.style.backgroundColor = styles.incrementButton.backgroundColor)}
                  onClick={() => handleAddTime(30)}
                >
                  +0:30
                </button>
                <button
                  style={styles.incrementButton}
                  onMouseOver={(e) => (e.target.style.backgroundColor = styles.incrementButtonHover.backgroundColor)}
                  onMouseOut={(e) => (e.target.style.backgroundColor = styles.incrementButton.backgroundColor)}
                  onClick={() => handleAddTime(60)}
                >
                  +1:00
                </button>
                <button
                  style={styles.incrementButton}
                  onMouseOver={(e) => (e.target.style.backgroundColor = styles.incrementButtonHover.backgroundColor)}
                  onMouseOut={(e) => (e.target.style.backgroundColor = styles.incrementButton.backgroundColor)}
                  onClick={() => handleAddTime(300)}
                >
                  +5:00
                </button>
              </div>

              {/* Buttons */}
              <div>
                <button
                  style={{ ...styles.button, ...styles.startButton }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#42a1f5')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#61dafb')}
                  onClick={() => setIsRunning(!isRunning)}
                >
                  {isRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  style={{ ...styles.button, ...styles.resetButton }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#ff4c4c')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#ff6666')}
                  onClick={() => {
                    setIsRunning(false);
                    setTime(1500); // Always reset to 25 minutes (1500 seconds)
                    setTotalTime(1500); // Ensure totalTime is also reset to 25 minutes
                    setHalfwayReached(false);
                  }}
                >
                  Reset
                </button>
                <button
                  style={{ ...styles.button, ...styles.settingsButton }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#f3b000')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#ffcc00')}
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
        <Route path="/about" element={<About />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
};

export default App;
