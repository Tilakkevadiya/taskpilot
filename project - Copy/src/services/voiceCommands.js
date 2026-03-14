import aiService from './aiService';

/**
 * Service for processing AI intents and triggering frontend actions
 */
const voiceCommands = {
  /**
   * Parse a command and trigger appropriate callbacks
   * @param {string} text - User command
   * @param {Object} callbacks - UI callbacks for various intents
   */
  async process(text, callbacks) {
    const aiResult = await aiService.executeCommand(text);

    switch (aiResult.intent) {
      case 'create_task':
        if (callbacks.onCreateTask) await callbacks.onCreateTask(aiResult.entities);
        break;
      case 'delete_task':
        if (callbacks.onDeleteTask) await callbacks.onDeleteTask(aiResult.entities);
        break;
      case 'create_email':
      case 'send_email':
        if (callbacks.onCreateEmail) await callbacks.onCreateEmail(aiResult.entities);
        break;
      case 'create_meeting':
      case 'schedule_meeting':
        if (callbacks.onCreateMeeting) await callbacks.onCreateMeeting(aiResult.entities);
        break;
      case 'open_dashboard':
        if (callbacks.onNavigate) callbacks.onNavigate('/dashboard');
        break;
      case 'open_tasks':
        if (callbacks.onNavigate) callbacks.onNavigate('/tasks');
        break;
      case 'open_meetings':
        if (callbacks.onNavigate) callbacks.onNavigate('/meetings');
        break;
      default:
        // Generic response
        break;
    }

    return aiResult;
  }
};

export default voiceCommands;
