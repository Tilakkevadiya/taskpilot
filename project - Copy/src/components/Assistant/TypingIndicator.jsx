import React from 'react';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

const TypingIndicator = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="typing-indicator-wrapper"
    >
      <div className="message-avatar">
        <Bot size={20} />
      </div>
      <div className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
