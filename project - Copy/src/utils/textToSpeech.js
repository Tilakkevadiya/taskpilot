// Text-to-speech utility
export const speak = (text, options = {}) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported')
    return
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  
  utterance.rate = options.rate || 1.0
  utterance.pitch = options.pitch || 1.0
  utterance.volume = options.volume || 0.8
  utterance.lang = options.lang || 'en-US'

  // Use a more natural voice if available
  const voices = window.speechSynthesis.getVoices()
  const preferredVoice = voices.find(voice => 
    voice.name.includes('Google') || 
    voice.name.includes('Microsoft') ||
    voice.lang.startsWith('en')
  )
  
  if (preferredVoice) {
    utterance.voice = preferredVoice
  }

  // Handle callbacks
  if (options.onend) {
    utterance.onend = options.onend
  }

  if (options.onerror) {
    utterance.onerror = options.onerror
  }

  window.speechSynthesis.speak(utterance)

  return utterance
}

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

// Load voices when available
if ('speechSynthesis' in window) {
  let voicesLoaded = false
  
  const loadVoices = () => {
    if (window.speechSynthesis.getVoices().length > 0) {
      voicesLoaded = true
    }
  }
  
  loadVoices()
  window.speechSynthesis.onvoiceschanged = loadVoices
}




