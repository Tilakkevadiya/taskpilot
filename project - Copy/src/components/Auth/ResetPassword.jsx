import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import './Auth.css';
import axios from 'axios';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!token) {
            setError("Invalid or missing reset token. Please request a new link.");
            return;
        }

        setIsLoading(true);

        try {
            await axios.post('http://localhost:8080/api/auth/reset-password', {
                token,
                newPassword: formData.password
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data || "Failed to reset password. The link might be expired.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Choose new password" subtitle="Must be at least 8 characters.">
            {!success ? (
                <form className="auth-form" onSubmit={handleReset}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>New Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="auth-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="auth-input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={isLoading}>
                        {isLoading ? <Loader className="spinner" size={18} /> : null}
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            ) : (
                <div className="auth-form" style={{ textAlign: 'center', margin: '2rem 0' }}>
                    <div style={{ padding: '1.5rem', background: '#ecfdf5', color: '#047857', borderRadius: '12px', marginBottom: '2rem' }}>
                        Password reset successfully! You can now log in with your new password.
                    </div>
                </div>
            )}
        </AuthLayout>
    );
};

export default ResetPassword;
