import React, { useEffect } from 'react'
import { CheckCircle, Home, Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './PaymentSuccess.css'

const PaymentSuccess = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Auto-redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard')
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigate])

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <div className="payment-success-container">
      <div className="success-content">
        <div className="success-icon">
          <CheckCircle size={64} className="check-icon" />
        </div>
        
        <div className="success-header">
          <Crown size={32} className="crown-icon" />
          <h1>Payment Successful!</h1>
        </div>
        
        <p className="success-message">
          Congratulations! You now have access to all premium features.
        </p>
        
        <div className="premium-features-list">
          <h3>Your Premium Features Are Now Active:</h3>
          <ul>
            <li>✓ Unlimited voice commands</li>
            <li>✓ Advanced AI responses</li>
            <li>✓ Email template library</li>
            <li>✓ Meeting scheduling assistant</li>
            <li>✓ Document summarization</li>
            <li>✓ Priority support</li>
          </ul>
        </div>
        
        <div className="success-actions">
          <button 
            className="dashboard-btn"
            onClick={handleGoToDashboard}
          >
            <Home size={16} />
            Go to Dashboard
          </button>
        </div>
        
        <p className="auto-redirect">
          You will be automatically redirected to the dashboard in 5 seconds...
        </p>
      </div>
    </div>
  )
}

export default PaymentSuccess
