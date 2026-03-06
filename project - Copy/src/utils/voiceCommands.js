import axios from 'axios';

const API_URL = 'https://taskpilot-backend-n09v.onrender.com/api';

export const parseVoiceCommand = async (command) => {
  try {
    const response = await axios.post(`${API_URL}/assistant/execute`, {
      text: command
    });

    // The backend returns a FeatureResponse<ParseResponse>
    // So response.data is FeatureResponse
    // response.data.data is the actual ParseResponse from python
    const aiResponse = response.data.data;

    return {
      type: aiResponse.intent.toLowerCase(),
      data: aiResponse.entities,
      response: aiResponse.reply
    };
  } catch (error) {
    console.error('Error executing voice command via backend:', error);
    throw error;
  }
};

export const executeCommand = async (command, callbacks) => {
  const parsed = await parseVoiceCommand(command);

  // The backend has ALREADY executed the database actions,
  // we just trigger the UI callbacks.
  switch (parsed.type) {
    case 'create_task':
      if (callbacks.onCreateTask) {
        await callbacks.onCreateTask(parsed.data);
      }
      break;
    case 'delete_task':
      if (callbacks.onDeleteTask) {
        await callbacks.onDeleteTask(parsed.data);
      }
      break;
    case 'create_email':
    case 'send_email':
      if (callbacks.onCreateEmail) {
        await callbacks.onCreateEmail(parsed.data);
      }
      break;
    case 'create_meeting':
    case 'schedule_meeting':
      if (callbacks.onCreateMeeting) {
        await callbacks.onCreateMeeting(parsed.data);
      }
      break;
    case 'summarize_document':
      if (callbacks.onSummarizeDocument) {
        await callbacks.onSummarizeDocument(parsed.data);
      }
      break;
    case 'greeting':
      break;
    default:
      break;
  }

  return parsed;
};
