import React, { useState, useEffect } from 'react'
import { Send, Plus, Mail, Trash2, Edit2, Paperclip, Loader, CheckCircle2, AlertCircle } from 'lucide-react'
import axios from 'axios'
import './Email.css'

const Email = () => {
  const [emails, setEmails] = useState([])

  // Load emails from localStorage on component mount
  useEffect(() => {
    const loadEmails = () => {
      const storedEmails = JSON.parse(localStorage.getItem('emails') || '[]')
      setEmails(storedEmails)
    }

    loadEmails()

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'emails') {
        loadEmails()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const [showCompose, setShowCompose] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingEmailId, setEditingEmailId] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: '',
    attachments: []
  })

  const handleCompose = () => {
    if (composeData.to && composeData.subject && composeData.body) {
      const newEmail = {
        id: Date.now(), // Use timestamp for unique ID
        ...composeData,
        status: 'draft',
        date: new Date().toISOString().split('T')[0]
      }

      // Save to localStorage
      const currentEmails = JSON.parse(localStorage.getItem('emails') || '[]')
      const updatedEmails = [newEmail, ...currentEmails]
      localStorage.setItem('emails', JSON.stringify(updatedEmails))
      setEmails(updatedEmails)

      setComposeData({ to: '', subject: '', body: '', attachments: [] })
      setShowCompose(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }

  const sendEmail = async (id) => {
    const email = emails.find(e => e.id === id)
    if (email) {
      setIsSending(true);
      try {
        const token = localStorage.getItem('token');
        await axios.post('https://taskpilot-backend-n09v.onrender.com/api/email/send', {
          to: email.to,
          subject: email.subject,
          body: email.body
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('Email sent successfully!');

        // Update email status to sent
        const updatedEmails = emails.map(e =>
          e.id === id ? { ...e, status: 'sent' } : e
        )
        localStorage.setItem('emails', JSON.stringify(updatedEmails))
        setEmails(updatedEmails)
      } catch (err) {
        showToast('Failed to send email.', 'error');
      } finally {
        setIsSending(false);
      }
    }
  }

  const handleComposeSend = async () => {
    if (composeData.to && composeData.subject && composeData.body) {
      setIsSending(true);
      try {
        const token = localStorage.getItem('token');
        await axios.post('https://taskpilot-backend-n09v.onrender.com/api/email/send', {
          to: composeData.to,
          subject: composeData.subject,
          body: composeData.body
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const newEmail = {
          id: emails.length + 1,
          ...composeData,
          status: 'sent',
          date: new Date().toISOString().split('T')[0]
        }
        setEmails([newEmail, ...emails])
        setComposeData({ to: '', subject: '', body: '', attachments: [] })
        setShowCompose(false)
        showToast('Email sent successfully!');
      } catch (err) {
        showToast('Failed to send email. Draft saved.', 'error');
        handleCompose(); // fallback save to draft
      } finally {
        setIsSending(false);
      }
    }
  }

  const handleEdit = (email) => {
    setComposeData({
      to: email.to,
      subject: email.subject,
      body: email.body,
      attachments: email.attachments || []
    })
    setIsEditing(true)
    setShowCompose(true)
    setEditingEmailId(email.id)
    setSelectedEmail(null)
  }

  const handleUpdate = () => {
    if (editingEmailId && composeData.to && composeData.subject && composeData.body) {
      const updatedEmails = emails.map(email =>
        email.id === editingEmailId
          ? { ...email, ...composeData, status: 'draft' }
          : email
      )
      localStorage.setItem('emails', JSON.stringify(updatedEmails))
      setEmails(updatedEmails)

      setComposeData({ to: '', subject: '', body: '', attachments: [] })
      setShowCompose(false)
      setIsEditing(false)
      setEditingEmailId(null)
      setSelectedEmail(null)
    }
  }

  const handleCancelEdit = () => {
    setComposeData({ to: '', subject: '', body: '', attachments: [] })
    setShowCompose(false)
    setIsEditing(false)
    setEditingEmailId(null)
    setSelectedEmail(null)
  }

  const deleteEmail = (id) => {
    const updatedEmails = emails.filter(email => email.id !== id)
    localStorage.setItem('emails', JSON.stringify(updatedEmails))
    setEmails(updatedEmails)
    if (selectedEmail?.id === id) {
      setSelectedEmail(null)
    }
  }

  // Check for voice email draft on component mount
  useEffect(() => {
    const voiceDraft = localStorage.getItem('voiceEmailDraft')
    if (voiceDraft) {
      const emailData = JSON.parse(voiceDraft)
      setComposeData({
        to: emailData.to,
        subject: emailData.subject,
        body: emailData.body,
        attachments: emailData.attachments || []
      })
      setShowCompose(true)
      setIsEditing(false)
      setEditingEmailId(null)

      // Clear the voice draft after loading
      localStorage.removeItem('voiceEmailDraft')
    }
  }, [])

  return (
    <div className="content-area email-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Email</h1>
          <p className="page-subtitle">Draft and manage your emails with AI assistance</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setShowCompose(!showCompose)
          setIsEditing(false)
          setEditingEmailId(null)
          setComposeData({ to: '', subject: '', body: '', attachments: [] })
        }}>
          <Plus size={18} />
          Compose
        </button>
      </div>

      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {showCompose && (
        <div className="compose-card card">
          <h3>{isEditing ? 'Edit Email' : 'Compose Email'}</h3>
          <div className="form-group">
            <label>To</label>
            <input
              type="email"
              placeholder="recipient@example.com"
              value={composeData.to}
              onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
              className="input"
            />
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              placeholder="Email subject..."
              value={composeData.subject}
              onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
              className="input"
            />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea
              rows="8"
              placeholder="Type your message here... You can also use natural language commands like 'Draft an email to John about the project deadline'"
              value={composeData.body}
              onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
              className="input textarea"
            />
          </div>
          <div className="compose-actions">
            <button className="btn btn-secondary">
              <Paperclip size={18} />
              Attach
            </button>
            <div>
              <button className="btn btn-secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
              {!isEditing && (
                <button className="btn btn-primary" onClick={handleCompose} disabled={isSending}>
                  <Mail size={18} />
                  Save Draft
                </button>
              )}
              <button className="btn btn-primary" onClick={isEditing ? handleUpdate : handleComposeSend} disabled={isSending}>
                {isSending ? <Loader className="spinner" size={18} /> : <Send size={18} />}
                {isSending ? 'Sending...' : (isEditing ? 'Update' : 'Send')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="email-layout">
        <div className="email-list">
          <div className="email-list-header">
            <h3>Emails</h3>
            <span className="email-count">{emails.length} total</span>
          </div>
          <div className="email-items">
            {emails.map(email => email ? (
              <div
                key={email.id || Math.random()}
                className={`email-item ${selectedEmail?.id === email.id ? 'active' : ''}`}
                onClick={() => setSelectedEmail(email)}
              >
                <div className="email-item-header">
                  <div className="email-status">
                    {email.status === 'sent' ? (
                      <Mail size={16} color="#10b981" />
                    ) : (
                      <Mail size={16} color="#f59e0b" />
                    )}
                    <span className={`status-badge ${email.status || 'draft'}`}>
                      {email.status || 'draft'}
                    </span>
                  </div>
                  <span className="email-date">{email.date || ''}</span>
                </div>
                <h4>{email.subject || '(No Subject)'}</h4>
                <p className="email-to">To: {email.to || ''}</p>
                <p className="email-preview">{(email.body || '').substring(0, 80)}...</p>
              </div>
            ) : null)}
          </div>
        </div>

        <div className="email-detail">
          {selectedEmail ? (
            <div className="email-detail-content">
              <div className="email-detail-header">
                <div>
                  <h2>{selectedEmail.subject}</h2>
                  <div className="email-detail-meta">
                    <span>To: {selectedEmail.to}</span>
                    <span>Date: {selectedEmail.date}</span>
                    <span className={`status-badge ${selectedEmail.status}`}>
                      {selectedEmail.status}
                    </span>
                  </div>
                </div>
                <div className="email-detail-actions">
                  <button className="icon-btn" title="Edit" onClick={() => handleEdit(selectedEmail)}>
                    <Edit2 size={18} />
                  </button>
                  {selectedEmail.status === 'draft' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => sendEmail(selectedEmail.id)}
                    >
                      <Send size={18} />
                      Send
                    </button>
                  )}
                  <button
                    className="icon-btn"
                    onClick={() => deleteEmail(selectedEmail.id)}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="email-body">
                {selectedEmail.body}
              </div>
            </div>
          ) : (
            <div className="email-empty">
              <Mail size={48} color="var(--text-muted)" />
              <p>Select an email to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Email




