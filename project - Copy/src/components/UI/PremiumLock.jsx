import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PremiumLock = ({ children, featureName = "this feature" }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // If the user's plan_type is FREE, hide the children and show the lock UI instead.
    if (!user || user.plan_type !== 'PREMIUM') {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '70vh',
                width: '100%',
                padding: '20px'
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '40px',
                    textAlign: 'center',
                    maxWidth: '500px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 10
                }}>
                    <div style={{ 
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
                        color: 'white'
                    }}>
                        <Lock size={32} />
                    </div>
                    
                    <h3 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 700, 
                        color: '#e2e8f0', 
                        marginBottom: '12px' 
                    }}>
                        Premium Feature
                    </h3>
                    
                    <p style={{ 
                        color: '#94a3b8', 
                        marginBottom: '32px', 
                        fontSize: '1.05rem',
                        lineHeight: '1.6' 
                    }}>
                        Upgrade to Premium to unlock {featureName} and access advanced productivity tools.
                    </p>
                    
                    <button 
                        onClick={() => navigate('/upgrade')}
                        style={{
                            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                            color: 'white',
                            padding: '12px 28px',
                            borderRadius: '10px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(99, 102, 241, 0.5)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.3)';
                        }}
                    >
                        Upgrade to Premium
                    </button>

                    <p style={{ 
                        marginTop: '16px', 
                        color: '#64748b', 
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                    }}
                    onClick={() => window.location.reload()}
                    >
                        Already upgraded? <span style={{ color: '#818cf8', fontWeight: 500 }}>Refresh your session</span>
                    </p>
                </div>
            </div>
        );
    }

    // If perfectly authorized, just render the wrapped component normally
    return <>{children}</>;
};

export default PremiumLock;
