import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CheckSquare,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  Menu,
  X
} from 'lucide-react'
import './Sidebar.css'

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/email', icon: Mail, label: 'Email' },
    { path: '/meetings', icon: Calendar, label: 'Meetings' },
    { path: '/documents', icon: FileText, label: 'Documents' },
    { path: '/assistant', icon: MessageSquare, label: 'Assistant' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      <div className="sidebar-mobile-toggle" onClick={() => setIsMobileOpen(!isMobileOpen)}>
        <Menu size={24} />
      </div>

      <aside className={`sidebar ${isMobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">Task Pilot</span>
          </div>
          <button className="sidebar-close" onClick={() => setIsMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)} />
      )}
    </>
  )
}

export default Sidebar
