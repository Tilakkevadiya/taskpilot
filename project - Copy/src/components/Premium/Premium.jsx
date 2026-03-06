import React, { useState } from 'react'
import { Crown, X, Check, Star, Zap, Shield, Headphones } from 'lucide-react'
import axios from 'axios'
import './Premium.css'

const Premium = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [isProcessing, setIsProcessing] = useState(false)

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$9.99',
      period: '/month',
      features: [
        'Unlimited voice commands',
        'Advanced AI responses',
        'Email template library',
        'Meeting scheduling assistant',
        'Document summarization',
        'Priority support'
      ],
      popular: false
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$79.99',
      period: '/year',
      features: [
        'Everything in Monthly',
        'Save 33% annually',
        'Custom email templates',
        'Advanced meeting insights',
        'Unlimited document storage',
        '24/7 priority support',
        'API access'
      ],
      popular: true
    }
  ]

  const premiumFeatures = [
    {
      icon: <Zap size={24} />,
      title: 'Advanced Voice Commands',
      description: 'Unlimited voice commands with advanced AI processing and natural language understanding'
    },
    {
      icon: <Star size={24} />,
      title: 'Smart Email Templates',
      description: 'Access to hundreds of professional email templates for every situation'
    },
    {
      icon: <Shield size={24} />,
      title: 'Enhanced Security',
      description: 'End-to-end encryption and secure cloud storage for all your data'
    },
    {
      icon: <Headphones size={24} />,
      title: 'Priority Support',
      description: '24/7 customer support with guaranteed response times'
    }
  ]

  const handleSubscribe = async (planId) => {
    setSelectedPlan(planId)
    setIsProcessing(true)

    try {
      // 1. Create Subscription on Backend
      const res = await axios.post('http://localhost:8080/api/payment/create-subscription')
      const { subscriptionId } = res.data

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: "rzp_test_placeholder", // Add your Razorpay Key ID here
        subscription_id: subscriptionId,
        name: "Task Pilot AI",
        description: "Premium Plan Upgrade",
        handler: async function (response) {
          try {
            // 3. Verify Payment Signature
            const verifyRes = await axios.post('http://localhost:8080/api/payment/verify-payment', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature
            })

            if (verifyRes.data.status === 'success') {
              alert('Successfully upgraded to Premium!')
              onClose()
              window.location.reload()
            }
          } catch (err) {
            console.error("Payment verification failed", err)
            alert('Payment verification failed.')
          } finally {
            setIsProcessing(false)
          }
        },
        theme: {
          color: "#3b82f6"
        }
      }

      const rzp1 = new window.Razorpay(options)
      rzp1.on('payment.failed', function (response) {
        alert("Payment failed: " + response.error.description)
        setIsProcessing(false)
      })
      rzp1.open()

    } catch (err) {
      console.error(err)
      alert('Failed to initiate payment.')
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  const selectedPlanData = plans.find(p => p.id === selectedPlan)

  return (
    <>
      <div className="premium-overlay">
        <div className="premium-modal">
          <div className="premium-header">
            <div className="premium-title">
              <Crown size={32} className="crown-icon" />
              <h2>Unlock Premium Features</h2>
              <p>Get the most out of Task Pilot AI with advanced features</p>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="premium-content">
            <div className="premium-features">
              <h3>What You Get with Premium</h3>
              <div className="features-grid">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <div className="feature-icon">{feature.icon}</div>
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pricing-section">
              <h3>Choose Your Plan</h3>
              <div className="plans-container">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="popular-badge">
                        <Star size={16} />
                        Most Popular
                      </div>
                    )}
                    <div className="plan-header">
                      <h4>{plan.name}</h4>
                      <div className="plan-price">
                        <span className="price">{plan.price}</span>
                        <span className="period">{plan.period}</span>
                      </div>
                    </div>
                    <div className="plan-features">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="feature-item">
                          <Check size={16} className="check-icon" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      className={`subscribe-btn ${selectedPlan === plan.id ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSubscribe(plan.id)
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing && selectedPlan === plan.id ? 'Processing...' : selectedPlan === plan.id ? 'Proceed to Payment' : `Choose ${plan.name}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="premium-footer">
            <p>✨ 30-day money-back guarantee • Cancel anytime • Secure payment</p>
          </div>
        </div>
      </div>

    </>
  )
}

export default Premium
