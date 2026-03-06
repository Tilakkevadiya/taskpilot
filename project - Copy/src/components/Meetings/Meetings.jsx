import React, { useState } from 'react'
import { Calendar, Plus, Clock, Users, MapPin, Video, Trash2, Edit2 } from 'lucide-react'
import './Meetings.css'

const Meetings = () => {
  const [meetings, setMeetings] = useState([
    { 
      id: 1, 
      title: 'Team Standup', 
      date: '2024-12-20', 
      time: '10:00 AM', 
      duration: 30, 
      participants: ['John', 'Sarah', 'Mike'],
      location: 'Conference Room A',
      type: 'in-person',
      description: 'Daily team standup meeting to discuss progress and blockers'
    },
    { 
      id: 2, 
      title: 'Client Presentation', 
      date: '2024-12-21', 
      time: '2:00 PM', 
      duration: 60, 
      participants: ['Client Team', 'Sales Team'],
      location: 'Zoom',
      type: 'virtual',
      description: 'Present Q4 results and discuss next quarter plans'
    },
    { 
      id: 3, 
      title: 'Project Review', 
      date: '2024-12-22', 
      time: '11:00 AM', 
      duration: 45, 
      participants: ['Project Team'],
      location: 'Conference Room B',
      type: 'in-person',
      description: 'Review project milestones and timeline'
    },
  ])

  const [showAddMeeting, setShowAddMeeting] = useState(false)
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    duration: 30,
    participants: '',
    location: '',
    type: 'in-person',
    description: ''
  })

  const addMeeting = () => {
    if (newMeeting.title && newMeeting.date && newMeeting.time) {
      const meeting = {
        id: meetings.length + 1,
        ...newMeeting,
        participants: newMeeting.participants.split(',').map(p => p.trim()).filter(p => p)
      }
      setMeetings([...meetings, meeting])
      setNewMeeting({
        title: '',
        date: '',
        time: '',
        duration: 30,
        participants: '',
        location: '',
        type: 'in-person',
        description: ''
      })
      setShowAddMeeting(false)
    }
  }

  const deleteMeeting = (id) => {
    setMeetings(meetings.filter(meeting => meeting.id !== id))
  }

  const upcomingMeetings = meetings.filter(m => new Date(m.date) >= new Date().setHours(0,0,0,0))
  const pastMeetings = meetings.filter(m => new Date(m.date) < new Date().setHours(0,0,0,0))

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Meetings</h1>
          <p className="page-subtitle">Schedule and manage your meetings</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddMeeting(!showAddMeeting)}>
          <Plus size={18} />
          Schedule Meeting
        </button>
      </div>

      {showAddMeeting && (
        <div className="add-meeting-card card">
          <h3>Schedule New Meeting</h3>
          <div className="form-group">
            <label>Meeting Title</label>
            <input
              type="text"
              placeholder="Enter meeting title..."
              value={newMeeting.title}
              onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
              className="input"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={newMeeting.date}
                onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={newMeeting.time}
                onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={newMeeting.duration}
                onChange={(e) => setNewMeeting({ ...newMeeting, duration: parseInt(e.target.value) })}
                className="input"
                min="15"
                step="15"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                value={newMeeting.type}
                onChange={(e) => setNewMeeting({ ...newMeeting, type: e.target.value })}
                className="input"
              >
                <option value="in-person">In-Person</option>
                <option value="virtual">Virtual</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                placeholder={newMeeting.type === 'virtual' ? 'Zoom/Teams link' : 'Room name or address'}
                value={newMeeting.location}
                onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Participants (comma-separated)</label>
            <input
              type="text"
              placeholder="John, Sarah, Mike"
              value={newMeeting.participants}
              onChange={(e) => setNewMeeting({ ...newMeeting, participants: e.target.value })}
              className="input"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="3"
              placeholder="Meeting agenda and description..."
              value={newMeeting.description}
              onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
              className="input textarea"
            />
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setShowAddMeeting(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={addMeeting}>
              Schedule Meeting
            </button>
          </div>
        </div>
      )}

      <div className="meetings-section">
        <h2 className="section-title">Upcoming Meetings</h2>
        <div className="meetings-grid">
          {upcomingMeetings.map(meeting => (
            <div key={meeting.id} className="meeting-card">
              <div className="meeting-header">
                <div className="meeting-icon">
                  {meeting.type === 'virtual' ? (
                    <Video size={24} color="#6366f1" />
                  ) : (
                    <Calendar size={24} color="#6366f1" />
                  )}
                </div>
                <div className="meeting-actions">
                  <button className="icon-btn" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button className="icon-btn" onClick={() => deleteMeeting(meeting.id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3>{meeting.title}</h3>
              <div className="meeting-details">
                <div className="meeting-detail-item">
                  <Clock size={16} />
                  <span>{meeting.date} at {meeting.time}</span>
                </div>
                <div className="meeting-detail-item">
                  <MapPin size={16} />
                  <span>{meeting.location}</span>
                </div>
                <div className="meeting-detail-item">
                  <Users size={16} />
                  <span>{meeting.participants.length} participants</span>
                </div>
              </div>
              {meeting.description && (
                <p className="meeting-description">{meeting.description}</p>
              )}
              <div className="meeting-participants">
                {meeting.participants.map((p, idx) => (
                  <span key={idx} className="participant-tag">{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {pastMeetings.length > 0 && (
        <div className="meetings-section">
          <h2 className="section-title">Past Meetings</h2>
          <div className="meetings-grid">
            {pastMeetings.map(meeting => (
              <div key={meeting.id} className="meeting-card past">
                <div className="meeting-header">
                  <div className="meeting-icon">
                    <Calendar size={24} color="var(--text-muted)" />
                  </div>
                </div>
                <h3>{meeting.title}</h3>
                <div className="meeting-details">
                  <div className="meeting-detail-item">
                    <Clock size={16} />
                    <span>{meeting.date} at {meeting.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {meetings.length === 0 && (
        <div className="empty-state">
          <Calendar size={48} color="var(--text-muted)" />
          <p>No meetings scheduled</p>
        </div>
      )}
    </div>
  )
}

export default Meetings




