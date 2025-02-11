import React, { useState, useEffect } from 'react';
import './SettingsModal.css';

/**
 * Props:
 *  - isOpen          (bool)
 *  - onClose         (fn)
 *  - totalTime       (seconds)
 *  - breakTime       (seconds or null)
 *  - numBreaks       (integer)
 *  - handleSettingsChange (fn) => handleSettingsChange(newTotalTime, newBreakTime, newNumBreaks)
 */

const SettingsModal = ({
  isOpen,
  onClose,
  totalTime,
  breakTime,
  numBreaks,
  handleSettingsChange,
}) => {
  const [formattedTime, setFormattedTime] = useState(formatTime(totalTime));
  const [localBreakTime, setLocalBreakTime] = useState(
    breakTime !== null ? breakTime / 60 : ''
  );
  const [localNumBreaks, setLocalNumBreaks] = useState(numBreaks);

  useEffect(() => {
    setFormattedTime(formatTime(totalTime));
    setLocalBreakTime(breakTime !== null ? breakTime / 60 : '');
    setLocalNumBreaks(numBreaks);
  }, [totalTime, breakTime, numBreaks]);

  if (!isOpen) return null;

  // Handle typed input in the HH:MM:SS field
  const handleInputChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Keep digits only
    const currentDigits = formattedTime.replace(/:/g, '');

    if (value.length < currentDigits.length) {
      // user backspaced
      const newInput = '0' + currentDigits.slice(0, -1);
      const timeInSeconds = parseTime(newInput);
      setFormattedTime(formatTime(timeInSeconds));
    } else if (value.length > currentDigits.length) {
      // user typed a new digit
      const newInput = currentDigits.slice(1) + value.slice(-1);
      const timeInSeconds = parseTime(newInput);
      setFormattedTime(formatTime(timeInSeconds));
    }
  };

  const handleInputBlur = () => {
    const timeInSeconds = parseTime(formattedTime.replace(/:/g, ''));
    const validTime = Math.max(timeInSeconds, 1);
    setFormattedTime(formatTime(validTime));
    // We only finalize the timer in parent after user finishes editing
  };

  // If user clicks "Apply" or closes modal, we’ll pass the values up
  const handleApplySettings = () => {
    const newTotalTime = parseTime(formattedTime.replace(/:/g, ''));
    let newBreakTime = null;
    if (localBreakTime !== '') {
      const parsedBreak = parseInt(localBreakTime, 10);
      if (!isNaN(parsedBreak) && parsedBreak >= 0) {
        newBreakTime = parsedBreak * 60;
      }
    }
    const newNumBreaks = parseInt(localNumBreaks, 10) || 0;

    // Fire the parent’s callback
    handleSettingsChange(newTotalTime, newBreakTime, newNumBreaks);
    onClose();
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>

        {/* Study Duration */}
        <div>
          <span className="timer-label">Timer Duration</span>
          <div className="timer-input-container">
            <input
              type="text"
              className="timer-input"
              value={formattedTime}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
            />
          </div>
        </div>

        {/* Break Duration */}
        <div>
          <span className="break-label">Break Duration (minutes)</span>
          <label className="break-input-container">
            <input
              type="number"
              className="break-input"
              value={localBreakTime}
              onChange={(e) => {
                setLocalBreakTime(e.target.value);
              }}
              min="0"
            />
          </label>
        </div>

        {/* Number of Breaks */}
        <div>
          <span className="break-count-label">Number of Breaks</span>
          <label className="break-count-input-container">
            <input
              type="number"
              className="break-input"
              value={localNumBreaks}
              onChange={(e) => {
                setLocalNumBreaks(e.target.value);
              }}
              min="0"
            />
          </label>
        </div>

        <div>
          <button className="save-button" onClick={handleApplySettings}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------
// Helper Functions
// ----------------------
/** Convert totalSeconds -> "HH:MM:SS" string */
const formatTime = (totalSeconds) => {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

/** Convert "HHMMSS" digits -> totalSeconds */
const parseTime = (input) => {
  const hours = parseInt(input.slice(0, 2), 10) || 0;
  const minutes = parseInt(input.slice(2, 4), 10) || 0;
  const seconds = parseInt(input.slice(4, 6), 10) || 0;
  return hours * 3600 + minutes * 60 + seconds;
};

export default SettingsModal;
