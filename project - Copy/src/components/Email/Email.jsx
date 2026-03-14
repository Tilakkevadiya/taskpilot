import React, { useState, useEffect } from 'react'
import { Send, Plus, Mail, Trash2, Edit2, Paperclip, Loader, CheckCircle2, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { useUsage } from '../../context/UsageContext'
import './Email.css'
import { toast } from 'react-hot-toast'

const Email = () => {
  const { decrementUsage } = useUsage()
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
  const [errors, setErrors] = useState({})
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: '',
    attachments: []
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [contacts, setContacts] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredContacts, setFilteredContacts] = useState([])

  // Fetch Google Contacts if applicable
  useEffect(() => {
    const fetchContacts = async () => {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user?.planType === 'PREMIUM') {
        try {
          const res = await axios.get('http://localhost:8080/api/email/contacts')
          setContacts(res.data)
        } catch (err) {
          console.error("Failed to fetch contacts", err)
        }
      }
    }
    fetchContacts()
  }, [])

  const handleToChange = (e) => {
    const value = e.target.value
    setComposeData({ ...composeData, to: value })
    if (value.length > 1) {
      const filtered = contacts.filter(c => 
        c.name?.toLowerCase().includes(value.toLowerCase()) || 
        c.email?.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredContacts(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectContact = (email) => {
    setComposeData({ ...composeData, to: email })
    setShowSuggestions(false)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => file.size <= 20 * 1024 * 1024)
    if (validFiles.length < files.length) {
      toast.error("Some files exceed the 20MB limit.")
    }
    setSelectedFiles([...selectedFiles, ...validFiles])
  }

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const validateCompose = () => {
    const newErrors = {}
    if (!composeData.to) newErrors.to = 'Recipient email is required'
    else if (!/\S+@\S+\.\S+/.test(composeData.to)) newErrors.to = 'Invalid email format'
    if (!composeData.subject.trim()) newErrors.subject = 'Subject is required'
    if (!composeData.body.trim()) newErrors.body = 'Email body is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCompose = () => {
    if (!validateCompose()) return
    
    const newEmail = {
      id: Date.now(),
      ...composeData,
      status: 'draft',
      date: new Date().toISOString().split('T')[0]
    }

    const currentEmails = JSON.parse(localStorage.getItem('emails') || '[]')
    const updatedEmails = [newEmail, ...currentEmails]
    localStorage.setItem('emails', JSON.stringify(updatedEmails))
    setEmails(updatedEmails)

    setComposeData({ to: '', subject: '', body: '', attachments: [] })
    setShowCompose(false)
    toast.success("Draft saved! 📝")
  }

  const sendEmail = async (id) => {
    const email = emails.find(e => e.id === id)
    if (email) {
      setIsSending(true);
      try {
        const formData = new FormData()
        formData.append('to', email.to)
        formData.append('subject', email.subject)
        formData.append('body', email.body)
        // Note: Drafts in localStorage don't store actual File objects easily, 
        // so for now we send without files if it's from a saved draft 
        // unless we implement a more complex storage logic.

        await axios.post('http://localhost:8080/api/email/send', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Email sent successfully! ✈️');

        const updatedEmails = emails.map(e =>
          e.id === id ? { ...e, status: 'sent' } : e
        )
        localStorage.setItem('emails', JSON.stringify(updatedEmails))
        setEmails(updatedEmails)
        decrementUsage('emails');
      } catch (err) {
        toast.error('Failed to send email.');
      } finally {
        setIsSending(false);
      }
    }
  }

  const handleComposeSend = async () => {
    if (!validateCompose()) return
    setIsSending(true);
    try {
      const formData = new FormData()
      formData.append('to', composeData.to)
      formData.append('subject', composeData.subject)
      formData.append('body', composeData.body)
      selectedFiles.forEach(file => {
        formData.append('files', file)
      })

      await axios.post('http://localhost:8080/api/email/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const newEmail = {
        id: Date.now(),
        ...composeData,
        status: 'sent',
        date: new Date().toISOString().split('T')[0]
      }
      
      const currentEmails = JSON.parse(localStorage.getItem('emails') || '[]')
      const updatedEmails = [newEmail, ...currentEmails]
      localStorage.setItem('emails', JSON.stringify(updatedEmails))
      setEmails(updatedEmails)

      setComposeData({ to: '', subject: '', body: '', attachments: [] })
      setSelectedFiles([])
      setShowCompose(false)
      toast.success('Email sent successfully! 🚀');
      decrementUsage('emails');
    } catch (err) {
      toast.error('Failed to send email. Draft saved.');
      // Auto-save as draft on failure
      const newEmail = {
        id: Date.now(),
        ...composeData,
        status: 'draft',
        date: new Date().toISOString().split('T')[0]
      }
      const currentEmails = JSON.parse(localStorage.getItem('emails') || '[]')
      const updatedEmails = [newEmail, ...currentEmails]
      localStorage.setItem('emails', JSON.stringify(updatedEmails))
      setEmails(updatedEmails)
      setShowCompose(false)
      setComposeData({ to: '', subject: '', body: '', attachments: [] })
      setSelectedFiles([])
    } finally {
      setIsSending(false);
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


      {showCompose && (
        <div className="compose-card glass-card">
          <h3>{isEditing ? 'Edit Email' : 'Compose Email'}</h3>
          <div className="form-group">
            <label>To</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="recipient@example.com"
                value={composeData.to}
                onChange={handleToChange}
                onFocus={() => composeData.to.length > 1 && setShowSuggestions(true)}
                className={`input ${errors.to ? 'input-error' : ''}`}
              />
              {showSuggestions && (
                <div className="contact-suggestions glass-card">
                  {filteredContacts.map((contact, i) => (
                    <div 
                      key={i} 
                      className="suggestion-item"
                      onClick={() => selectContact(contact.email)}
                    >
                      <span className="contact-name">{contact.name}</span>
                      <span className="contact-email">{contact.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.to && <span className="error-text">{errors.to}</span>}
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              placeholder="Email subject..."
              value={composeData.subject}
              onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
              className={`input ${errors.subject ? 'input-error' : ''}`}
            />
            {errors.subject && <span className="error-text">{errors.subject}</span>}
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea
              rows="8"
              placeholder="Type your message here... You can also use natural language commands like 'Draft an email to John about the project deadline'"
              value={composeData.body}
              onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
              className={`input textarea ${errors.body ? 'input-error' : ''}`}
            />
            {errors.body && <span className="error-text">{errors.body}</span>}
          </div>
          <div className="compose-actions">
            <div className="attachment-section">
              <input 
                type="file" 
                id="file-upload" 
                multiple 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
              />
              <button className="btn btn-secondary" onClick={() => document.getElementById('file-upload').click()}>
                <Paperclip size={18} />
                Attach
              </button>
              
              {selectedFiles.length > 0 && (
                <div className="selected-files">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="file-chip">
                      <span className="file-name">{file.name}</span>
                      <button onClick={() => removeFile(index)} className="remove-file">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
        <div className="email-list glass-card">
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

        <div className="email-detail glass-card">
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




