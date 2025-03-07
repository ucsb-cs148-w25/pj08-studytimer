import React, { useState, useEffect, useCallback } from 'react';
import SettingsModal from './SettingsModal';
import './PomodoroTimer.css';

const PomodoroTimer = () => {
  // --------------------------------
  // DEFAULT SETTINGS (in minutes)
  // --------------------------------
  const [flowDuration, setFlowDuration] = useState(25); 
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(30);
  const [cycle, setCycle] = useState(4); // e.g., after 4 flows, use a long break

  // This tracks how many Flow sessions have completed in the current cycle.
  const [currentCycle, setCurrentCycle] = useState(0);

  // Toggles
  const [startBreaksAutomatically, setStartBreaksAutomatically] = useState(false);
  const [startFlowsAutomatically, setStartFlowsAutomatically] = useState(false);

  // --------------------------------
  // TIMER STATE
  // --------------------------------
  const [timeLeft, setTimeLeft] = useState(flowDuration * 60);
  const [isFlow, setIsFlow] = useState(true); 
  const [isRunning, setIsRunning] = useState(false);

  // Display current mode label: "focus", "shortBreak", or "longBreak"
  const [mode, setMode] = useState("focus");

  // --------------------------------
  // MODAL STATE
  // --------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --------------------------------
  // SESSION COMPLETE HANDLER (memoized)
  // --------------------------------
  const completeSession = useCallback((skip = false) => {
    if (isFlow) {
      // Finished a Flow session
      if (currentCycle + 1 === cycle) {
        // Completed a full cycle → Long Break
        setIsFlow(false);
        setTimeLeft(longBreakDuration * 60);
        setCurrentCycle(0);
        setMode("longBreak");
        if (skip && startBreaksAutomatically) {
          setIsRunning(true);
        } else if (!skip && !startBreaksAutomatically) {
          setIsRunning(false);
        }
      } else {
        // Otherwise, use a Short Break
        setIsFlow(false);
        setTimeLeft(shortBreakDuration * 60);
        setCurrentCycle(currentCycle + 1);
        setMode("shortBreak");
        if (skip && startBreaksAutomatically) {
          setIsRunning(true);
        } else if (!skip && !startBreaksAutomatically) {
          setIsRunning(false);
        }
      }
    } else {
      // Finished a Break session → Start a new Flow
      setIsFlow(true);
      setTimeLeft(flowDuration * 60);
      setMode("focus");
      if (skip && startFlowsAutomatically) {
        setIsRunning(true);
      } else if (!skip && !startFlowsAutomatically) {
        setIsRunning(false);
      }
    }
  }, [
    isFlow,
    currentCycle,
    cycle,
    shortBreakDuration,
    longBreakDuration,
    flowDuration,
    startBreaksAutomatically,
    startFlowsAutomatically
  ]);

  // --------------------------------
  // EFFECT: MAIN TIMER
  // --------------------------------
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isRunning,
    completeSession
  ]);

  // --------------------------------
  // FORMAT TIME FOR DISPLAY
  // --------------------------------
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // --------------------------------
  // HANDLE SETTINGS SAVE
  // --------------------------------
  const handleSettingsSave = (
    newFlow,
    newShort,
    newLong,
    newCycle,
    newStartBreaks,
    newStartFlows
  ) => {
    setFlowDuration(newFlow);
    setShortBreakDuration(newShort);
    setLongBreakDuration(newLong);
    setCycle(newCycle);
    setStartBreaksAutomatically(newStartBreaks);
    setStartFlowsAutomatically(newStartFlows);

    // Reset current cycle count and update timeLeft based on current mode.
    setCurrentCycle(0);
    setTimeLeft(isFlow ? newFlow * 60 : newShort * 60);
    setIsRunning(false);

    // Set mode accordingly.
    setMode(isFlow ? "focus" : "shortBreak");
  };

  // --------------------------------
  // HANDLE SKIP BUTTON
  // --------------------------------
  const handleSkip = () => {
    completeSession(true);
  };

  // --------------------------------
  // RENDER
  // --------------------------------
  return (
    <div className="pomodoro-timer-container">
      {/* Mode Label */}
      <div className="mode-label">
        {mode === "focus" ? "Focus" : mode === "shortBreak" ? "Break" : "Long Break"}
      </div>

      {/* TIME DISPLAY */}
      <div className="timer-display">{formatTime(timeLeft)}</div>

      {/* BUTTONS: START, SKIP, SETTINGS */}
      <div className="controls-row">
        <button
          className="start-button"
          onClick={() => setIsRunning((prev) => !prev)}
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>

        <button className="skip-button" onClick={handleSkip}>
          Skip
        </button>

        <button
          className="gear-button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Settings"
        >
          <img src="/settingsGear.svg" alt="Settings" />
        </button>
      </div>

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        flowDuration={flowDuration}
        shortBreakDuration={shortBreakDuration}
        longBreakDuration={longBreakDuration}
        cycle={cycle}
        startBreaksAutomatically={startBreaksAutomatically}
        startFlowsAutomatically={startFlowsAutomatically}
        onSave={handleSettingsSave}
      />
    </div>
  );
};

export default PomodoroTimer;
