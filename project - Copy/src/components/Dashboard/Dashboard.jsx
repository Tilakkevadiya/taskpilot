import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { CheckSquare, Mail, Calendar, FileText, Clock } from 'lucide-react'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
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
        const [tasksRes, meetingsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/tasks'),
          axios.get('http://localhost:8080/api/meetings')
        ])

        const tasks = tasksRes.data.data
        const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length

        setStats(prev => ({
          ...prev,
          tasks: { total: tasks.length, completed: completedTasks },
          meetings: meetingsRes.data.length,
          emails: JSON.parse(localStorage.getItem('emails') || '[]').length // Email doesn't have an API GET yet, using local for now
        }))

        // Upcoming meetings can just be the first two from the API
        setUpcomingMeetings(meetingsRes.data.slice(0, 2).map(m => ({
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

  const recentActivities = [
    { type: 'task', action: 'Completed', item: 'Review Q4 report', time: '2 hours ago' },
    { type: 'email', action: 'Drafted', item: 'Meeting invitation', time: '4 hours ago' },
    { type: 'meeting', action: 'Scheduled', item: 'Team standup', time: '1 day ago' },
  ]

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your productivity overview.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/tasks')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">
            <CheckSquare size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.tasks.total}</h3>
            <p>Tasks</p>
            <span>{stats.tasks.completed} completed</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/email')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">
            <Mail size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.emails}</h3>
            <p>Emails</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/meetings')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.meetings}</h3>
            <p>Upcoming Meetings</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/documents')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.documents}</h3>
            <p>Documents</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivities.map((activity, index) => {
              // Determine path based on activity type
              let path = '';
              if (activity.type === 'task') path = '/tasks';
              else if (activity.type === 'email') path = '/email';
              else if (activity.type === 'meeting') path = '/meetings';

              return (
                <div
                  key={index}
                  className="activity-item"
                  onClick={() => navigate(path)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="activity-icon">
                    {activity.type === 'task' && <CheckSquare size={18} />}
                    {activity.type === 'email' && <Mail size={18} />}
                    {activity.type === 'meeting' && <Calendar size={18} />}
                  </div>
                  <div className="activity-content">
                    <p><span className="activity-action">{activity.action}</span> {activity.item}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="dashboard-card">
          <h2>Upcoming Meetings</h2>
          <div className="meetings-list">
            {upcomingMeetings.map((meeting, index) => (
              <div
                key={index}
                className="meeting-item"
                onClick={() => navigate('/meetings')}
                style={{ cursor: 'pointer' }}
              >
                <div className="meeting-time">
                  <Clock size={16} />
                  <span>{meeting.time}</span>
                </div>
                <div className="meeting-content">
                  <h3>{meeting.title}</h3>
                  <p>{meeting.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
