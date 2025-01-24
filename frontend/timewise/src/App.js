import React, { useState, useEffect } from 'react';

const App = () => {
  // Timer state variables
  const [time, setTime] = useState(1500); // 25 minutes in seconds
  const [breakTime, setBreakTime] = useState(300); // Default break time: 5 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);

  // Styles
  const styles = {
    app: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
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
  };

  // Timer logic
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    }

    if (time === 0) {
      setIsRunning(false);
      setOnBreak(!onBreak);
      setTime(onBreak ? 1500 : breakTime);
      alert(onBreak ? 'Work session over! Time for a break.' : 'Break over! Back to work.');
    }

    return () => clearInterval(timer);
  }, [isRunning, time, onBreak, breakTime]);

  // Helper function to format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
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
            setTime(onBreak ? breakTime : 1500);
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
            value={breakTime / 60}
            onChange={(e) => setBreakTime(e.target.value * 60)}
            min="1"
          />
        </label>
      </div>
    </div>
  );
};

export default App;
