import React, { useState, useEffect } from 'react'
import { User, Mail, ArrowRight, Shield, Lock, Briefcase } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'

const Login = ({ onLogin, sessionExpired }) => {
  const navigate = useNavigate()

  // Input States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [profession, setProfession] = useState('')

  // Loading, Timer, Error
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (sessionExpired) {
      setError('Session expired. Please login again.')
    }
  }, [sessionExpired])

  // Common Helpers
  const resetForm = () => {
    setError('')
    setSuccessMsg('')
    setIsLoading(false)
  }



  // --- LOGIN FLOWS ---
  const handleLoginPassword = async (e) => {
    e.preventDefault()
    resetForm()
    setIsLoading(true)
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login-password', {
        email, password
      })
      completeLogin(response.data.token, response.data.user)
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  // --- GOOGLE LOGIN ---
  const handleGoogleSuccess = async (credentialResponse) => {
    resetForm()
    setIsLoading(true)
    try {
      const response = await axios.post('http://localhost:8080/api/auth/google', {
        idToken: credentialResponse.credential
      })
      completeLogin(response.data.token, response.data.user)
    } catch (err) {
      console.error(err)
      setError('Failed to authenticate with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const completeLogin = (token, userObj) => {
    const userData = {
      id: userObj.id,
      email: userObj.email,
      name: userObj.username, // mapping for backwards compatibility on frontend components
      profession: userObj.profession,
      isLoggedIn: true,
      authMethod: userObj.authProvider.toLowerCase()
    }
    localStorage.setItem('userData', JSON.stringify(userData))
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('authMethod', userData.authMethod)
    localStorage.setItem('token', token)

    // Add token explicitly to subsequent requests directly here as well before relying on interceptor
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    onLogin(userData)
  }

  // --- RENDER LOGIC ---
  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-header">
          <div className="login-logo">
            <Shield size={32} />
          </div>
          <h1>
            Welcome Back
          </h1>
          <p>
            Sign in to your account
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMsg && <div className="success-message" style={{ color: '#10b981', marginBottom: '15px', fontSize: '14px', textAlign: 'center', backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>{successMsg}</div>}

        <div className="login-tabs">
          <form className="login-form" onSubmit={handleLoginPassword}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="login-btn" disabled={isLoading || !email || !password}>
              {isLoading ? <div className="loading-spinner"></div> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="login-footer">
            <div className="google-login-section">
              <div className="divider"><span>OR</span></div>
              <div className="google-btn-container" style={{ marginBottom: "20px" }}>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Sign-In was unsuccessful.')} useOneTap theme="filled_blue" shape="rectangular" width="100%" />
              </div>
            </div>
            <p>Don't have an account? <Link to="/register" style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none' }}>Register Here</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
