import React, { useState } from 'react';
import { Mail, Loader, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleReset = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSent(true);
        }, 1500);
    };

    return (
        <AuthLayout title="Reset password" subtitle="Enter your email and we'll send you instructions to reset your password.">
            {!isSent ? (
                <form className="auth-form" onSubmit={handleReset}>
                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type="email"
                                className="auth-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={isLoading}>
                        {isLoading ? <Loader className="spinner" size={18} /> : null}
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            ) : (
                <div className="auth-form" style={{ textAlign: 'center', margin: '2rem 0' }}>
                    <div style={{ padding: '1.5rem', background: '#ecfdf5', color: '#047857', borderRadius: '12px', marginBottom: '2rem' }}>
                        Check your email for the reset link! We've sent instructions to <strong>{email}</strong>.
                    </div>
                </div>
            )}

            <div className="auth-footer" style={{ marginTop: '2.5rem' }}>
                <Link to="/login" className="auth-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginLeft: 0 }}>
                    <ArrowLeft size={16} />
                    Back to log in
                </Link>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
