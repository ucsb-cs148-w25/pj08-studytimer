import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  // Default timer settings (in seconds)
  const defaultTime = 25 * 60;
  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const [timerStart, setTimerStart] = useState(null);

  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
    } else {
      const startTime = Date.now();
      setTimerStart(startTime);
      setIsRunning(true);
    }
  };

  // Timer effect that runs continuously in the background.
  useEffect(() => {
    if (isRunning) {
      // Use the saved start time, or initialize it
      const start = timerStart || Date.now();
      setTimerStart(start);
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - start) / 1000);
        // Update timeLeft without subtracting on every tick cumulatively.
        setTimeLeft(prev => Math.max(defaultTime - elapsed, 0));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timerStart, defaultTime]);

  return (
    <TimerContext.Provider value={{ timeLeft, isRunning, toggleTimer, setTimeLeft }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
