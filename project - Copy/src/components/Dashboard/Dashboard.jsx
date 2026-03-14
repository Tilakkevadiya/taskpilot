import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { 
  CheckSquare, 
  Mail, 
  Calendar, 
  FileText, 
  Plus, 
  Send, 
  MessageSquare,
  Layout,
  Zap,
  MousePointerClick
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    tasks: { total: 0, completed: 0 },
    emails: 0,
    meetings: 0,
    documents: 0,
  })

  const [upcomingMeetings, setUpcomingMeetings] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token')
        const [tasksRes, meetingsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/tasks', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8080/api/meetings', { headers: { Authorization: `Bearer ${token}` } })
        ])

        const tasks = tasksRes.data.data
        const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length

        setStats(prev => ({
          ...prev,
          tasks: { total: tasks.length, completed: completedTasks },
          meetings: meetingsRes.data.data.length,
          emails: JSON.parse(localStorage.getItem('emails') || '[]').length
        }))

        // Upcoming meetings
        setUpcomingMeetings(meetingsRes.data.data.slice(0, 2).map(m => ({
          title: m.title,
          time: new Date(m.meetingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(m.meetingTime).toLocaleDateString()
        })))

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="content-area">
      {/* 1. Greeting Section */}
      <section className="greeting-section">
        <div className="greeting-text">
          <h1>Welcome back, {user?.username || 'Pilot'} 👋</h1>
          <p>Let's get things done today. Here's your productivity overview.</p>
        </div>
      </section>

      {/* 2. Quick Action Buttons */}
      <section className="quick-actions">
        <button className="action-btn" onClick={() => navigate('/tasks')}>
          <Plus size={18} /> Create Task
        </button>
        <button className="action-btn" onClick={() => navigate('/email')}>
          <Send size={18} /> Send Email
        </button>
        <button className="action-btn" onClick={() => navigate('/meetings')}>
          <Calendar size={18} /> Schedule Meeting
        </button>
        <button className="action-btn" onClick={() => navigate('/assistant')}>
          <MessageSquare size={18} /> AI Assistant
        </button>
      </section>

      {/* 3. Stats Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card glass-card glass-card-hover" onClick={() => navigate('/tasks')}>
          <div className="stat-icon">
            <CheckSquare size={26} />
          </div>
          <div className="stat-content">
            <h3>{stats.tasks.total}</h3>
            <p>Tasks</p>
            <span>{stats.tasks.completed} completed today</span>
          </div>
        </div>
        <div className="stat-card glass-card glass-card-hover" onClick={() => navigate('/email')}>
          <div className="stat-icon">
            <Mail size={26} />
          </div>
          <div className="stat-content">
            <h3>{stats.emails}</h3>
            <p>Emails Sent</p>
            <span>AI powered drafts</span>
          </div>
        </div>
        <div className="stat-card glass-card glass-card-hover" onClick={() => navigate('/meetings')}>
          <div className="stat-icon">
            <Calendar size={26} />
          </div>
          <div className="stat-content">
            <h3>{stats.meetings}</h3>
            <p>Upcoming Meetings</p>
            <span>Sync with calendar</span>
          </div>
        </div>
        <div className="stat-card glass-card glass-card-hover" onClick={() => navigate('/documents')}>
          <div className="stat-icon">
            <FileText size={26} />
          </div>
          <div className="stat-content">
            <h3>{stats.documents}</h3>
            <p>Documents</p>
            <span>AI intelligence ready</span>
          </div>
        </div>
      </div>

      {/* 4. Feature Navigation Cards */}
      <div className="feature-nav-grid">
        <div className="feature-nav-card glass-card glass-card-hover" onClick={() => navigate('/tasks')}>
          <div className="feature-header">
            <div className="feature-icon-wrapper">
              <Layout size={24} />
            </div>
            <h2>Task Manager</h2>
          </div>
          <p>Create and manage your projects with ease. Stay on top of your deadlines.</p>
          <div className="feature-footer">
            <MousePointerClick size={16} />
            <span>Open Tasks</span>
          </div>
        </div>

        <div className="feature-nav-card glass-card glass-card-hover" onClick={() => navigate('/email')}>
          <div className="feature-header">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}>
              <Zap size={24} />
            </div>
            <h2>Email Automation</h2>
          </div>
          <p>Let AI draft your emails and manage your inbox efficiently.</p>
          <div className="feature-footer">
            <MousePointerClick size={16} />
            <span>Open Email</span>
          </div>
        </div>

        <div className="feature-nav-card glass-card glass-card-hover" onClick={() => navigate('/assistant')}>
          <div className="feature-header">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
              <MessageSquare size={24} />
            </div>
            <h2>AI Assistant</h2>
          </div>
          <p>Talk to TaskPilot AI for insights, scheduling, and task automation.</p>
          <div className="feature-footer">
            <MousePointerClick size={16} />
            <span>Open Assistant</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
