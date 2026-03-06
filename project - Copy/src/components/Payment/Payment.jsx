import React, { useState } from 'react'
import { CreditCard, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { mockPaymentProcess } from '../../services/paymentService'
import './Payment.css'

const Payment = ({ plan, onPaymentSuccess, onPaymentCancel, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('idle') // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState('')

  const handlePayment = async () => {
    setIsProcessing(true)
    setPaymentStatus('processing')
    setErrorMessage('')

    try {
      const result = await mockPaymentProcess(plan.id)
      
      if (result.success) {
        setPaymentStatus('success')
        
        // Store premium status
        localStorage.setItem('premiumPlan', plan.id)
        localStorage.setItem('isPremium', 'true')
        localStorage.setItem('premiumActivated', new Date().toISOString())
        localStorage.setItem('transactionId', result.transactionId)
        
        // Notify parent component
        onPaymentSuccess(result)
        
        // Close modal after success
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (error) {
      setPaymentStatus('error')
      setErrorMessage(error.message || 'Payment failed. Please try again.')
      onPaymentCancel(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatPrice = (price) => {
    return price.replace('$', '')
  }

  return (
    <div className="payment-modal">
      <div className="payment-content">
        <div className="payment-header">
          <h3>Complete Your Purchase</h3>
          <p>You're subscribing to the {plan.name} plan</p>
        </div>

        <div className="payment-summary">
          <div className="plan-summary">
            <h4>{plan.name} Plan</h4>
            <div className="price-display">
              <span className="currency">$</span>
              <span className="amount">{formatPrice(plan.price)}</span>
              <span className="period">{plan.period}</span>
            </div>
          </div>
        </div>

        <div className="payment-method">
          <div className="payment-method-header">
            <CreditCard size={20} />
            <span>Payment Method</span>
          </div>
          <div className="card-inputs">
            <div className="form-group">
              <label>Card Number</label>
              <input 
                type="text" 
                placeholder="1234 5678 9012 3456"
                defaultValue="4242 4242 4242 4242"
                disabled={isProcessing}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input 
                  type="text" 
                  placeholder="MM/YY"
                  defaultValue="12/25"
                  disabled={isProcessing}
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input 
                  type="text" 
                  placeholder="123"
                  defaultValue="123"
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>
        </div>

        {paymentStatus === 'error' && (
          <div className="payment-error">
            <XCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="payment-success">
            <CheckCircle size={20} />
            <span>Payment successful! Redirecting...</span>
          </div>
        )}

        <div className="payment-actions">
          <button 
            className="cancel-btn"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button 
            className="pay-btn"
            onClick={handlePayment}
            disabled={isProcessing || paymentStatus === 'success'}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="spinner" />
                Processing...
              </>
            ) : (
              `Pay ${plan.price}`
            )}
          </button>
        </div>

        <div className="payment-security">
          <AlertCircle size={16} />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </div>
    </div>
  )
}

export default Payment
