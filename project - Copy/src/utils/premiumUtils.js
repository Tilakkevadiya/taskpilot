export const checkPremiumStatus = () => {
  const isPremium = localStorage.getItem('isPremium') === 'true'
  const premiumPlan = localStorage.getItem('premiumPlan')
  const premiumActivated = localStorage.getItem('premiumActivated')
  const transactionId = localStorage.getItem('transactionId')

  if (!isPremium || !premiumPlan || !premiumActivated) {
    return {
      isPremium: false,
      plan: null,
      activatedDate: null,
      transactionId: null,
      daysRemaining: 0
    }
  }

  const activatedDate = new Date(premiumActivated)
  const currentDate = new Date()
  
  // Calculate days remaining (assuming 30-day subscription for monthly, 365 for yearly)
  let daysInPeriod = 30
  if (premiumPlan === 'yearly') {
    daysInPeriod = 365
  }
  
  const expiryDate = new Date(activatedDate.getTime() + (daysInPeriod * 24 * 60 * 60 * 1000))
  const daysRemaining = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24))

  // Check if subscription has expired
  if (daysRemaining <= 0) {
    clearPremiumStatus()
    return {
      isPremium: false,
      plan: null,
      activatedDate: null,
      transactionId: null,
      daysRemaining: 0
    }
  }

  return {
    isPremium: true,
    plan: premiumPlan,
    activatedDate,
    transactionId,
    daysRemaining,
    expiryDate
  }
}

export const clearPremiumStatus = () => {
  localStorage.removeItem('isPremium')
  localStorage.removeItem('premiumPlan')
  localStorage.removeItem('premiumActivated')
  localStorage.removeItem('transactionId')
}

export const activatePremium = (planId, transactionId) => {
  const now = new Date().toISOString()
  localStorage.setItem('isPremium', 'true')
  localStorage.setItem('premiumPlan', planId)
  localStorage.setItem('premiumActivated', now)
  localStorage.setItem('transactionId', transactionId)
}

export const getPremiumFeatures = () => {
  const status = checkPremiumStatus()
  
  if (!status.isPremium) {
    return {
      canUseVoiceCommands: false,
      hasAdvancedAI: false,
      hasEmailTemplates: false,
      hasMeetingAssistant: false,
      hasDocumentSummarization: false,
      hasPrioritySupport: false,
      hasAPIAccess: false,
      hasCustomTemplates: false,
      hasAdvancedInsights: false,
      hasUnlimitedStorage: false
    }
  }

  const baseFeatures = {
    canUseVoiceCommands: true,
    hasAdvancedAI: true,
    hasEmailTemplates: true,
    hasMeetingAssistant: true,
    hasDocumentSummarization: true,
    hasPrioritySupport: true
  }

  if (status.plan === 'yearly') {
    return {
      ...baseFeatures,
      hasAPIAccess: true,
      hasCustomTemplates: true,
      hasAdvancedInsights: true,
      hasUnlimitedStorage: true
    }
  }

  return baseFeatures
}

export const formatPremiumStatus = () => {
  const status = checkPremiumStatus()
  
  if (!status.isPremium) {
    return {
      status: 'Free',
      color: '#6b7280',
      message: 'Upgrade to Premium for advanced features'
    }
  }

  if (status.daysRemaining <= 7) {
    return {
      status: 'Premium',
      color: '#3b82f6',
      message: `${status.daysRemaining} days remaining`
    }
  }

  return {
    status: 'Premium',
    color: '#10b981',
    message: `Active until ${status.expiryDate.toLocaleDateString()}`
  }
}
