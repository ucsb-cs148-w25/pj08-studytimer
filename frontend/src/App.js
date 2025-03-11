import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
import PomodoroTimer from './components/Home/PomodoroTimer';

import './App.css'; // your global styles

const App = () => {
  // Keeps the Firestore user document in sync with the latest auth profile.
  useSyncUserProfile();

  const [theme] = useState(localStorage.getItem("theme") || "dark");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // Set theme attributes.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen for Firebase auth state changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // Render a loading state until Firebase finishes restoring the auth state.
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className='page'>
        <div>
          <Navbar />
        </div>
        <div className="app-container" data-theme="dark">
          <Routes>
            <Route path="/" element={<PomodoroTimer />} />
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
      </div>
    </Router>
  );
};

export default App;
