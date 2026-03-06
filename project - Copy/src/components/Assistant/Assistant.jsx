import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Loader, Mic, MicOff, Volume2 } from 'lucide-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import useVoiceRecognition from '../../hooks/useVoiceRecognition'
import { parseVoiceCommand, executeCommand } from '../../utils/voiceCommands'
import { speak, stopSpeaking } from '../../utils/textToSpeech'
import './Assistant.css'

const Assistant = () => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Ensure dates are converted back to Date objects
        return parsed.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      } catch (e) {
        console.error('Failed to parse chat history', e)
      }
    }
    return [
      {
        id: 1,
        type: 'assistant',
        content: "🤖 I'm your Agentic AI Assistant! I can proactively help you with:\n\n📋 **Smart Task Management**\n• Automatically prioritize and organize your tasks\n• Suggest optimal task scheduling\n• Monitor deadlines and send reminders\n\n📧 **Email Intelligence**\n• Draft context-aware emails based on your work patterns\n• Suggest optimal sending times\n• Auto-categorize and prioritize responses\n\n📅 **Meeting Optimization**\n• Find best meeting times across team schedules\n• Suggest agenda items based on project context\n• Auto-reschedule conflicts and notify participants\n\n📄 **Document Processing**\n• Extract key insights and action items\n• Generate summaries tailored to your role\n• Suggest follow-up tasks and deadlines\n\n🎯 **Proactive Assistance**\n• Monitor your workload and suggest breaks\n• Antigate needs before you ask\n• Provide timely reminders and recommendations\n\nClick the microphone button or say 'Hey Assistant!' to start!",
        timestamp: new Date()
      }
    ]
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [autoExecute, setAutoExecute] = useState(true)
  const [lastCreatedTask, setLastCreatedTask] = useState(null)
  const [workloadMonitor, setWorkloadMonitor] = useState({
    tasksCompleted: 0,
    tasksPending: 0,
    currentFocus: null,
    lastBreakTime: null
  })
  const [proactiveSuggestions, setProactiveSuggestions] = useState([])
  const messagesEndRef = useRef(null)

  // Proactive monitoring and suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
      const completed = tasks.filter(t => t.completed).length
      const pending = tasks.filter(t => !t.completed).length

      setWorkloadMonitor(prev => ({
        ...prev,
        tasksCompleted: completed,
        tasksPending: pending
      }))

      // Generate proactive suggestions
      const suggestions = []

      // Suggest breaks if high workload
      if (pending > 5 && !workloadMonitor.lastBreakTime) {
        suggestions.push({
          type: 'break',
          message: '🧠 You have been working hard! Consider taking a 5-minute break to recharge.',
          priority: 'high'
        })
      }

      // Suggest task prioritization if many pending tasks
      if (pending > 3) {
        const highPriorityTasks = tasks.filter(t => t.priority === 'high')
        if (highPriorityTasks.length > 0) {
          suggestions.push({
            type: 'prioritization',
            message: '📋 You have high-priority tasks pending. Consider tackling: ' + highPriorityTasks.map(t => t.title).join(', '),
            priority: 'medium'
          })
        }
      }

      // Suggest end-of-day wrap-up
      const hour = new Date().getHours()
      if (hour >= 16 && pending > 0) {
        suggestions.push({
          type: 'wrap-up',
          message: '🌅 Consider wrapping up your day. You have ' + pending + ' tasks remaining for tomorrow.',
          priority: 'low'
        })
      }

      setProactiveSuggestions(suggestions)
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Clear old suggestions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setProactiveSuggestions([])
    }, 60000) // Clear every minute

    return () => clearInterval(interval)
  }, [])

  // Voice recognition handlers
  const handleVoiceResult = async (transcript) => {
    if (!transcript.trim()) return

    // Add user voice message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: transcript,
      timestamp: new Date(),
      isVoice: true
    }

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      localStorage.setItem('chatHistory', JSON.stringify(newMessages));
      return newMessages;
    })
    setIsLoading(true)

    try {
      // Parse and execute command automatically
      if (autoExecute) {
        const response = await executeCommand(transcript, {
          onCreateTask: async (data) => {
            // Dispatch custom event to notify Tasks component to re-fetch
            window.dispatchEvent(new CustomEvent('taskCreated', { detail: data }))
          },
          onCreateEmail: async (data) => {
            // Store email in localStorage
            const emails = JSON.parse(localStorage.getItem('emails') || '[]')
            const newEmail = {
              id: Date.now(),
              ...data,
              status: 'draft',
              date: new Date().toISOString().split('T')[0]
            }
            emails.push(newEmail)
            localStorage.setItem('emails', JSON.stringify(emails))

            // Navigate to Email section with the new email data
            localStorage.setItem('voiceEmailDraft', JSON.stringify(newEmail))
            navigate('/email')

            // Speak confirmation
            speak('Email draft created! Opening Email section for you.', {
              onend: () => setIsSpeaking(false)
            })
          },
          onCreateMeeting: async (data) => {
            // Store meeting in localStorage
            const meetings = JSON.parse(localStorage.getItem('meetings') || '[]')
            meetings.push({
              id: Date.now(),
              ...data
            })
            localStorage.setItem('meetings', JSON.stringify(meetings))
          },
          onSummarizeDocument: async () => {
            // Trigger document summarization
            console.log('Document summarization requested')
          }
        })

        // Add assistant response with enhanced formatting
        const messageResponse = typeof response === 'string' ? response : (response?.response || 'Done!');
        const assistantMessage = {
          id: messages.length + 2,
          type: 'assistant',
          content: messageResponse,
          timestamp: new Date(),
          actionType: response?.type || 'response'
        }

        setMessages(prev => {
          const newMessages = [...prev, assistantMessage];
          localStorage.setItem('chatHistory', JSON.stringify(newMessages));
          return newMessages;
        })

        // If task was created, show success indicator
        if (response?.type === 'create_task') {
          setLastCreatedTask(response.data)
          // Show notification after a brief delay
          setTimeout(() => {
            setLastCreatedTask(null)
          }, 5000)
        }

        // Speak the response (simplified for TTS)
        const speakText = response.split('\n')[0] || response
        setIsSpeaking(true)
        speak(speakText, {
          onend: () => setIsSpeaking(false)
        })
      } else {
        // Just generate a response without executing
        const parsed = await parseVoiceCommand(transcript)
        const assistantMessage = {
          id: messages.length + 2,
          type: 'assistant',
          content: parsed.response,
          timestamp: new Date()
        }
        setMessages(prev => {
          const newMessages = [...prev, assistantMessage];
          localStorage.setItem('chatHistory', JSON.stringify(newMessages));
          return newMessages;
        })

        setIsSpeaking(true)
        speak(parsed.response, {
          onend: () => setIsSpeaking(false)
        })
      }
    } catch (error) {
      console.error('Error processing voice command:', error)
      let errorMessageContent = 'Sorry, I encountered an error processing your request. Please try again.';
      if (error.response?.status === 403 && error.response?.data?.upgradeRequired) {
        errorMessageContent = 'You have reached your free daily limit for Voice Commands! Please upgrade to Premium to continue.'
      }
      const errorMessage = {
        id: messages.length + 2,
        type: 'assistant',
        content: errorMessageContent,
        timestamp: new Date()
      }
      setMessages(prev => {
        const newMessages = [...prev, errorMessage];
        localStorage.setItem('chatHistory', JSON.stringify(newMessages));
        return newMessages;
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceError = (error) => {
    console.error('Voice recognition error:', error)
    if (error === 'no-speech') {
      // User didn't speak, just stop listening
      return
    }
    const errorMessage = {
      id: messages.length + 1,
      type: 'assistant',
      content: 'Sorry, I had trouble understanding you. Please try again or type your message.',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, errorMessage])
  }

  const {
    isListening,
    transcript,
    toggleListening,
    isSupported: isVoiceSupported
  } = useVoiceRecognition(handleVoiceResult, handleVoiceError)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      localStorage.setItem('chatHistory', JSON.stringify(newMessages));
      return newMessages;
    })
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      // Execute command automatically if enabled
      if (autoExecute) {
        const response = await executeCommand(currentInput, {
          onCreateTask: async (data) => {
            // Dispatch custom event to notify Tasks component to re-fetch
            window.dispatchEvent(new CustomEvent('taskCreated', { detail: data }))
          },
          onDeleteTask: async (data) => {
            // Notify Tasks component to re-fetch which will sync UI since backend handled deletion
            window.dispatchEvent(new CustomEvent('taskCreated'))

            // Add success message
            const successMessage = {
              id: messages.length + 1,
              type: 'assistant',
              content: `🗑️ Task has been deleted!`,
              timestamp: new Date()
            }
            setMessages(prev => {
              const newMessages = [...prev, successMessage];
              localStorage.setItem('chatHistory', JSON.stringify(newMessages));
              return newMessages;
            })
          },
          onCreateEmail: async (data) => {
            // Store email in localStorage
            const emails = JSON.parse(localStorage.getItem('emails') || '[]')
            const newEmail = {
              id: Date.now(),
              ...data,
              status: 'draft',
              date: new Date().toISOString().split('T')[0]
            }
            emails.push(newEmail)
            localStorage.setItem('emails', JSON.stringify(emails))

            // Navigate to Email section with the new email data
            localStorage.setItem('voiceEmailDraft', JSON.stringify(newEmail))
            navigate('/email')

            // Speak confirmation
            speak('Email draft created! Opening Email section for you.', {
              onend: () => setIsSpeaking(false)
            })
          },
          onCreateMeeting: async (data) => {
            const meetings = JSON.parse(localStorage.getItem('meetings') || '[]')
            meetings.push({
              id: Date.now(),
              ...data
            })
            localStorage.setItem('meetings', JSON.stringify(meetings))
          },
          onSummarizeDocument: async () => {
            console.log('Document summarization requested')
          }
        })

        const messageResponse = typeof response === 'string' ? response : (response?.response || 'Done!');
        const assistantMessage = {
          id: messages.length + 2,
          type: 'assistant',
          content: messageResponse,
          timestamp: new Date(),
          actionType: response?.type || 'response'
        }
        setMessages(prev => {
          const newMessages = [...prev, assistantMessage];
          localStorage.setItem('chatHistory', JSON.stringify(newMessages));
          return newMessages;
        })

        // If task was created, show success indicator
        if (response?.type === 'create_task') {
          setLastCreatedTask(response.data)
          setTimeout(() => {
            setLastCreatedTask(null)
          }, 5000)
        }

        // Speak simplified response
        const speakText = response.split('\n')[0] || response
        setIsSpeaking(true)
        speak(speakText, {
          onend: () => setIsSpeaking(false)
        })
      } else {
        // Generate response without executing
        const parsed = await parseVoiceCommand(currentInput)
        const assistantMessage = {
          id: messages.length + 2,
          type: 'assistant',
          content: parsed.response,
          timestamp: new Date()
        }
        setMessages(prev => {
          const newMessages = [...prev, assistantMessage];
          localStorage.setItem('chatHistory', JSON.stringify(newMessages));
          return newMessages;
        })
      }
    } catch (error) {
      console.error('Error processing command:', error);
      let errorMessageContent = 'Sorry, I encountered a network error connecting to the AI service. Please try again.';
      if (error.response?.status === 403 && error.response?.data?.upgradeRequired) {
        errorMessageContent = 'You have reached your free daily limit for AI Commands! Please upgrade to Premium to continue.'
      }
      const errorMessage = {
        id: messages.length + 2,
        type: 'assistant',
        content: errorMessageContent,
        timestamp: new Date()
      }
      setMessages(prev => {
        const newMessages = [...prev, errorMessage];
        localStorage.setItem('chatHistory', JSON.stringify(newMessages));
        return newMessages;
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes('task') || lowerInput.includes('todo')) {
      return "I can help you manage tasks! Here are some things I can do:\n\n• Create a new task: 'Create a task to review the quarterly report'\n• List tasks: 'Show me all pending tasks'\n• Update tasks: 'Mark task 3 as completed'\n\nWould you like me to create a task for you?"
    }

    if (lowerInput.includes('email') || lowerInput.includes('mail')) {
      return "I can help you draft emails! Try commands like:\n\n• 'Draft an email to john@example.com about the project deadline'\n• 'Write a meeting invitation email'\n• 'Create a follow-up email for the client'\n\nWhat email would you like me to draft?"
    }

    if (lowerInput.includes('meeting') || lowerInput.includes('schedule')) {
      return "I can help you schedule meetings! I can:\n\n• Schedule a meeting: 'Schedule a team standup tomorrow at 10 AM'\n• Find available slots: 'When is everyone available this week?'\n• Send meeting invites: 'Send invites for the project review meeting'\n\nWhat meeting would you like to schedule?"
    }

    if (lowerInput.includes('document') || lowerInput.includes('summarize') || lowerInput.includes('summary')) {
      return "I can help with document processing! I can:\n\n• Summarize documents: 'Summarize the Q4 report'\n• Extract key points: 'What are the main points in the proposal?'\n• Answer questions: 'What does the document say about the budget?'\n\nWhich document would you like me to process?"
    }

    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return "Hello! I'm here to help you with your office tasks. What would you like to do today?"
    }

    return `I understand you're asking about: "${userInput}". I can help you with tasks, emails, meetings, and document processing. Could you be more specific about what you'd like me to do? For example:\n\n• "Create a task to review the budget"\n• "Draft an email to the team about the meeting"\n• "Schedule a meeting for tomorrow at 2 PM"\n• "Summarize the uploaded document"`
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionAccept = (suggestion) => {
    // Handle suggestion acceptance
    if (suggestion.type === 'break') {
      setWorkloadMonitor(prev => ({
        ...prev,
        lastBreakTime: new Date().toISOString()
      }))

      // Add a break task
      const breakTask = {
        id: Date.now(),
        title: '5-minute break',
        description: 'Time to recharge and refocus',
        status: 'completed',
        priority: 'low',
        createdAt: new Date().toISOString()
      }

      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
      tasks.push(breakTask)
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }

    // Remove the suggestion
    setProactiveSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
  }

  const handleSuggestionDismiss = (suggestion) => {
    // Handle suggestion dismissal
    setProactiveSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
  }

  const handleDirectTask = () => {
    const taskTitle = prompt('Enter task title:')
    if (taskTitle && taskTitle.trim()) {
      axios.post('https://taskpilot-backend-n09v.onrender.com/api/tasks', {
        title: taskTitle.trim(),
        priority: 'medium',
        status: 'PENDING'
      }).then((response) => {
        // Add success message
        const successMessage = {
          id: messages.length + 1,
          type: 'assistant',
          content: `✅ Task "${taskTitle}" has been created successfully!`,
          timestamp: new Date()
        }
        setMessages(prev => {
          const newMessages = [...prev, successMessage];
          localStorage.setItem('chatHistory', JSON.stringify(newMessages));
          return newMessages;
        })

        // Notify other components
        window.dispatchEvent(new CustomEvent('taskCreated'))

        // Show task created notification
        setLastCreatedTask(response.data.data)
        setTimeout(() => {
          setLastCreatedTask(null)
        }, 5000)
      }).catch(err => console.error("Could not create task", err))
    }
  }

  const handleDirectDelete = () => {
    const taskTitle = prompt('Enter task title to delete:')
    if (taskTitle && taskTitle.trim()) {
      // Get tasks from localStorage
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')

      // Find task by title (case-insensitive)
      const taskIndex = tasks.findIndex(task =>
        task.title.toLowerCase() === taskTitle.trim().toLowerCase()
      )

      if (taskIndex !== -1) {
        const deletedTask = tasks[taskIndex]

        // Remove task from array
        tasks.splice(taskIndex, 1)

        // Save updated tasks to localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks))

        // Add success message
        const successMessage = {
          id: messages.length + 1,
          type: 'assistant',
          content: `🗑️ Task "${deletedTask.title}" has been deleted successfully!`,
          timestamp: new Date()
        }
        setMessages(prev => {
          const newMessages = [...prev, successMessage];
          localStorage.setItem('chatHistory', JSON.stringify(newMessages));
          return newMessages;
        })

        // Trigger storage event for cross-tab sync
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'tasks',
          newValue: JSON.stringify(tasks)
        }))
      } else {
        // Add not found message
        const notFoundMessage = {
          id: messages.length + 1,
          type: 'assistant',
          content: `❌ Task "${taskTitle}" not found. No tasks were deleted.`,
          timestamp: new Date()
        }
        setMessages(prev => {
          const newMessages = [...prev, notFoundMessage];
          localStorage.setItem('chatHistory', JSON.stringify(newMessages));
          return newMessages;
        })
      }
    }
  }

  return (
    <div className="content-area assistant-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Assistant</h1>
          <p className="page-subtitle">Chat with your intelligent assistant using natural language or voice commands</p>
        </div>
        <div className="assistant-controls">
          {lastCreatedTask && (
            <div className="task-created-notification">
              <CheckSquare size={16} />
              <span>Task "{lastCreatedTask.title}" created!</span>
            </div>
          )}
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={autoExecute}
              onChange={(e) => setAutoExecute(e.target.checked)}
            />
            <span>Auto Execute</span>
          </label>
        </div>
      </div>

      <div className="assistant-layout">
        <div className="chat-main">
          <div className="chat-container">
            <div className="chat-messages">
              {proactiveSuggestions.map((suggestion, idx) => (
                <div key={`proactive-${idx}`} className="message assistant proactive-suggestion">
                  <div className="message-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="message-content">
                    <div className="message-text">
                      {suggestion.message}
                    </div>
                    <div className="suggestion-actions">
                      <button
                        className="suggestion-accept-btn"
                        onClick={() => handleSuggestionAccept(suggestion)}
                      >
                        ✓ Accept
                      </button>
                      <button
                        className="suggestion-dismiss-btn"
                        onClick={() => handleSuggestionDismiss(suggestion)}
                      >
                        ✕ Dismiss
                      </button>
                    </div>
                    <div className="message-time">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-avatar">
                    {message.type === 'assistant' ? (
                      <Bot size={20} />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-text">
                      {message.content}
                      {message.isVoice && (
                        <span className="voice-indicator" title="Voice message">
                          <Mic size={12} />
                        </span>
                      )}
                    </div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant">
                  <div className="message-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="message-content">
                    <div className="message-text">
                      <Loader size={16} className="spinner" />
                      Processing...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {isListening && (
              <div className="voice-listening-indicator">
                <div className="listening-animation">
                  <div className="pulse-ring"></div>
                  <Mic size={24} />
                </div>
                <div className="listening-text">
                  <p>Listening...</p>
                  {transcript && <span className="transcript-preview">{transcript}</span>}
                </div>
                <button className="stop-listening-btn" onClick={toggleListening}>
                  Stop
                </button>
              </div>
            )}

            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                {isVoiceSupported && (
                  <button
                    className={`voice-button ${isListening ? 'listening' : ''}`}
                    onClick={toggleListening}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                )}
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isVoiceSupported
                    ? "Type your message or click the microphone to speak... (e.g., 'Create a task to review the budget')"
                    : "Type your message or command... (e.g., 'Create a task to review the budget', 'Draft an email to John')"
                  }
                  className="chat-input"
                  rows="1"
                />
                {isSpeaking && (
                  <div className="speaking-indicator" title="Assistant is speaking">
                    <Volume2 size={18} />
                  </div>
                )}
                <button
                  className="send-button"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="input-hint">
                <Sparkles size={14} />
                <span>
                  {isVoiceSupported
                    ? 'Try voice commands like "Create a task" or "Schedule a meeting tomorrow at 2 PM"'
                    : 'Try natural language commands like "Schedule a meeting" or "Draft an email"'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="assistant-sidebar">
          <div className="sidebar-card">
            <h3>Voice Commands</h3>
            <div className="example-commands">
              <div className="example-command">
                <Mic size={14} />
                <code>"Create a task to review quarterly report"</code>
              </div>
              <div className="example-command">
                <Mic size={14} />
                <code>"Delete task called 'Complete project review'"</code>
              </div>
              <div className="example-command">
                <Mic size={14} />
                <code>"Add task 'Buy groceries' with high priority"</code>
              </div>
              <div className="example-command">
                <Mic size={14} />
                <code>"Draft an email to john@example.com about project deadline"</code>
              </div>
              <div className="example-command">
                <Mic size={14} />
                <code>"Schedule a team meeting tomorrow at 2 PM"</code>
              </div>
              <div className="example-command">
                <Mic size={14} />
                <code>"Set up a Zoom call with John about project"</code>
              </div>
              <div className="example-command">
                <Mic size={14} />
                <code>"Let's meet for coffee today at 3 PM"</code>
              </div>
              <div className="example-command">
                <Mic size={14} />
                <code>"Book a quick meeting with team tomorrow morning"</code>
              </div>
              <div className="example-command">
                <Mic size={14} />
                <code>"Summarize the uploaded Q4 financial report"</code>
              </div>
              <div className="example-command">
                <Mic size={14} />
                <code>"Hello Assistant" or "Hey Assistant"</code>
              </div>
            </div>
          </div>

          {!isVoiceSupported && (
            <div className="sidebar-card warning-card">
              <h3>Voice Not Supported</h3>
              <p>Your browser doesn't support voice recognition. Please use Chrome, Edge, or Safari for voice features.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Assistant




