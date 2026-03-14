import React, { useState } from 'react'
import { 
  Crown, 
  Check, 
  X, 
  Zap, 
  Star, 
  Shield, 
  ZapOff, 
  Clock, 
  Users, 
  CheckCircle2, 
  Loader,
  ArrowRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useUsage } from '../../context/UsageContext'
import './Premium.css'

// ─── Simple Toast Helper ────────────────────────────────────────────────────
const showToast = (message, type = 'info') => {
  const toast = document.createElement('div')
  toast.innerHTML = message
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px;
    padding: 14px 22px; border-radius: 10px; color: white;
    font-size: 14px; font-weight: 500; z-index: 99999;
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
    animation: slideInToast 0.3s ease;
    max-width: 360px; line-height: 1.5;
  `
  if (!document.getElementById('toast-style')) {
    const style = document.createElement('style')
    style.id = 'toast-style'
    style.textContent = `@keyframes slideInToast { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`
    document.head.appendChild(style)
  }
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 6000)
}

const Premium = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { upgradeUser, refreshUser } = useAuth()
  const { fetchUsage } = useUsage()
  const isPageMode = isOpen === undefined

  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState('idle') // idle | creating | checkout | verifying | success

  const handleUpgrade = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    setStep('creating')

    try {
      const token = localStorage.getItem('token')
      const orderRes = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/payment/create-order`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const { orderId, amount, currency, key } = orderRes.data

      setStep('checkout')
      const options = {
        key,
        amount,
        currency,
        order_id: orderId,
        name: 'TaskPilot AI',
        description: 'Premium Plan — ₹299/month',
        prefill: {
          name: JSON.parse(localStorage.getItem('user') || '{}')?.name || '',
          email: JSON.parse(localStorage.getItem('user') || '{}')?.email || '',
        },
        theme: { color: '#6366f1' },

        handler: async (response) => {
          setStep('verifying')
          try {
            await axios.post(
              `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            )

            const refreshRes = await axios.post(
              `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/payment/refresh-token`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            )
            const newToken = refreshRes.data.token

            upgradeUser(newToken)
            await refreshUser()
            await fetchUsage()

            setStep('success')
            showToast('🎉 Welcome to Premium! Your subscription is now active.', 'success')

            setTimeout(() => {
              if (isPageMode) navigate('/dashboard')
              else if (onClose) onClose()
            }, 2500)

          } catch (err) {
            console.error('Verification error:', err)
            showToast('Payment received but verification is pending. Your plan will update shortly.', 'info')
            setIsProcessing(false)
            setStep('idle')
          }
        },
      }

      if (!window.Razorpay) {
        showToast('Razorpay script not loaded. Please refresh and try again.', 'error')
        setIsProcessing(false)
        setStep('idle')
        return
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (res) => {
        showToast('Payment failed: ' + (res.error?.description || 'Unknown error'), 'error')
        setIsProcessing(false)
        setStep('idle')
      })
      rzp.open()

    } catch (err) {
      console.error('Payment error:', err)
      showToast('Failed to initiate payment. Please try again.', 'error')
      setIsProcessing(false)
      setStep('idle')
    }
  }

  if (!isPageMode && !isOpen) return null

  if (step === 'success') {
    return (
      <div className="premium-success-overlay">
        <div className="success-content-card">
          <div style={{ fontSize: '72px', marginBottom: '24px' }}>🏆</div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            You're Now Premium!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.1rem' }}>
            Unleash the full power of TaskPilot AI. Your account has been upgraded successfully.
          </p>
          <div className="loader-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-muted)' }}>
            <Loader size={20} style={{ animation: 'spin 2s linear infinite' }} />
            <span>Redirecting to your dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  const getButtonText = () => {
    if (step === 'creating') return 'Securing Connection...'
    if (step === 'checkout') return 'Launching Checkout...'
    if (step === 'verifying') return 'Finalizing Payment...'
    return 'Upgrade to Premium'
  }

  const COMPARISON_DATA = [
    { feature: 'AI Requests', free: '25/day', premium: 'Unlimited' },
    { feature: 'Tasks', free: '10', premium: 'Unlimited' },
    { feature: 'Documents', free: '5', premium: 'Unlimited' },
    { feature: 'Meetings', free: '10', premium: 'Unlimited' },
    { feature: 'Priority Support', free: false, premium: true },
  ]

  const BENEFITS_DATA = [
    { 
      icon: <Zap size={24} />, 
      title: 'Unlimited AI Requests', 
      desc: 'No daily limits or interruptions. Use the AI assistant as much as you need.' 
    },
    { 
      icon: <Star size={24} />, 
      title: 'Unlimited Tasks', 
      desc: 'Manage complex projects with ease. Create as many tasks and subtasks as required.' 
    },
    { 
      icon: <Clock size={24} />, 
      title: 'Faster AI Processing', 
      desc: 'Get priority access to our AI models for near-instant processing and replies.' 
    },
    { 
      icon: <Shield size={24} />, 
      title: 'Priority System Access', 
      desc: 'Your requests are handled first during peak times, ensuring zero downtime.' 
    },
  ]

  return (
    <div className={`premium-view ${!isPageMode ? 'premium-modal' : ''}`}>
      {/* 1. Hero Section */}
      <section className="premium-hero">
        <div className="hero-crown">
          <Crown size={40} />
        </div>
        <h1>Unlock Premium</h1>
        <p>Get unlimited access to all TaskPilot AI features and supercharge your productivity.</p>
      </section>

      {/* 2. Pricing Card */}
      <section className="pricing-section">
        <div className="pricing-container">
          <div className="pricing-card-main">
            <span className="plan-badge">MOST POPULAR</span>
            <h2>Premium Plan</h2>
            <div className="price-tag">
              <span className="currency">₹</span>
              <span className="amount">299</span>
              <span className="period">/ month</span>
            </div>
            
            <div className="feature-list-main">
              <div className="feature-item-main">
                <div className="check-icon-main"><Check size={14} /></div>
                <span>Unlimited AI Requests</span>
              </div>
              <div className="feature-item-main">
                <div className="check-icon-main"><Check size={14} /></div>
                <span>Unlimited Tasks</span>
              </div>
              <div className="feature-item-main">
                <div className="check-icon-main"><Check size={14} /></div>
                <span>Unlimited Documents</span>
              </div>
              <div className="feature-item-main">
                <div className="check-icon-main"><Check size={14} /></div>
                <span>Unlimited Meetings</span>
              </div>
              <div className="feature-item-main">
                <div className="check-icon-main"><Check size={14} /></div>
                <span>Priority Processing</span>
              </div>
            </div>

            <button 
              className="upgrade-btn-premium" 
              onClick={handleUpgrade}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader size={20} style={{ animation: 'spin 1.5s linear infinite' }} /> : <Zap size={20} />}
              {getButtonText()}
            </button>
          </div>
        </div>
      </section>

      {/* 3. Feature Comparison Section */}
      <section className="comparison-section">
        <h2>Comparison</h2>
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="plan-col">Free Plan</th>
                <th className="plan-col">Premium Plan</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_DATA.map((row, i) => (
                <tr key={i}>
                  <td>{row.feature}</td>
                  <td className="plan-col">
                    {row.free === true ? <CheckCircle2 size={18} color="#10b981" /> : 
                     row.free === false ? <X size={18} color="#94a3b8" /> : row.free}
                  </td>
                  <td className="plan-col premium-col">
                    {row.premium === true ? <CheckCircle2 size={18} color="#818cf8" /> : row.premium}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Benefits Section */}
      <section className="benefits-section">
        <h2>What You Get</h2>
        <div className="benefits-grid">
          {BENEFITS_DATA.map((benefit, i) => (
            <div key={i} className="benefit-card">
              <div className="benefit-icon-wrapper">
                {benefit.icon}
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Trust Section */}
      <section className="trust-section">
        <p>Secure payments powered by Razorpay</p>
        <div className="razorpay-logo-container">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" 
            alt="Razorpay" 
            className="razorpay-logo" 
          />
        </div>
      </section>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default Premium
