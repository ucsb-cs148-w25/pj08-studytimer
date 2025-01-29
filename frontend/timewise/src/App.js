import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import TaskManager from './components/TaskManager';

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
    input: {
      margin: '10px',
      padding: '10px',
      fontSize: '1rem',
      borderRadius: '5px',
      border: '1px solid #ccc',
    },
    sidebar: {
      position: 'absolute',
      right: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: '#444',
      padding: '20px',
      borderRadius: '10px',
    },
    slider: {
      width: '100%',
      margin: '20px 0',
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
        setIsRunning(false);
        setOnBreak(true);
        setHalfwayReached(true);
        setTime(breakTime);
        alert('Halfway point reached! Time for a break.');
      }
    }

    if (time === 0) {
      if (onBreak) {
        setOnBreak(false);
        setTime(totalTime / 2);
      } else {
        setIsRunning(false);
        setHalfwayReached(false);
        setTime(totalTime);
        alert('Session complete!');
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, time, onBreak, halfwayReached, totalTime, breakTime]);

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
      {/* Navbar is always visible */}
      <div style={{ width: '100%' }}>
        <Navbar />
      </div>

      <Routes>
        {/* HOME route — displays your timer logic */}
        <Route
          path="/"
          element={
            <div style={styles.app}>
              <h1>Timewise</h1>
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
              </div>

              <div>
                <label>
                  Break Time (minutes):
                  <input
                    type="number"
                    style={styles.input}
                    value={breakTime !== null ? breakTime / 60 : ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value) && value >= 0) {
                        setBreakTime(value * 60);
                      } else if (e.target.value === '') {
                        setBreakTime(null);
                      }
                    }}
                    placeholder="No break"
                  />
                </label>
              </div>

              <div style={styles.sidebar}>
                <label>
                  Timer Duration (minutes):
                  <input
                    type="range"
                    style={styles.slider}
                    min="5"
                    max="60"
                    value={totalTime / 60}
                    onChange={(e) => {
                      const newTime = e.target.value * 60;
                      setTotalTime(newTime);
                      setTime(newTime);
                      setHalfwayReached(false);
                    }}
                  />
                  <p>{totalTime / 60} minutes</p>
                </label>
              </div>
            </div>
          }
        />

        {/* PROFILE route — displays your Profile component */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/task_manager" element={<TaskManager />} />
      </Routes>
    </Router>
  );
};

export default App;
