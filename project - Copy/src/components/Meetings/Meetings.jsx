import React, { useState, useEffect } from 'react'
import { Calendar, Plus, Clock, Users, MapPin, Video, Trash2, Edit2, Loader } from 'lucide-react'
import axios from 'axios'
import { useUsage } from '../../context/UsageContext'
import './Meetings.css'
import { toast } from 'react-hot-toast'

const Meetings = () => {
  const { fetchUsage } = useUsage()
  const [meetings, setMeetings] = useState([])
  const [showAddMeeting, setShowAddMeeting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    duration: 30,
    participants: '',
    location: '',
    type: 'in-person',
    description: '',
    reminderMinutesBefore: null
  })

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/api/meetings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const mappedMeetings = response.data.data.map(m => ({
        ...m,
        participants: typeof m.participants === 'string' 
          ? m.participants.split(',').filter(p => p.trim()) 
          : Array.isArray(m.participants) ? m.participants : []
      }))
      setMeetings(mappedMeetings)
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [])

  const validateMeeting = () => {
    const newErrors = {}
    const today = new Date().toISOString().split("T")[0]
    const now = new Date()

    if (!newMeeting.title.trim()) newErrors.title = 'Meeting title is required'
    if (!newMeeting.date) newErrors.date = 'Date is required'
    else if (newMeeting.date < today) newErrors.date = 'Date cannot be in the past'

    if (newMeeting.time && newMeeting.date === today) {
      const selectedTime = new Date(`${newMeeting.date}T${newMeeting.time}`)
      if (selectedTime < now) newErrors.time = 'Time must be in the future'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addMeeting = async () => {
    if (!validateMeeting()) return
    setIsLoading(true)

    try {
      const meetingTime = new Date(`${newMeeting.date}T${newMeeting.time}`).toISOString();
      const meetingData = {
        title: newMeeting.title,
        meetingTime: meetingTime,
        participants: newMeeting.participants.split(',').map(p => p.trim()).filter(p => p).join(','),
        location: newMeeting.location,
        type: newMeeting.type,
        duration: newMeeting.duration,
        description: newMeeting.description,
        reminderMinutesBefore: newMeeting.reminderMinutesBefore
      }
      
      console.log("Sending meeting:", meetingData)
      const token = localStorage.getItem('token')
      const response = await axios.post('http://localhost:8080/api/meetings', meetingData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const createdMeeting = {
        ...response.data.data,
        participants: typeof response.data.data.participants === 'string'
          ? response.data.data.participants.split(',').filter(p => p.trim())
          : Array.isArray(response.data.data.participants) ? response.data.data.participants : []
      }
      
      setMeetings(prev => [...prev, createdMeeting])
      
      setNewMeeting({
        title: '',
        date: '',
        time: '',
        duration: 30,
        participants: '',
        location: '',
        type: 'in-person',
        description: '',
        reminderMinutesBefore: null
      })
      setShowAddMeeting(false)
      fetchMeetings() // Sync in background
      await fetchUsage()
      toast.success("Meeting scheduled! 📅")
    } catch (error) {
      console.error('Failed to schedule meeting details:', error)
      if (error.response) console.error('Response data:', error.response.data)
      
      const msg = error.response?.data?.error || error.response?.data?.message || 'Failed to schedule meeting';
      if (error.response?.status === 403) {
        toast.error(msg + ' ✨', { duration: 5000 })
      } else {
        toast.error(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const deleteMeeting = async (id) => {
    const previous = [...meetings];
    setMeetings(meetings.filter(meeting => meeting.id !== id))
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:8080/api/meetings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success("Meeting deleted 🗑️")
    } catch(err) {
      console.error(err)
      toast.error("Failed to delete meeting")
      setMeetings(previous);
    }
  }

  const upcomingMeetings = meetings.filter(m => new Date(m.meetingTime) >= new Date().setHours(0,0,0,0))
  const pastMeetings = meetings.filter(m => new Date(m.meetingTime) < new Date().setHours(0,0,0,0))

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
              className={`input ${errors.title ? 'input-error' : ''}`}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={newMeeting.date}
                onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                className={`input ${errors.date ? 'input-error' : ''}`}
              />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={newMeeting.time}
                onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                className={`input ${errors.time ? 'input-error' : ''}`}
              />
              {errors.time && <span className="error-text">{errors.time}</span>}
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
          <div className="form-row">
            <div className="form-group">
              <label>Reminder</label>
              <select
                value={newMeeting.reminderMinutesBefore || ''}
                onChange={(e) => setNewMeeting({ ...newMeeting, reminderMinutesBefore: e.target.value ? parseInt(e.target.value) : null })}
                className="input"
              >
                <option value="">No reminder</option>
                <option value="10">10 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
              </select>
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
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setShowAddMeeting(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={addMeeting} disabled={isLoading}>
              {isLoading ? <Loader className="spinner" size={18} /> : null}
              {isLoading ? 'Scheduling...' : 'Schedule Meeting'}
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
                  <span>{new Date(meeting.meetingTime).toLocaleString()}</span>
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
                    <span>{new Date(meeting.meetingTime).toLocaleString()}</span>
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




