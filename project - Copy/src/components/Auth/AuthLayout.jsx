import React from 'react';
import { Sparkles } from 'lucide-react';
import './Auth.css';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="auth-full-screen">
            <div className="auth-centered-container">
                <div className="auth-logo-top">
                    <div className="auth-logo-icon">
                        <Sparkles color="white" size={32} />
                    </div>
                    <h1>TaskPilot</h1>
                </div>
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>{title}</h2>
                        <p>{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
