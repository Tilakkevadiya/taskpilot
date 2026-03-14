import React, { useState, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import ForgotPassword from './components/Auth/ForgotPassword'
import VerifyEmail from './components/Auth/VerifyEmail'
import ResetPassword from './components/Auth/ResetPassword'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Dashboard from './components/Dashboard/Dashboard'
import Tasks from './components/Tasks/Tasks'
import Email from './components/Email/Email'
import Meetings from './components/Meetings/Meetings'
import Documents from './components/Documents/Documents'
import Assistant from './components/Assistant/Assistant'
import Premium from './components/Premium/Premium'
import PaymentSuccess from './components/Payment/PaymentSuccess'
import PaymentCancelled from './components/Payment/PaymentCancelled'
import { UsageProvider } from './context/UsageContext'
import { Toaster } from 'react-hot-toast'

import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import './App.css'

// Lazy load landing page for better performance
const LandingPage = React.lazy(() => import('./pages/LandingPage'))

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
        />
        <Route path="/login" element={<Login setAuthParams={() => {}} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected App Routes Wrapper */}
        <Route path="/*" element={
          <PrivateRoute>
            <div className="app">
              <div className="app-layout">
                <Sidebar />
                <div className="main-content">
                  <Header
                    userData={user || { name: "User", email: "user@example.com" }}
                    onLogout={logout}
                  />
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/email" element={<Email />} />
                    <Route path="/meetings" element={<Meetings />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/assistant" element={<Assistant />} />
                    <Route path="/upgrade" element={<Premium />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/payment-cancelled" element={<PaymentCancelled />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                  <Footer />
                </div>
              </div>
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId="759293200220-bdr3pls4l7kp3j4sjeapi6erlhn8186h.apps.googleusercontent.com">
      <AuthProvider>
        <UsageProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1e293b",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "12px 16px"
              }
            }}
          />
          <Router>
            <AppContent />
          </Router>
        </UsageProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
