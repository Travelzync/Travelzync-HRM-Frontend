import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Sun, Bell, Menu, LogOut, User as UserIcon, ChevronDown } from 'lucide-react'
import { getCurrentUser, clearAuthSession } from '../services/authService'
import { showInfo } from '../utils/toast'
import ThemeToggle from './ThemeToggle'
import NotificationBell from './NotificationBell'

export default function AdminHeader({ onMenuClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const user = getCurrentUser()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD'

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    showInfo('Signed out successfully.')
    clearAuthSession()
    navigate('/login', { replace: true })
  }

  return (
    <header
      style={{
        height: 64,
        background: 'var(--tz-bg-card)',
        borderBottom: '1px solid var(--tz-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 16,
        flexShrink: 0,
        position: 'relative',
        zIndex: 20,
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
      className="responsive-header"
    >
      <button
        onClick={onMenuClick}
        className="lg:hidden"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tz-text-secondary)' }}
      >
        <Menu size={20} />
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{ fontSize: 16, fontWeight: 700, color: 'var(--tz-text-primary)', lineHeight: 1.2 }}
          className="responsive-header-greeting truncate"
        >
          {greeting}, {user?.name || 'Admin'}! 👋
        </p>
        <p style={{ fontSize: 12, color: 'var(--tz-text-secondary)', marginTop: 3 }} className="responsive-header-greeting-sub">
          Welcome to TravelZync HRM Admin Panel.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--tz-bg-app)',
          border: '1px solid var(--tz-border)',
          borderRadius: 8,
          padding: '7px 12px',
          width: 220,
        }}
        className="responsive-header-search"
      >
        <Search size={14} color="#94a3b8" />
        <input
          placeholder="Search anything..."
          style={{
            border: 'none',
            background: 'none',
            outline: 'none',
            fontSize: 13,
            color: 'var(--tz-text-primary)',
            flex: 1,
          }}
        />
        <span style={{ fontSize: 10, color: 'var(--tz-text-secondary)', background: 'var(--tz-border)', borderRadius: 4, padding: '2px 5px' }}>
          Ctrl+K
        </span>
      </div>

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Real-time Notifications Bell */}
      <NotificationBell fullPagePath="/admin/notifications" />

      {/* User profile dropdown */}
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <div
          onClick={() => setDropdownOpen((prev) => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: 8,
            transition: 'background 0.15s',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #c0392b, #922b21)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--tz-border)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{initials}</span>
          </div>
          <ChevronDown size={14} color="#64748b" />
        </div>

        {dropdownOpen && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: 220,
              background: 'var(--tz-bg-card)',
              borderRadius: 12,
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)',
              border: '1px solid var(--tz-border)',
              padding: '8px',
              zIndex: 50,
            }}
          >
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--tz-border)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--tz-text-primary)', margin: 0 }} className="truncate">
                {user?.name || 'Administrator'}
              </p>
              <p style={{ fontSize: 11, color: 'var(--tz-text-secondary)', margin: '2px 0 0 0' }} className="truncate">
                {user?.email || 'admin@travelzync.com'}
              </p>
              <span
                style={{
                  display: 'inline-block',
                  background: 'var(--tz-red-soft-bg)',
                  color: 'var(--tz-red-primary)',
                  border: '1px solid var(--tz-red-soft-border)',
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 6,
                  marginTop: 6,
                  textTransform: 'uppercase',
                }}
              >
                {user?.role || 'Admin'}
              </span>
            </div>

            <div style={{ paddingTop: 4 }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  color: '#dc2626',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--tz-red-soft-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={15} color="#dc2626" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
