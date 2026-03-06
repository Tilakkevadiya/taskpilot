import { loadStripe } from '@stripe/stripe-js'

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51234567890abcdefghijklmnopqrstuvwxyz' // Replace with your actual Stripe publishable key

let stripeInstance = null

export const initializeStripe = async () => {
  if (!stripeInstance) {
    stripeInstance = await loadStripe(STRIPE_PUBLISHABLE_KEY)
  }
  return stripeInstance
}

export const createCheckoutSession = async (planId) => {
  try {
    // In a real application, this would call your backend API
    // For demo purposes, we'll simulate the checkout session creation
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancelled`,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const { sessionId } = await response.json()
    return sessionId
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export const redirectToCheckout = async (planId) => {
  try {
    const stripe = await initializeStripe()
    
    // For demo purposes, we'll simulate the payment flow
    // In production, you would create a real checkout session
    const sessionId = await createCheckoutSession(planId)
    
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error)
    throw error
  }
}

// Mock function for demo purposes (remove in production)
export const mockPaymentProcess = async (planId) => {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Simulate random success/failure for demo
  const isSuccess = Math.random() > 0.2 // 80% success rate for demo
  
  if (!isSuccess) {
    throw new Error('Payment failed. Please try again.')
  }
  
  return {
    success: true,
    planId,
    transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const verifyPayment = async (sessionId) => {
  try {
    // In production, this would verify the payment with your backend
    const response = await fetch(`/api/verify-payment/${sessionId}`)
    
    if (!response.ok) {
      throw new Error('Payment verification failed')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error verifying payment:', error)
    throw error
  }
}
