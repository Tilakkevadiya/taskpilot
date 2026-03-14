/**
 * Service for Text-to-Speech using Web Speech API
 */
const textToSpeech = {
  /**
   * Speak the provided text
   * @param {string} text - The text to speak
   * @param {Object} options - Speech options (rate, pitch, language)
   */
  speak(text, options = {}) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 0.8;
    utterance.lang = options.lang || 'en-US';

    // Use a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.lang.startsWith('en')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (options.onend) utterance.onend = options.onend;
    if (options.onerror) utterance.onerror = options.onerror;

    window.speechSynthesis.speak(utterance);
    return utterance;
  },

  /**
   * Stop all active speech
   */
  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};

// Initialize voices
if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

export default textToSpeech;
