import React from 'react';
import { Check, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="section">
      <div className="section-header" data-aos="fade-up">
        <h2 className="gradient-text">Simple Pricing</h2>
        <p>Choose the plan that fits your productivity needs.</p>
      </div>

      <div className="pricing-grid">
        {/* Free Plan */}
        <div className="pricing-card glass" data-aos="fade-right">
          <div className="pricing-header">
            <h3>Free Plan</h3>
            <p>For individuals starting out</p>
            <div className="price">$0<span>/mo</span></div>
          </div>
          <ul className="pricing-features">
            <li><Check size={18} color="#10b981" /> 10 Tasks / day</li>
            <li><Check size={18} color="#10b981" /> 5 Meetings / day</li>
            <li><Check size={18} color="#10b981" /> 20 Emails / day</li>
            <li><X size={18} color="#ef4444" /> AI Assistant</li>
            <li><X size={18} color="#ef4444" /> Document Management</li>
            <li><X size={18} color="#ef4444" /> Advanced Analytics</li>
          </ul>
          <button onClick={() => navigate('/register')} className="btn btn-outline" style={{ width: '100%' }}>
            Get Started
          </button>
        </div>

        {/* Premium Plan */}
        <div className="pricing-card glass premium" data-aos="fade-left">
          <div className="badge">Best Value</div>
          <div className="pricing-header">
            <h3 className="gradient-text">Premium Plan</h3>
            <p>For power users & professionals</p>
            <div className="price">$19<span>/mo</span></div>
          </div>
          <ul className="pricing-features">
            <li><Check size={18} color="#10b981" /> Unlimited Tasks</li>
            <li><Check size={18} color="#10b981" /> Unlimited Meetings</li>
            <li><Check size={18} color="#10b981" /> Unlimited Emails</li>
            <li><Check size={18} color="#10b981" /> Full AI Assistant Access</li>
            <li><Check size={18} color="#10b981" /> Document Manager</li>
            <li><Check size={18} color="#10b981" /> Priority Support</li>
          </ul>
          <button onClick={() => navigate('/register')} className="btn btn-primary" style={{ width: '100%' }}>
            Go Premium <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
