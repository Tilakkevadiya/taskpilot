import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader, Github } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import './Auth.css';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName) newErrors.fullName = 'Full Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the Terms & Conditions';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrors({});
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            await axios.post('http://localhost:8080/api/auth/register', {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password
            });

            toast.success("Account created! Please verify your email. 📬");
            navigate('/verify-email');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || "Registration failed";
            toast.error(typeof errorMsg === 'string' ? errorMsg : "Registration failed");
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
            navigate('/dashboard');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || "Google sign-up failed. Please try again.";
            setError(typeof errorMsg === 'string' ? errorMsg : "Google sign-up failed.");
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    return (
        <AuthLayout title="Join TaskPilot" subtitle="Create your account to supercharge your productivity.">
            <form className="auth-form" onSubmit={handleRegister} noValidate>

                <div className="form-group">
                    <label>Full Name</label>
                    <div className="input-wrapper">
                        <User className="input-icon" size={18} />
                        <input
                            type="text"
                            name="fullName"
                            className={`auth-input ${errors.fullName ? 'input-error' : ''}`}
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>
                    {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>

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
                            placeholder="Create a password"
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

                <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="input-wrapper">
                        <Lock className="input-icon" size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            className={`auth-input ${errors.confirmPassword ? 'input-error' : ''}`}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>
                    {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>

                <div className="form-options">
                    <label className={`remember-me ${errors.agreeToTerms ? 'error-text' : ''}`}>
                        <input 
                            type="checkbox" 
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                        />
                        <span>I agree to the Terms & Privacy Policy</span>
                    </label>
                </div>

                <button type="submit" className="auth-btn" disabled={isLoading}>
                    {isLoading ? <Loader className="spinner" size={18} /> : 'Create Account'}
                </button>

                <div className="divider">or continue with</div>

                <div className="social-login">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error("Google sign-up failed.")}
                        text="signup_with"
                        width="100%"
                    />
                </div>

            </form>

            <div className="auth-footer">
                Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
            </div>
        </AuthLayout>
    );
};

export default Register;
