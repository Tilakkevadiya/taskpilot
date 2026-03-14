import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CheckSquare,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  Menu,
  X,
  Crown,
  Sparkles
} from 'lucide-react'
import { useUsage } from '../../context/UsageContext'
import './Sidebar.css'

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { usage } = useUsage()

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/email', icon: Mail, label: 'Email' },
    { path: '/meetings', icon: Calendar, label: 'Meetings' },
    { path: '/documents', icon: FileText, label: 'Documents' },
    { path: '/assistant', icon: MessageSquare, label: 'Assistant' },
  ]

  const isActive = (path) => location.pathname === path
  const isPremium = usage && usage.plan === 'PREMIUM'

  const aiRequestsUsed = Math.max(0, 25 - (usage?.aiRequestsLeft ?? 25))
  const documentsUsed = Math.max(0, 5 - (usage?.documentsLeft ?? 5))
  const tasksUsed = Math.max(0, 10 - (usage?.tasksLeft ?? 10))
  const meetingsUsed = Math.max(0, 5 - (usage?.meetingsLeft ?? 5))
  const emailsUsed = Math.max(0, 20 - (usage?.emailsLeft ?? 20))

  const premiumFeatures = [
    { label: 'AI Assistant', icon: MessageSquare },
    { label: 'Document Manager', icon: FileText },
  ]

  return (
    <>
      <div className="sidebar-mobile-toggle" onClick={() => setIsMobileOpen(!isMobileOpen)}>
        <Menu size={24} />
      </div>

      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Sparkles className="logo-spark" size={24} color="#6366f1" />
          <h2>TaskPilot</h2>
        </div>

        <div className="sidebar-scrollable-content">
          <nav className="sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className="sidebar-item-icon" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {!usage?.loading && (
            isPremium ? (
              <div className="premium-active-badge">
                <div className="premium-title">
                  <Sparkles size={16} /> ✨ Premium Active
                </div>
                <div className="premium-subtitle">Unlimited Access</div>
              </div>
            ) : usage ? (
              <div className="sidebar-usage-panel">
                <h4>Weekly Usage</h4>
                <div className="usage-item">
                  <div className="usage-header">
                    <span>Tasks</span>
                    <span>{tasksUsed} / 10</span>
                  </div>
                  <div className="usage-bar">
                    <div className="usage-fill" style={{ width: `${(tasksUsed / 10) * 100}%` }}></div>
                  </div>
                </div>
                <div className="usage-item">
                  <div className="usage-header">
                    <span>Meetings</span>
                    <span>{meetingsUsed} / 5</span>
                  </div>
                  <div className="usage-bar">
                    <div className="usage-fill" style={{ width: `${(meetingsUsed / 5) * 100}%` }}></div>
                  </div>
                </div>
                <div className="usage-item">
                  <div className="usage-header">
                    <span>Emails</span>
                    <span>{emailsUsed} / 20</span>
                  </div>
                  <div className="usage-bar">
                    <div className="usage-fill" style={{ width: `${(emailsUsed / 20) * 100}%` }}></div>
                  </div>
                </div>

                <div className="premium-features-locked">
                  <h5>Premium Features</h5>
                  {premiumFeatures.map((feat, i) => (
                    <div key={i} className="locked-feature-item">
                      <div className="locked-icon-wrapper">
                        <feat.icon size={14} />
                        <span className="lock-overlay">🔒</span>
                      </div>
                      <span>{feat.label}</span>
                    </div>
                  ))}
                </div>

                <Link to="/upgrade" className="upgrade-link">
                  <Crown size={16} /> Upgrade to Premium
                </Link>
              </div>
            ) : null
          )}
        </div>
      </aside>

      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)} />
      )}
    </>
  )
}

export default Sidebar
