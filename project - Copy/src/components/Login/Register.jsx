import React, { useState } from 'react'
import { User, Mail, ArrowRight, Shield, Lock, Briefcase } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'

const Register = ({ onLogin }) => {
    const navigate = useNavigate()

    // Input States
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [profession, setProfession] = useState('')

    // Loading, Error
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    // Common Helpers
    const resetForm = () => {
        setError('')
        setSuccessMsg('')
        setIsLoading(false)
    }

    // --- REGISTRATION FLOW ---
    const handleRegister = async (e) => {
        e.preventDefault()
        resetForm()

        // Client-side strong password check to save API calls
        if (password.length < 8 || !/.*[A-Z].*/.test(password) || !/.*[0-9].*/.test(password) || !/.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*/.test(password)) {
            setError("Password must be 8+ chars and contain an uppercase letter, number, and special character.")
            return;
        }

        setIsLoading(true)
        try {
            await axios.post('https://taskpilot-backend-n09v.onrender.com/api/auth/register', {
                username, email, password, profession
            })
            setSuccessMsg("Registration successful! You can now log in.")
            // Auto-navigate to login page after success optionally, but here we just show success and direct them.
            setTimeout(() => {
                navigate('/login')
            }, 2000)
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed")
        } finally {
            setIsLoading(false)
        }
    }

    // --- GOOGLE LOGIN ---
    const handleGoogleSuccess = async (credentialResponse) => {
        resetForm()
        setIsLoading(true)
        try {
            const response = await axios.post('https://taskpilot-backend-n09v.onrender.com/api/auth/google', {
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
            name: userObj.username,
            profession: userObj.profession,
            isLoggedIn: true,
            authMethod: userObj.authProvider.toLowerCase()
        }
        localStorage.setItem('userData', JSON.stringify(userData))
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('authMethod', userData.authMethod)
        localStorage.setItem('token', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        onLogin(userData)
        navigate('/dashboard')
    }

    return (
        <div className="login-container">
            <div className="login-card">

                <div className="login-header">
                    <div className="login-logo">
                        <Shield size={32} />
                    </div>
                    <h1>
                        Create Account
                    </h1>
                    <p>
                        Join TaskPilot AI
                    </p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {successMsg && <div className="success-message" style={{ color: '#10b981', marginBottom: '15px', fontSize: '14px', textAlign: 'center', backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>{successMsg}</div>}

                <form className="login-form" onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Username</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Profession</label>
                        <div className="input-wrapper">
                            <Briefcase size={18} className="input-icon" />
                            <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="e.g. Engineer, Designer" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="8+ chars, 1 Uppercase, 1 Num, 1 Spec" />
                        </div>
                    </div>
                    <button type="submit" className="login-btn" disabled={isLoading || !email || !password || !username}>
                        {isLoading ? <div className="loading-spinner"></div> : <>Create Account <ArrowRight size={18} /></>}
                    </button>
                    <div className="login-footer">
                        <div className="google-login-section">
                            <div className="divider"><span>OR</span></div>
                            <div className="google-btn-container" style={{ marginBottom: "20px" }}>
                                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Sign-In was unsuccessful.')} useOneTap theme="filled_blue" shape="rectangular" width="100%" />
                            </div>
                        </div>
                        <p>Already have an account? <Link to="/login" style={{ color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none' }}>Sign In</Link></p>
                    </div>
                </form>

            </div>
        </div>
    )
}

export default Register
