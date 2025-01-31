import React, { useState } from 'react';

const SettingsModal = ({ isOpen, onClose, totalTime, setTotalTime, breakTime, setBreakTime }) => {
  const [formattedTime, setFormattedTime] = useState(formatTime(totalTime)); // Initialize with the formatted current time

  if (!isOpen) return null; // Do not render if modal is closed

  const handleInputChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Allow only digits
    const currentDigits = formattedTime.replace(/:/g, ''); // Remove colons for raw digits

    if (value.length < currentDigits.length) {
      // Handle backspace/delete
      const newInput = '0' + currentDigits.slice(0, -1); // Shift digits right and add a leading zero
      const timeInSeconds = parseTime(newInput);
      setTotalTime(timeInSeconds);
      setFormattedTime(formatTime(timeInSeconds));
    } else if (value.length > currentDigits.length) {
      // Handle adding new digits
      const newInput = currentDigits.slice(1) + value.slice(-1); // Shift digits left and add the new digit
      const timeInSeconds = parseTime(newInput);
      setTotalTime(timeInSeconds);
      setFormattedTime(formatTime(timeInSeconds));
    }
  };

  const handleAddTime = (seconds) => {
    const newTime = totalTime + seconds;
    if (newTime >= 0) {
      setTotalTime(newTime);
      setFormattedTime(formatTime(newTime));
    }
  };

  const handleBreakTimeChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setBreakTime(value * 60); // Convert minutes to seconds
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Settings</h2>
        <span style={styles.timerLabel}>Timer Duration</span>
        {/* Timer Duration Input */}
        <div style={styles.timerInputContainer}>
          <input
            type="text"
            style={styles.timerInput}
            value={formattedTime}
            onChange={handleInputChange}
          />
        </div>

        {/* Increment Buttons */}
        <div style={styles.buttonsContainer}>
          <button style={styles.incrementButton} onClick={() => handleAddTime(30)}>
            +0:30
          </button>
          <button style={styles.incrementButton} onClick={() => handleAddTime(60)}>
            +1:00
          </button>
          <button style={styles.incrementButton} onClick={() => handleAddTime(300)}>
            +5:00
          </button>
        </div>

        {/* Break Time Input */}
        <div>
          <label style={styles.breakLabel}>
            Break Time (minutes):
            <input
              type="number"
              style={styles.breakInput}
              value={breakTime !== null ? breakTime / 60 : ''} // Convert seconds to minutes
              onChange={handleBreakTimeChange}
            />
          </label>
        </div>

        {/* Save & Close Button */}
        <div>
          <button style={{ ...styles.button, backgroundColor: '#61dafb' }} onClick={onClose}>
            Save & Close
          </button>
        </div>
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

// Modal Styles
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    color: '#000',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    width: '300px',
    boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
  },
  timerInputContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px 0',
  },
  timerInput: {
    fontSize: '1.5rem',
    textAlign: 'center',
    border: '1px solid #ccc',
    borderRadius: '5px',
    padding: '5px',
    width: '150px',
  },
  timerLabel: {
    fontSize: '1rem',
    marginBottom: '10px',
  },
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    margin: '10px 0',
  },
  incrementButton: {
    padding: '10px 20px',
    fontSize: '0.9rem',
    borderRadius: '5px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    cursor: 'pointer',
  },
  breakLabel: {
    display: 'block',
    margin: '10px 0',
    fontSize: '1rem',
  },
  breakInput: {
    width: '80%',
    padding: '8px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
    textAlign: 'center',
  },
  button: {
    padding: '10px 20px',
    margin: '10px',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default SettingsModal;
