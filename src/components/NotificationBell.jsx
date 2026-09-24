import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, ExternalLink, Sparkles, X } from 'lucide-react'
import { toast } from 'react-toastify'
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService'
import { initSocket, subscribeToSocket } from '../services/socketService'
import {
  requestNotificationPermission,
  sendBrowserNotification,
  getNotificationPermissionStatus,
  triggerTestNotification,
} from '../services/browserNotificationService'
import { getCurrentUser } from '../services/authService'

export default function NotificationBell({ fullPagePath = '/employee/notifications' }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [recentNotifications, setRecentNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [permStatus, setPermStatus] = useState(() => getNotificationPermissionStatus())
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const handleEnableDesktopAlerts = async () => {
    try {
      const res = await requestNotificationPermission()
      setPermStatus(res)
      if (res === 'granted') {
        sendBrowserNotification('TravelZync HRM', {
          body: 'Desktop notifications are successfully enabled! 🎉',
        })
        toast.success('Desktop notifications enabled!')
      } else if (res === 'denied') {
        toast.warning(
          'Browser notifications are blocked. Please click the lock 🔒 icon next to localhost in the address bar and select "Allow".',
          { autoClose: 7000 }
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleTestDesktopNotification = (e) => {
    e?.stopPropagation()
    const res = triggerTestNotification()
    if (res.success) {
      toast.success('Test desktop notification sent!')
    } else if (res.reason === 'denied') {
      toast.warning('Notifications blocked in browser. Allow in site settings.')
    } else {
      toast.info('Test triggered! If no popup appears, please check Windows Focus Assist / Do Not Disturb.')
    }
  }

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

  // Socket live notification subscription & browser notifications
  useEffect(() => {
    loadCount()
    initSocket()
    requestNotificationPermission()

    const unsubNotif = subscribeToSocket('new_notification', (notif) => {
      if (!notif) return

      // 1. Immediately increment badge
      setUnreadCount((c) => c + 1)

      // 2. Prepend to recent list
      setRecentNotifications((prev) => [notif, ...prev.slice(0, 4)])

      // 3. Trigger native browser desktop notification
      sendBrowserNotification(`TravelZync HRM • ${notif.title}`, {
        body: notif.message,
        url: notif.link || fullPagePath,
      })

      // 4. Trigger premium react-toastify toast alert
      toast.info(
        <div style={{ cursor: 'pointer' }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{notif.title}</div>
          <div style={{ fontSize: 12, opacity: 0.95 }}>{notif.message}</div>
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        }
      )
    })

    // Listen for incoming chat message alerts across the application
    const unsubMsgAlert = subscribeToSocket('new_message_alert', (alert) => {
      if (!alert) return
      const current = getCurrentUser()
      const currentUserId = (current?.id || current?._id || current?.userId)?.toString()

      // Ignore outgoing messages from current user
      if (alert.senderId && alert.senderId.toString() === currentUserId) return

      const notifTitle =
        alert.type === 'direct'
          ? `Message from ${alert.senderName || 'Staff'}`
          : `#${alert.channel} • ${alert.senderName || 'Staff'}`

      const chatUrl = current?.role === 'admin' ? '/admin/chat' : '/employee/chat'

      // Native browser desktop notification with sound chime
      sendBrowserNotification(notifTitle, {
        body: alert.message || 'New message in chat',
        url: chatUrl,
      })

      // Toast alert if not already actively looking at that chat
      toast.info(
        <div style={{ cursor: 'pointer' }} onClick={() => navigate(chatUrl)}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{notifTitle}</div>
          <div style={{ fontSize: 12, opacity: 0.95 }}>{alert.message || 'New message in chat'}</div>
        </div>,
        {
          position: 'top-right',
          autoClose: 4500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        }
      )
    })

    return () => {
      unsubNotif()
      unsubMsgAlert()
    }
  }, [fullPagePath, navigate])

  useEffect(() => {
    if (isOpen) {
      loadRecent()
      setPermStatus(getNotificationPermissionStatus())
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
      toast.success('All notifications marked as read', { autoClose: 2000 })
    } catch (err) {
      console.error(err)
      toast.error('Failed to mark all as read')
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
              boxShadow: '0 0 6px rgba(239, 68, 68, 0.7)',
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

          {/* Desktop Notification Permission Banner */}
          {permStatus !== 'granted' ? (
            <div
              style={{
                padding: '9px 14px',
                background: permStatus === 'denied' ? '#fff1f2' : '#f0f9ff',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <Bell size={15} style={{ color: permStatus === 'denied' ? '#e11d48' : '#0284c7', marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: permStatus === 'denied' ? '#9f1239' : '#0369a1' }}>
                  {permStatus === 'denied' ? 'Desktop Alerts Blocked' : 'Enable Desktop Alerts'}
                </div>
                <div style={{ fontSize: 10.5, color: permStatus === 'denied' ? '#be123c' : '#0369a1', marginTop: 1, lineHeight: 1.3 }}>
                  {permStatus === 'denied'
                    ? 'Click the 🔒 icon in the URL bar & set Notifications to "Allow".'
                    : 'Get real-time browser popups for incoming chat & updates.'}
                </div>
                {permStatus !== 'denied' && (
                  <button
                    onClick={handleEnableDesktopAlerts}
                    style={{
                      marginTop: 5,
                      background: '#0284c7',
                      color: '#fff',
                      border: 'none',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Enable Now
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '6px 14px',
                background: '#f0fdf4',
                borderBottom: '1px solid #dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11,
                color: '#15803d',
                fontWeight: 600,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                Desktop Alerts Active
              </span>
              <button
                onClick={handleTestDesktopNotification}
                title="Send a sample browser desktop notification"
                style={{
                  background: '#dcfce7',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  padding: '2px 7px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Test Alert
              </button>
            </div>
          )}

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
