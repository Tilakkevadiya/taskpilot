import React from 'react';
import { UserPlus, Calendar, Sparkles, Rocket } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      title: 'Create Account',
      desc: 'Sign up in seconds and get access to your unified task dashboard.',
      icon: UserPlus,
      color: '#6366f1'
    },
    {
      title: 'Schedule & Organize',
      desc: 'Add your tasks and meetings. Let TaskPilot handle the heavy lifting.',
      icon: Calendar,
      color: '#8b5cf6'
    },
    {
      title: 'Use AI Assistant',
      desc: 'Upload documents and ask AI to help with your complex office workflows.',
      icon: Sparkles,
      color: '#06b6d4'
    },
    {
      title: 'Stay Productive',
      desc: 'Receive reminders and automate your emails to focus on what matters.',
      icon: Rocket,
      color: '#10b981'
    }
  ];

  return (
    <section id="how-it-works" className="section">
      <div className="section-header" data-aos="fade-up">
        <h2 className="gradient-text">How It Works</h2>
        <p>Simple, automated, and intelligent productivity in four easy steps.</p>
      </div>

      <div style={{ position: 'relative', marginTop: '4rem' }}>
        <div className="feature-grid">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="glass" 
              style={{ padding: '2rem', textAlign: 'center', position: 'relative', zIndex: 1 }}
              data-aos="fade-up"
              data-aos-delay={index * 150}
            >
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: `${step.color}15`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: step.color
              }}>
                <step.icon size={28} />
              </div>
              <h3>{step.title}</h3>
              <p style={{ marginTop: '0.5rem' }}>{step.desc}</p>
              
              <div style={{ 
                position: 'absolute', 
                top: '-15px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                width: '30px',
                height: '30px',
                background: '#0f172a',
                border: `2px solid ${step.color}`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
