import React from 'react';
import { Bot, User, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

const MessageBubble = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`message-bubble-wrapper ${isAssistant ? 'assistant' : 'user'}`}
    >
      <div className="message-avatar">
        {isAssistant ? <Bot size={20} /> : <User size={20} />}
      </div>
      <div className="message-content">
        <div className="message-text">
          {message.content}
          {message.isVoice && (
            <span className="voice-tag" title="Sent via voice">
              <Mic size={12} />
            </span>
          )}
        </div>
        <div className="message-meta">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
