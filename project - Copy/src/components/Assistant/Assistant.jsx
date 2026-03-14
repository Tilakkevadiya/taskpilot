import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, Sparkles, Loader, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Services & Hooks
import voiceCommands from '../../services/voiceCommands';
import textToSpeech from '../../services/textToSpeech';
import useVoiceRecognition from '../../hooks/useVoiceRecognition';
import PremiumLock from '../UI/PremiumLock';
import { useUsage } from '../../context/UsageContext';

// Components
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

import './Assistant.css';

const HISTORY_KEY = 'taskpilot_chat_history';

const Assistant = () => {
  const navigate = useNavigate();
  const { decrementUsage } = useUsage();
  const messagesEndRef = useRef(null);
  
  // State
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        return JSON.parse(saved).map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (e) {
        console.error('Failed to load chat history', e);
        return [];
      }
    }
    return [{
      id: 'assistant-welcome',
      role: 'assistant',
      content: "👋 Hello! I'm your TaskPilot AI. How can I assist you today?",
      timestamp: new Date()
    }];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Voice Recognition
  const onVoiceResult = (transcript) => {
    setInput(transcript);
  };

  const onVoiceError = (error) => {
    toast.error(`Voice error: ${error}`);
  };

  const { isListening, stopListening, toggleListening, isSupported: isVoiceSupported } = 
    useVoiceRecognition(onVoiceResult, onVoiceError);

  // Command Execution
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: userText,
      timestamp: new Date(),
      isVoice: isListening
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    if (isListening) stopListening();

    try {
      const result = await voiceCommands.process(userText, {
        onCreateTask: (data) => {
          window.dispatchEvent(new CustomEvent('taskCreated', { detail: data }));
          toast.success("Task created! 🤖");
        },
        onCreateMeeting: (data) => {
          window.dispatchEvent(new CustomEvent('meetingCreated', { detail: data }));
          toast.success("Meeting scheduled! 📅");
        },
        onCreateEmail: (data) => {
          localStorage.setItem('voiceEmailDraft', JSON.stringify(data));
          navigate('/email');
          toast.success("Email draft ready! 📧");
        },
        onNavigate: (path) => navigate(path)
      });

      const assistantMessage = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: result.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak back
      setIsSpeaking(true);
      textToSpeech.speak(result.reply, {
        onend: () => setIsSpeaking(false)
      });

      // Update usage
      decrementUsage('aiRequests');
    } catch (error) {
      const errorMsg = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "⚠️ I encountered an error connecting to the AI service. Please try again.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
      toast.error("AI service error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="assistant-page-wrapper">
      <PremiumLock featureName="AI Assistant">
        <div className="chat-interface">
          <header className="chat-header">
            <div className="header-info">
              <div className="bot-status">
                <Sparkles size={18} className="sparkle-icon" />
              </div>
              <div className="header-text">
                <h1>TaskPilot Intelligence</h1>
                <span className="online-tag">Ready to assist</span>
              </div>
            </div>
            <div className="header-actions">
               <button className="clear-chat-btn" onClick={() => setMessages([])}>Clear</button>
            </div>
          </header>

          <div className="messages-area">
            <AnimatePresence>
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && <TypingIndicator key="loader" />}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <footer className="input-area">
            <form onSubmit={handleSend} className="input-container glass-card">
              {isVoiceSupported && (
                <button 
                  type="button"
                  className={`mic-button ${isListening ? 'listening' : ''}`}
                  onClick={toggleListening}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              )}
              
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message TaskPilot AI..."
                className="chat-input"
              />

              <div className="action-buttons">
                {isSpeaking && <Volume2 size={18} className="speaking-icon" />}
                <button 
                  type="submit" 
                  className="send-btn" 
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? <Loader size={18} className="spin" /> : <Send size={20} />}
                </button>
              </div>
            </form>
            <p className="input-disclaimer">
              TaskPilot AI can manage tasks, meetings, and emails using natural language.
            </p>
          </footer>
        </div>
      </PremiumLock>
    </div>
  );
};

export default Assistant;
