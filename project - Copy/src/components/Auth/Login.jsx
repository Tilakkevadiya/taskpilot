import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Github, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import './Auth.css';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.password) newErrors.password = 'Password is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrors({});
        if (!validateForm()) return;
        
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', formData);
            const { accessToken, refreshToken, user } = response.data;

            login(user, accessToken, refreshToken);
            toast.success(`Welcome back, ${user.fullName || 'User'}! 🚀`);
            navigate('/dashboard');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || "Invalid email or password";
            toast.error(typeof errorMsg === 'string' ? errorMsg : "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await axios.post('http://localhost:8080/api/auth/oauth/google', {
                idToken: credentialResponse.credential
            });
            const { accessToken, refreshToken, user } = res.data;
            login(user, accessToken, refreshToken);
            toast.success("Signed in with Google! ✨");
            navigate('/dashboard');
        } catch (err) {
            toast.error("Google sign-in failed.");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <AuthLayout title="Welcome Back" subtitle="Sign in to your account to continue.">
            <form className="auth-form" onSubmit={handleLogin} noValidate>

                <div className="form-group">
                    <label>Email</label>
                    <div className="input-wrapper">
                        <Mail className="input-icon" size={18} />
                        <input
                            type="email"
                            name="email"
                            className={`auth-input ${errors.email ? 'input-error' : ''}`}
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <div className="input-wrapper">
                        <Lock className="input-icon" size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            className={`auth-input ${errors.password ? 'input-error' : ''}`}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                <div className="form-options">
                    <label className="remember-me">
                        <input type="checkbox" />
                        <span>Remember for 30 days</span>
                    </label>
                    <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
                </div>

                <button type="submit" className="auth-btn" disabled={isLoading}>
                    {isLoading ? <Loader className="spinner" size={18} /> : 'Sign In'}
                </button>

                <div className="divider">or continue with</div>

                <div className="social-login">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error("Google login failed.")}
                        text="signin_with"
                        width="100%"
                    />
                </div>

            </form>

            <div className="auth-footer">
                Don't have an account? <Link to="/register" className="auth-link">Sign up</Link>
            </div>
        </AuthLayout>
    );
};

export default Login;
