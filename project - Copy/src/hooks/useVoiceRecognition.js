import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook for Web Speech Recognition
 * @param {Function} onResult - Called with final transcript string
 * @param {Function} onError  - Called with error code string
 */
const useVoiceRecognition = (onResult, onError) => {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  const onResultRef = useRef(onResult)
  const onErrorRef  = useRef(onError)
  useEffect(() => { onResultRef.current = onResult }, [onResult])
  useEffect(() => { onErrorRef.current  = onError  }, [onError])

  const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous      = false   // stop after one sentence
    recognition.interimResults  = true
    recognition.lang            = 'en-US'

    recognition.onstart  = () => setIsListening(true)
    recognition.onend    = () => setIsListening(false)

    recognition.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript.trim()) {
        onResultRef.current(finalTranscript.trim())
      }
    }

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error)
      setIsListening(false)
      if (event.error !== 'no-speech') {
        onErrorRef.current?.(event.error)
      }
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [isSupported])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try { recognitionRef.current.start() }
      catch (err) { console.warn('Recognition start error:', err) }
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const toggleListening = useCallback(() => {
    isListening ? stopListening() : startListening()
  }, [isListening, startListening, stopListening])

  return { isListening, startListening, stopListening, toggleListening, isSupported }
}

export default useVoiceRecognition
