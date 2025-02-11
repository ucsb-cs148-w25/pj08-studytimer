import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar/Navbar';
import Profile from './components/Profile/Profile';
import CalendarPage from './components/Calendar/CalendarPage';
import TaskManager from './components/ToDo/TaskManager';
import About from './components/About/About';
import Settings from './components/AppSettings/Settings';
import SettingsModal from './components/Home/SettingsModal';
import './App.css';

const freezeSound = new Audio('/sounds/freeze.mp3');

const App = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  
  // Timer Settings
  const [totalTime, setTotalTime] = useState(1500); // Total study time in seconds
  const [breakTime, setBreakTime] = useState(300); // Break time in seconds
  const [numberOfBreaks, setNumberOfBreaks] = useState(1); // Number of breaks
  
  // Timer State
  const [time, setTime] = useState(totalTime);
  const [segments, setSegments] = useState([]);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [breakCount, setBreakCount] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate study segments when settings change
  useEffect(() => {
    const newSegments = [];
    const numSegments = numberOfBreaks + 1;
    const perSegment = Math.floor(totalTime / numSegments);
    let remaining = totalTime;

    for (let i = 0; i < numSegments; i++) {
      newSegments.push(i === numSegments - 1 ? remaining : perSegment);
      remaining -= perSegment;
    }

    setSegments(newSegments);
    resetTimer(newSegments);
  }, [totalTime, numberOfBreaks]);

  const resetTimer = (newSegments = segments) => {
    setIsRunning(false);
    setCurrentSegment(0);
    setBreakCount(0);
    setOnBreak(false);
    setTime(newSegments[0] || totalTime);
  };

  // Main timer logic
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => setTime(prev => prev - 1), 1000);
    }

    if (time === 0) {
      if (onBreak) {
        // Break ended
        const newBreakCount = breakCount + 1;
        setBreakCount(newBreakCount);
        setOnBreak(false);
        
        if (currentSegment < segments.length - 1) {
          setCurrentSegment(prev => prev + 1);
          setTime(segments[currentSegment + 1]);
        } else {
          setIsRunning(false);
        }
      } else {
        // Study segment ended
        if (breakCount < numberOfBreaks) {
          setOnBreak(true);
          setTime(breakTime);
          freezeSound.play();
        } else if (currentSegment < segments.length - 1) {
          setCurrentSegment(prev => prev + 1);
          setTime(segments[currentSegment + 1]);
        } else {
          setIsRunning(false);
        }
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, time, onBreak, currentSegment, breakCount, segments]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSettingsChange = (newTotalTime, newBreakTime, newNumBreaks) => {
    setTotalTime(newTotalTime);
    setBreakTime(newBreakTime);
    setNumberOfBreaks(newNumBreaks);
    resetTimer();
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
                  <div className="icy-text">
                    {onBreak ? "Take a Break ❄️" : "Focus Time ⚡"}
                  </div>
                </div>
                
                <div className="timer-display">
                  {formatTime(time)}
                  <div className="session-info">
                    Session {currentSegment + 1} of {segments.length}
                  </div>
                </div>

                <div className="timer-controls">
                  <button
                    className="primary-button"
                    onClick={() => setIsRunning(!isRunning)}
                  >
                    {isRunning ? 'Pause' : 'Start'}
                  </button>
                  
                  {onBreak && (
                    <button
                      className="end-break-button"
                      onClick={() => setTime(0)}
                    >
                      End Break Early
                    </button>
                  )}

                  <button
                    className="reset-button"
                    onClick={resetTimer}
                  >
                    Reset
                  </button>

                  <button
                    className="settings-button"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <img src="/settingsGear.svg" alt="Settings" className='settings-icon'/>
                  </button>
                </div>

                <SettingsModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  onSettingsChange={handleSettingsChange}
                  initialTotalTime={totalTime}
                  initialBreakTime={breakTime}
                  initialNumBreaks={numberOfBreaks}
                />
              </div>
            }
          />
          {/* Other routes remain the same */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;