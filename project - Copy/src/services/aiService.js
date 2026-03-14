import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * AI Service for backend communication
 */
const aiService = {
  /**
   * Send text to AI for intent recognition and execution
   * @param {string} text - The user's input
   * @returns {Promise<Object>} - The AI response (intent, reply, data)
   */
  async executeCommand(text) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/assistant/execute`, 
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Backend returns FeatureResponse<ParseResponse>
      const aiResponse = response.data.data;

      return {
        intent: aiResponse.intent.toLowerCase(),
        entities: aiResponse.entities,
        reply: aiResponse.reply
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }
};

export default aiService;
