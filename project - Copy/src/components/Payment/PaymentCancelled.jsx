import React, { useEffect } from 'react'
import { XCircle, ArrowLeft, Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './PaymentCancelled.css'

const PaymentCancelled = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Auto-redirect to premium page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard')
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigate])

  const handleTryAgain = () => {
    navigate('/dashboard')
    // Trigger premium modal after navigation
    setTimeout(() => {
      const premiumBtn = document.querySelector('[data-premium-btn]')
      if (premiumBtn) {
        premiumBtn.click()
      }
    }, 100)
  }

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <div className="payment-cancelled-container">
      <div className="cancelled-content">
        <div className="cancelled-icon">
          <XCircle size={64} className="x-icon" />
        </div>
        
        <div className="cancelled-header">
          <Crown size={32} className="crown-icon" />
          <h1>Payment Cancelled</h1>
        </div>
        
        <p className="cancelled-message">
          Your payment was cancelled. No charges were made to your account.
        </p>
        
        <div className="cancellation-info">
          <h3>What happened?</h3>
          <p>
            The payment process was interrupted or cancelled. This could be due to:
          </p>
          <ul>
            <li>• You closed the payment window</li>
            <li>• Payment was declined by your bank</li>
            <li>• Network connection issues</li>
            <li>• You chose to cancel the transaction</li>
          </ul>
        </div>
        
        <div className="cancelled-actions">
          <button 
            className="try-again-btn"
            onClick={handleTryAgain}
          >
            <ArrowLeft size={16} />
            Try Again
          </button>
          <button 
            className="dashboard-btn"
            onClick={handleGoToDashboard}
          >
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

export default PaymentCancelled
