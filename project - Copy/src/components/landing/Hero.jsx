import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Play, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-glow"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="glass" style={{ padding: '8px 20px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '20px', display: 'inline-block', color: '#6366f1' }}>
          ✨ The Future of Productivity is Here
        </span>
        
        <h1 className="gradient-text">
          Organize Your Life with TaskPilot AI
        </h1>
        
        <p>
          Smart task management, meeting planning, and AI-powered productivity — all in one powerful, unified platform.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', zIndex: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => navigate('/register')} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
            🚀 Get Started Free <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate('/login')} className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
            🔐 Sign In
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="glass"
        style={{ marginTop: '5rem', width: '100%', maxWidth: '1000px', height: '400px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '40px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></div>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></div>
        </div>
        
        {/* Mockup Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', width: '90%', height: '70%' }}>
          <div className="glass" style={{ padding: '1rem' }}>
            <div style={{ height: '12px', width: '60%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '1rem' }}></div>
            <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
            <div style={{ height: '8px', width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
            <div style={{ height: '8px', width: '90%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
          </div>
          <div className="glass" style={{ padding: '1rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
               <div style={{ height: '20px', width: '40%', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '4px' }}></div>
               <div style={{ height: '20px', width: '20%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}></div>
             </div>
             <div style={{ display: 'flex', gap: '1rem' }}>
               <div style={{ height: '100px', flex: 1, background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px' }}></div>
               <div style={{ height: '100px', flex: 1, background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px' }}></div>
               <div style={{ height: '100px', flex: 1, background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px' }}></div>
             </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
