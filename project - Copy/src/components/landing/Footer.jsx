import React from 'react';
import { Sparkles, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="sidebar-logo" style={{ padding: 0, marginBottom: '1.5rem' }}>
            <Sparkles className="logo-spark" size={24} color="#6366f1" />
            <h2>TaskPilot</h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '300px' }}>
            The AI-powered productivity platform designed to automate your office work and give you time back for what matters.
          </p>
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '2rem' }}>
            <a href="#" className="nav-link"><Twitter size={20} /></a>
            <a href="#" className="nav-link"><Linkedin size={20} /></a>
            <a href="#" className="nav-link"><Github size={20} /></a>
            <a href="#" className="nav-link"><Mail size={20} /></a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Product</h4>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How it Works</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#">AI assistant</a></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Cookie Policy</a></li>
          </ul>
        </div>
      </div>

      <div style={{ 
        borderTop: '1px solid var(--glass-border)', 
        paddingTop: '2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '2.5rem'
      }}>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
          © 2026 TaskPilot AI. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Made with <span style={{ color: '#ef4444' }}>❤️</span> for productivity
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
