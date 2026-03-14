import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import './UpgradeModal.css';

const UpgradeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleOpenModal = (event) => {
      setMessage(event.detail?.message || 'Daily limit reached. Upgrade to Premium.');
      setIsOpen(true);
    };

    window.addEventListener('openUpgradeModal', handleOpenModal);

    return () => {
      window.removeEventListener('openUpgradeModal', handleOpenModal);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="upgrade-modal-overlay">
      <div className="upgrade-modal-content">
        <button className="close-btn" onClick={() => setIsOpen(false)}>
          <X size={20} />
        </button>
        
        <div className="modal-header">
          <Sparkles className="premium-icon" size={32} />
          <h2>Unlock Unlimited Productivity</h2>
        </div>

        <div className="modal-body">
          <p className="limit-message">{message}</p>
          
          <div className="premium-benefits">
            <h3>Get Premium to unlock:</h3>
            <ul>
              <li><span>✓</span> Unlimited AI requests</li>
              <li><span>✓</span> Faster AI responses</li>
              <li><span>✓</span> Unlimited tasks</li>
              <li><span>✓</span> Unlimited documents</li>
              <li><span>✓</span> Advanced analytics</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="upgrade-now-btn" onClick={() => window.location.href='/premium'}>
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
