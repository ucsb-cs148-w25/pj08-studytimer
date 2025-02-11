import React, { useState } from 'react';
import './SettingsModal.css';

const SettingsModal = ({
  isOpen,
  onClose,
  onSettingsChange,
  initialTotalTime,
  initialBreakTime,
  initialNumBreaks
}) => {
  const [totalTime, setTotalTime] = useState(initialTotalTime);
  const [breakTime, setBreakTime] = useState(initialBreakTime);
  const [numBreaks, setNumBreaks] = useState(initialNumBreaks);

  const handleTotalTimeChange = (e) => {
    const value = e.target.value;
    const seconds = parseTimeInput(value);
    setTotalTime(seconds);
  };

  const handleBreakTimeChange = (e) => {
    const value = e.target.value;
    const seconds = parseTimeInput(value);
    setBreakTime(seconds);
  };

  const parseTimeInput = (input) => {
    const parts = input.split(':').reverse();
    return parts.reduce((acc, part, index) => {
      return acc + (parseInt(part) || 0) * Math.pow(60, index);
    }, 0);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hrs > 0 ? hrs.toString().padStart(2, '0') : null,
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  const handleSave = () => {
    onSettingsChange(totalTime, breakTime, numBreaks);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Timer Settings</h2>

        <div className="setting-group">
          <label>Total Study Time (HH:MM:SS)</label>
          <input
            type="text"
            value={formatTime(totalTime)}
            onChange={handleTotalTimeChange}
            placeholder="00:25:00"
          />
        </div>

        <div className="setting-group">
          <label>Break Duration (MM:SS)</label>
          <input
            type="text"
            value={formatTime(breakTime).replace(/^00:/, '')}
            onChange={handleBreakTimeChange}
            placeholder="05:00"
          />
        </div>

        <div className="setting-group">
          <label>Number of Breaks</label>
          <input
            type="number"
            min="0"
            value={numBreaks}
            onChange={(e) => setNumBreaks(Math.max(0, parseInt(e.target.value) || 0))}
          />
        </div>

        <button className="save-button" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;