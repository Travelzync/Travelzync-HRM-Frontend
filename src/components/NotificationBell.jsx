import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, ExternalLink, Sparkles, X } from 'lucide-react'
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService'

export default function NotificationBell({ fullPagePath = '/employee/notifications' }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [recentNotifications, setRecentNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Fetch unread count
  const loadCount = async () => {
    try {
      const res = await getUnreadCount()
      if (res?.success) {
        setUnreadCount(res.unreadCount || 0)
      }
    } catch {
      // silent
    }
  }

  // Fetch recent notifications when dropdown opens
  const loadRecent = async () => {
    try {
      setLoading(true)
      const res = await getMyNotifications({ limit: 5 })
      if (res?.success) {
        setRecentNotifications(res.notifications || [])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCount()
    const interval = setInterval(loadCount, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadRecent()
    }
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setUnreadCount(0)
      setRecentNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await markNotificationAsRead(notif._id)
        setUnreadCount((c) => Math.max(0, c - 1))
        setRecentNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        )
      }
      setIsOpen(false)
      if (notif.link) {
        navigate(notif.link)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'success':
        return '#16a34a'
      case 'warning':
        return '#d97706'
      case 'error':
        return '#dc2626'
      default:
        return '#c0392b'
    }
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#64748b',
          padding: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              background: '#ef4444',
              color: '#fff',
              fontSize: 9,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 0 4px rgba(239, 68, 68, 0.6)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Quick Notifications Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            width: 330,
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    background: '#fef2f2',
                    color: '#dc2626',
                    padding: '2px 6px',
                    borderRadius: 8,
                  }}
                >
                  {unreadCount} New
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#c0392b',
                  fontSize: 11,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <CheckCheck size={13} />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 280, overflowY: 'auto' }} className="hide-scroll">
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                Loading notifications...
              </div>
            ) : recentNotifications.length === 0 ? (
              <div style={{ padding: 28, textAlign: 'center', color: '#94a3b8' }}>
                <Sparkles size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ fontSize: 12, margin: 0 }}>You're all caught up!</p>
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid #f8fafc',
                    background: notif.isRead ? '#fff' : '#fef2f2',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    transition: 'background 0.15s',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: notif.isRead ? '#cbd5e1' : getSeverityBadgeColor(notif.severity),
                      marginTop: 5,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: notif.isRead ? 600 : 700,
                        color: notif.isRead ? '#334155' : '#0f172a',
                        lineHeight: 1.3,
                      }}
                    >
                      {notif.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#64748b',
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {notif.message}
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '8px 14px',
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
              background: '#f8fafc',
            }}
          >
            <button
              onClick={() => {
                setIsOpen(false)
                navigate(fullPagePath)
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#c0392b',
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>See all notifications</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
