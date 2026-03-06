import React, { useState, useEffect } from 'react'
import { Search, Crown, User, LogOut, ChevronDown, Camera, Edit } from 'lucide-react'
import { checkPremiumStatus, formatPremiumStatus } from '../../utils/premiumUtils'
import axios from 'axios'
import './Header.css'

const Header = ({ onPremiumClick, userData, onLogout }) => {
  const [premiumStatus, setPremiumStatus] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showPhotoEditor, setShowPhotoEditor] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem('userProfilePhoto') || null)
  const [usage, setUsage] = useState(null)

  const cartoonAvatars = [
    '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🎓', '👩‍🎓', '🧑‍🎓',
    '👨‍🍳', '👩‍🍳', '🧑‍🍳', '👨‍🎨', '👩‍🎨', '🧑‍🎨',
    '👨‍🔧', '👩‍🔧', '🧑‍🔧', '👨‍⚕️', '👩‍⚕️', '🧑‍⚕️',
    '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🚀', '👩‍🚀', '🧑‍🚀',
    '🦸', '🦹', '🦺', '🦸‍♂️', '🦹‍♂️', '🦺‍♂️',
    '🤖', '👽', '🤠', '🦄', '🦢', '🦣'
  ]

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await axios.get('https://taskpilot-backend-n09v.onrender.com/api/usage/current')
        setUsage(res.data)
        const isPrem = res.data.plan === 'PREMIUM'
        setPremiumStatus({ isPremium: isPrem })
      } catch (err) {
        console.error('Failed to fetch usage:', err)
        setPremiumStatus(checkPremiumStatus())
      }
    }
    fetchUsage()
  }, [])

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const photoData = e.target.result
        setProfilePhoto(photoData)
        localStorage.setItem('userProfilePhoto', photoData)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarSelect = (avatar) => {
    setProfilePhoto(avatar)
    localStorage.setItem('userProfilePhoto', avatar)
  }

  const handleRemovePhoto = () => {
    setProfilePhoto(null)
    localStorage.removeItem('userProfilePhoto')
  }

  const handleLogout = () => {
    onLogout()
    setShowProfile(false)
  }

  return (
    <header className="header">
      <div className="header-search">
        <Search size={20} />
        <input type="text" placeholder="Search..." className="search-input" />
      </div>
      <div className="header-actions">
        {usage && !premiumStatus?.isPremium && (
          <div className="usage-counters">
            <div className="usage-badge" title="Emails Left">📧 {usage.emails.remaining}</div>
            <div className="usage-badge" title="Voice Commands Left">🎙️ {usage.voice_commands.remaining}</div>
            <div className="usage-badge" title="Tasks Left">✅ {usage.tasks.remaining}</div>
          </div>
        )}

        {!premiumStatus?.isPremium ? (
          <button className="premium-btn" onClick={onPremiumClick} data-premium-btn>
            <Crown size={18} />
            Upgrade to Premium
          </button>
        ) : (
          <div className="premium-badge">
            <Crown size={16} />
            {formatPremiumStatus().status}
          </div>
        )}

        <div className="profile-section">
          <button
            className="profile-btn"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="profile-avatar">
              {profilePhoto ? (
                profilePhoto.startsWith('data:') ? (
                  <img src={profilePhoto} alt="Profile" className="profile-photo" />
                ) : (
                  <span className="profile-emoji">{profilePhoto}</span>
                )
              ) : (
                <User size={20} />
              )}
            </div>
            <ChevronDown size={16} className={`dropdown-arrow ${showProfile ? 'open' : ''}`} />
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-header">
                <div className="profile-info">
                  <div className="profile-avatar-large" onClick={() => setShowPhotoEditor(true)}>
                    {profilePhoto ? (
                      profilePhoto.startsWith('data:') ? (
                        <img src={profilePhoto} alt="Profile" className="profile-photo-large" />
                      ) : (
                        <span className="profile-emoji-large">{profilePhoto}</span>
                      )
                    ) : (
                      <User size={24} />
                    )}
                    <div className="edit-photo-overlay">
                      <Camera size={16} />
                    </div>
                  </div>
                  <div className="profile-details">
                    <h4>{userData?.name || 'User'}</h4>
                    <p>{userData?.email || 'user@example.com'}</p>
                    {premiumStatus?.isPremium && (
                      <span className="premium-status">
                        <Crown size={12} />
                        {formatPremiumStatus().message}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="profile-menu">
                <button className="menu-item" onClick={() => setShowPhotoEditor(true)}>
                  <Edit size={18} />
                  <span>Edit Profile Photo</span>
                </button>
                <button className="menu-item" onClick={onPremiumClick}>
                  <Crown size={18} />
                  <span>{premiumStatus?.isPremium ? 'Manage Plan' : 'Upgrade to Premium'}</span>
                </button>
                <div className="menu-divider"></div>
                <button className="menu-item logout" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}

          {showPhotoEditor && (
            <div className="photo-editor-overlay">
              <div className="photo-editor-modal">
                <div className="photo-editor-header">
                  <h3>Edit Profile Photo</h3>
                  <button className="close-btn" onClick={() => setShowPhotoEditor(false)}>
                    <User size={20} />
                  </button>
                </div>

                <div className="photo-editor-content">
                  <div className="photo-upload-section">
                    <h4>Upload Photo</h4>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="photo-input"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="photo-upload-btn">
                      <Camera size={20} />
                      Choose Photo
                    </label>
                  </div>

                  <div className="avatar-section">
                    <h4>Choose Avatar</h4>
                    <div className="avatar-grid">
                      {cartoonAvatars.map((avatar, index) => (
                        <button
                          key={index}
                          className={`avatar-option ${profilePhoto === avatar ? 'selected' : ''}`}
                          onClick={() => handleAvatarSelect(avatar)}
                        >
                          <span className="avatar-emoji">{avatar}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="photo-actions">
                    <button className="save-photo-btn" onClick={() => setShowPhotoEditor(false)}>
                      Save Changes
                    </button>
                    {profilePhoto && (
                      <button className="remove-photo-btn" onClick={handleRemovePhoto}>
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
