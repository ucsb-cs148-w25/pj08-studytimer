import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar/Navbar';
import Profile from './components/Profile/Profile';
import useSyncUserProfile from './components/Profile/useSyncUserProfile';
import Community from './components/Community/Community';
import FriendProfile from './components/Profile/FriendProfile';
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
  // This hook keeps the Firestore user document in sync with the latest auth profile.
  useSyncUserProfile();

  const [theme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

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
            path="/community"
            element={
              <PrivateRoute>
                <Community />
              </PrivateRoute>
            }
          />
          <Route
            path="/friend/:friendId"
            element={
              <PrivateRoute>
                <FriendProfile />
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
