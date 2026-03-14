import React, { useEffect } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useRef } from 'react';

const StatCounter = ({ value, label, suffix = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
      const controls = animate(count, numericValue, { 
        duration: 2,
        ease: "easeOut"
      });
      return controls.stop;
    }
  }, [isInView, count, value]);

  return (
    <div className="stat-item" ref={ref}>
      <motion.span 
        className="stat-value gradient-text"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <motion.span>{rounded}</motion.span>
        {suffix}
      </motion.span>
      <span className="stat-label">{label}</span>
    </div>
  );
};

const Stats = () => {
  return (
    <section className="section">
      <div className="stats-container glass" data-aos="zoom-in">
        <StatCounter value="10" suffix="K+" label="Tasks Created" />
        <StatCounter value="5" suffix="K+" label="Meetings Planned" />
        <StatCounter value="98" suffix="%" label="User Satisfaction" />
        <StatCounter value="24" suffix="/7" label="AI Support" />
      </div>
    </section>
  );
};

export default Stats;
