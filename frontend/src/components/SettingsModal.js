import React, { useState } from 'react';
import './SettingsModal.css'; 

const SettingsModal = ({ isOpen, onClose, totalTime, setTotalTime, breakTime, setBreakTime }) => {
  const [formattedTime, setFormattedTime] = useState(formatTime(totalTime));

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    const currentDigits = formattedTime.replace(/:/g, '');

    if (value.length < currentDigits.length) {
      const newInput = '0' + currentDigits.slice(0, -1);
      const timeInSeconds = parseTime(newInput);
      setFormattedTime(formatTime(timeInSeconds));
    } else if (value.length > currentDigits.length) {
      const newInput = currentDigits.slice(1) + value.slice(-1);
      const timeInSeconds = parseTime(newInput);
      setFormattedTime(formatTime(timeInSeconds));
    }
  };

  const handleInputBlur = () => {
    const timeInSeconds = parseTime(formattedTime.replace(/:/g, ''));
    const validTime = Math.max(timeInSeconds, 1);
    setTotalTime(validTime);
    setFormattedTime(formatTime(validTime));
  };

  const handleBreakTimeChange = (e) => {
    const value = e.target.value.trim();
    if (value === '') {
      setBreakTime(null);
      return;
    }

    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue) && parsedValue >= 0) {
      setBreakTime(parsedValue * 60);
    }
  };

  return (
    <div className="settings-overlay" onClick={onClose}>  {/* Close when clicking outside */}
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>  {/* Prevent closing when clicking inside */}
        <h2>Settings</h2>
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
  
        {/* Break Time Input */}
        <div>
          <span className="break-label">Break Duration</span>  {/* Added heading */}
          <label className="break-input-container">
            <input
              type="number"
              className="break-input"
              value={breakTime !== null ? breakTime / 60 : ''}
              onChange={handleBreakTimeChange}
              min="0"
            />
          </label>
        </div>
  
        {/* <div>
          <button className="save-button" onClick={onClose}>Save & Close</button>
        </div> */}
      </div>
    </div>
  );  
};

// Helper Functions
const formatTime = (totalSeconds) => {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const parseTime = (input) => {
  const hours = parseInt(input.slice(0, 2), 10) || 0;
  const minutes = parseInt(input.slice(2, 4), 10) || 0;
  const seconds = parseInt(input.slice(4, 6), 10) || 0;
  return hours * 3600 + minutes * 60 + seconds;
};

export default SettingsModal;
