import React, { useState, useEffect } from 'react';
import './SettingsModal.css';

/**
 * Props:
 *  - isOpen                (bool)
 *  - onClose               (fn)
 *  - totalTime             (seconds)
 *  - breakTime             (seconds or null)
 *  - numBreaks             (integer)
 *  - handleSettingsChange  (fn) => handleSettingsChange(newTotalTime, newBreakTime, newNumBreaks)
 */

const SettingsModal = ({
  isOpen,
  onClose,
  totalTime,
  breakTime,
  numBreaks,
  handleSettingsChange,
}) => {
  const [formattedStudyTime, setFormattedStudyTime] = useState(formatTime(totalTime));
  const [formattedBreakTime, setFormattedBreakTime] = useState(
    breakTime !== null ? formatTime(breakTime) : formatTime(0)
  );
  const [localNumBreaks, setLocalNumBreaks] = useState(numBreaks);

  useEffect(() => {
    setFormattedStudyTime(formatTime(totalTime));
    setFormattedBreakTime(breakTime !== null ? formatTime(breakTime) : formatTime(0));
    setLocalNumBreaks(numBreaks);
  }, [totalTime, breakTime, numBreaks]);

  if (!isOpen) return null;

  // If user typed into the HH:MM:SS field, parse it
  const handleStudyTimeChange = (e) => {
    setFormattedStudyTime(e.target.value);
  };

  const handleBreakTimeChange = (e) => {
    setFormattedBreakTime(e.target.value);
  };

  const handleStudyTimeBlur = () => {
    const secs = parseTime(formattedStudyTime);
    setFormattedStudyTime(formatTime(Math.max(secs, 1)));
  };

  const handleBreakTimeBlur = () => {
    const secs = parseTime(formattedBreakTime);
    setFormattedBreakTime(formatTime(Math.max(secs, 0)));
  };

  // When the user clicks "Apply" or closes modal, pass the new values up
  const handleApplySettings = () => {
    const newStudyTime = Math.max(parseTime(formattedStudyTime), 1);
    const newBreakTime = Math.max(parseTime(formattedBreakTime), 0);
    const newNumBreaks = parseInt(localNumBreaks, 10) || 0;

    handleSettingsChange(newStudyTime, newBreakTime, newNumBreaks);
    onClose();
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>
        
        {/* Study Duration (HH:MM:SS) */}
        <div>
          <label className="timer-label">Study Duration (HH:MM:SS)</label>
          <div className="timer-input-container">
            <input
              type="text"
              className="timer-input"
              value={formattedStudyTime}
              onChange={handleStudyTimeChange}
              onBlur={handleStudyTimeBlur}
            />
          </div>
        </div>

        {/* Break Duration (HH:MM:SS) */}
        <div>
          <label className="timer-label">Break Duration (HH:MM:SS)</label>
          <div className="timer-input-container">
            <input
              type="text"
              className="timer-input"
              value={formattedBreakTime}
              onChange={handleBreakTimeChange}
              onBlur={handleBreakTimeBlur}
            />
          </div>
        </div>

        {/* Number of Breaks */}
        <div>
          <label className="timer-label">Number of Breaks</label>
          <div className="timer-input-container">
            <input
              type="number"
              className="timer-input"
              value={localNumBreaks}
              onChange={(e) => setLocalNumBreaks(e.target.value)}
              min="0"
            />
          </div>
        </div>

        {/* Confirm */}
        <div>
          <button className="save-button" onClick={handleApplySettings}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Utility: convert totalSeconds -> "HH:MM:SS"
 */
function formatTime(totalSeconds) {
  const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

/**
 * Utility: parse "HH:MM:SS" -> totalSeconds
 */
function parseTime(timeString) {
  const parts = timeString.split(':').map((p) => parseInt(p, 10) || 0);
  // e.g. "01:05:30" => [1, 5, 30]
  while (parts.length < 3) {
    parts.unshift(0); // ensure we have [hh, mm, ss]
  }
  const [hh, mm, ss] = parts;
  return hh * 3600 + mm * 60 + ss;
}

export default SettingsModal;
