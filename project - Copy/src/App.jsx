import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import Dashboard from './components/Dashboard/Dashboard'
import Tasks from './components/Tasks/Tasks'
import Email from './components/Email/Email'
import Meetings from './components/Meetings/Meetings'
import Documents from './components/Documents/Documents'
import Assistant from './components/Assistant/Assistant'
import Premium from './components/Premium/Premium'
import PaymentSuccess from './components/Payment/PaymentSuccess'
import PaymentCancelled from './components/Payment/PaymentCancelled'
import Login from './components/Login/Login'
import Register from './components/Login/Register'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import './App.css'

// Global Axios configuration for JWT
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  }
);

function App() {
  const [showPremium, setShowPremium] = useState(false)

  // Synchronously initialize auth state to prevent flash
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true')
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('userData');
    return saved ? JSON.parse(saved) : null;
  })

  const [sessionExpiredError, setSessionExpiredError] = useState(false)

  useEffect(() => {
    const handleAuthExpired = () => {
      handleLogout();
      setSessionExpiredError(true);
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [])

  const handleLogin = (user) => {
    setIsLoggedIn(true)
    setUserData(user)
  }

  const handleLogout = () => {
    // Clear all user data
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userData')
    localStorage.removeItem('isPremium')
    localStorage.removeItem('premiumPlan')
    localStorage.removeItem('premiumActivated')
    localStorage.removeItem('authMethod')
    localStorage.removeItem('token')

    setIsLoggedIn(false)
    setUserData(null)
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={!isLoggedIn ? <Login onLogin={handleLogin} sessionExpired={sessionExpiredError} /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/register"
          element={!isLoggedIn ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" replace />}
        />

        {/* Protected App Routes Wrapper */}
        <Route path="/*" element={
          isLoggedIn ? (
            <div className="app">
              <div className="app-layout">
                <Sidebar />
                <div className="main-content">
                  <Header
                    onPremiumClick={() => setShowPremium(true)}
                    userData={userData}
                    onLogout={handleLogout}
                  />
                  <div className="content-area">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/email" element={<Email />} />
                      <Route path="/meetings" element={<Meetings />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/assistant" element={<Assistant />} />
                      <Route path="/payment-success" element={<PaymentSuccess />} />
                      <Route path="/payment-cancelled" element={<PaymentCancelled />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </div>
                </div>
              </div>
              <Premium isOpen={showPremium} onClose={() => setShowPremium(false)} />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Router>
  )
}

export default App
