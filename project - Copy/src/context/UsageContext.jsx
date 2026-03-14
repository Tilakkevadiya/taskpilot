import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UsageContext = createContext();

export const useUsage = () => useContext(UsageContext);

export const UsageProvider = ({ children }) => {
  const [usage, setUsage] = useState({
    plan: 'FREE',
    emailsLeft: 0,
    meetingsLeft: 0,
    tasksLeft: 0,
    loading: true
  });

  const fetchUsage = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/usage/current', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsage({
        ...response.data,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      setUsage(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchUsage();
    } else {
      setUsage(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const decrementUsage = (feature) => {
    setUsage(prev => {
      // Don't decrement if premium or if no count left
      if (prev.plan === 'PREMIUM') return prev;
      
      const featureKey = `${feature}Left`;
      const current = prev[featureKey];
      
      if (current !== undefined && current > 0) {
        return {
          ...prev,
          [featureKey]: current - 1
        };
      }
      return prev;
    });
  };

  return (
    <UsageContext.Provider value={{ usage, fetchUsage, decrementUsage }}>
      {children}
    </UsageContext.Provider>
  );
};
