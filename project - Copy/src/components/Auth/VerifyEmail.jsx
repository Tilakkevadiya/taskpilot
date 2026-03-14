import React, { useState } from 'react';
import { Mail, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import './Auth.css';
import axios from 'axios';

const VerifyEmail = () => {
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await axios.post('http://localhost:8080/api/auth/verify-email', { token });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data || "Verification failed. Please check the code.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Verify your email" subtitle="Enter the 6-digit code we sent to your email.">
            {!success ? (
                <form className="auth-form" onSubmit={handleVerify}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Verification Code</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input
                                type="text"
                                className="auth-input"
                                placeholder="123456"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                maxLength={6}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={isLoading || token.length < 6}>
                        {isLoading ? <Loader className="spinner" size={18} /> : null}
                        {isLoading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>
            ) : (
                <div className="auth-form" style={{ textAlign: 'center', margin: '2rem 0' }}>
                    <div style={{ padding: '1.5rem', background: '#ecfdf5', color: '#047857', borderRadius: '12px', marginBottom: '2rem' }}>
                        Email verified successfully! Redirecting to login...
                    </div>
                </div>
            )}
        </AuthLayout>
    );
};

export default VerifyEmail;
