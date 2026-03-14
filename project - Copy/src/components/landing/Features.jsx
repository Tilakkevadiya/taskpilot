import React from 'react';
import { 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  Mail, 
  Zap, 
  Shield 
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      title: 'Smart Task Manager',
      desc: 'Create, organize, and track tasks effortlessly with our high-end interface.',
      icon: CheckSquare,
      delay: 0
    },
    {
      title: 'Meeting Scheduler',
      desc: 'Plan meetings, set reminders, and never miss a deadline again.',
      icon: Calendar,
      delay: 100
    },
    {
      title: 'AI Assistant',
      desc: 'Upload documents and get instant AI-powered help with your daily office work.',
      icon: MessageSquare,
      delay: 200,
      premium: true
    },
    {
      title: 'Email Automation',
      desc: 'Send smart reminders and professional emails directly from the platform.',
      icon: Mail,
      delay: 300
    },
    {
      title: 'Real-time Sync',
      desc: 'Your data is synced across all your devices instantly and securely.',
      icon: Zap,
      delay: 400
    },
    {
      title: 'Bank-grade Security',
      desc: 'Your privacy and data security are our top priorities with robust encryption.',
      icon: Shield,
      delay: 500
    }
  ];

  return (
    <section id="features" className="section">
      <div className="section-header" data-aos="fade-up">
        <h2 className="gradient-text">Powerful Features</h2>
        <p>Everything you need to automate your office work and stay productive.</p>
      </div>

      <div className="feature-grid">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="feature-card glass" 
            data-aos="fade-up" 
            data-aos-delay={feature.delay}
          >
            <div className="icon-box">
              <feature.icon size={24} />
            </div>
            <h3>
              {feature.title}
              {feature.premium && (
                <span style={{ fontSize: '0.7rem', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', padding: '2px 8px', borderRadius: '10px', marginLeft: '8px', verticalAlign: 'middle' }}>Premium</span>
              )}
            </h3>
            <p>{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
