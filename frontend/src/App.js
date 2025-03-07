import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar/Navbar';
import Profile from './components/Profile/Profile';
import CalendarPage from './components/Calendar/CalendarPage';
import TaskPage from './components/ToDo/TaskPage';
import About from './components/About/About';
import Settings from './components/AppSettings/Settings';
import PrivateRoute from './privateRoute';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Import the PomodoroTimer (Flow Timer) as a separate component
import PomodoroTimer from './components/Home/PomodoroTimer';

import './App.css'; // your global styles

const App = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, [auth]);

  return (
    <Router>
      <div className="app-container" data-theme="dark">
        <Navbar />

        <Routes>
          <Route
            path="/"
            element={
              <PomodoroTimer />
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <CalendarPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/taskpage"
            element={
              <PrivateRoute>
                <TaskPage uid={user ? user.uid : null} />
              </PrivateRoute>
            }
          />
          <Route path="/about" element={<About />} />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
