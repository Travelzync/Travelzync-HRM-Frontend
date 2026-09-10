import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, CheckCircle2, AlertTriangle, Info, XCircle,
  CheckCheck, Trash2, ExternalLink, Sparkles, Loader2,
  Calendar, DollarSign, Clock, Package, Video
} from 'lucide-react'
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../../services/notificationService'
import { showSuccess, showError } from '../../utils/toast'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const categories = [
    'All',
    'Announcement',
    'Payroll',
    'Leave',
    'Attendance',
    'Meeting',
    'Asset',
    'System',
  ]

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const res = await getMyNotifications()
      if (res?.success) {
        setNotifications(res.notifications || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
    } catch {
      // silent
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead()
      showSuccess('All notifications marked as read')
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {
      showError('Failed to mark all as read')
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      showSuccess('Notification removed')
    } catch {
      showError('Failed to remove notification')
    }
  }

  const handleClick = async (notif) => {
    if (!notif.isRead) {
      handleMarkRead(notif._id)
    }
    if (notif.link) {
      navigate(notif.link)
    }
  }

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchCat =
        activeTab === 'All' ||
        n.type?.toLowerCase() === activeTab.toLowerCase() ||
        n.category?.toLowerCase() === activeTab.toLowerCase()

      const matchSearch =
        !searchQuery ||
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchCat && matchSearch
    })
  }, [notifications, activeTab, searchQuery])

  const getSeverityIcon = (severity, type) => {
    switch (type) {
      case 'payroll':
        return <DollarSign size={18} color="#16a34a" />
      case 'meeting':
        return <Video size={18} color="#c0392b" />
      case 'attendance':
        return <Clock size={18} color="#c0392b" />
      case 'asset':
        return <Package size={18} color="#7c3aed" />
      case 'leave':
        return <Calendar size={18} color="#d97706" />
      default:
        switch (severity) {
          case 'success':
            return <CheckCircle2 size={18} color="#16a34a" />
          case 'warning':
            return <AlertTriangle size={18} color="#d97706" />
          case 'error':
            return <XCircle size={18} color="#dc2626" />
          default:
            return <Info size={18} color="#c0392b" />
        }
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #c0392b 0%, #922b21 60%, #7b241c 100%)',
          borderRadius: 16,
          padding: '24px 28px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 4px 12px rgba(192, 57, 43, 0.25)',
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
            Notifications & Company Updates
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0' }}>
            Stay informed on leaves, attendance, payslips, meetings, and official broadcasts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#fff',
              color: '#c0392b',
              border: 'none',
              borderRadius: 8,
              padding: '10px 18px',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {/* 2. Filter Tabs & Search Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map((cat) => {
            const isActive = activeTab === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                style={{
                  background: isActive ? '#fef2f2' : 'transparent',
                  color: isActive ? '#c0392b' : '#64748b',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 12.5,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        <input
          type="text"
          placeholder="Filter notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '7px 12px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            fontSize: 12.5,
            outline: 'none',
            minWidth: 200,
            background: '#fff',
          }}
        />
      </div>

      {/* 3. Notifications List */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
          <span>Loading notifications...</span>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            padding: 40,
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <Sparkles size={32} style={{ margin: '0 auto 10px', color: '#cbd5e1' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
            No notifications found
          </h3>
          <p style={{ fontSize: 13, marginTop: 4 }}>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleClick(notif)}
              style={{
                background: notif.isRead ? '#fff' : '#fef2f2',
                border: `1px solid ${notif.isRead ? '#e2e8f0' : '#fecaca'}`,
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16,
                cursor: notif.link ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {getSeverityIcon(notif.severity, notif.type)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {notif.title}
                    </h4>

                    {!notif.isRead && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          background: '#dc2626',
                          color: '#fff',
                          borderRadius: 10,
                          padding: '1px 6px',
                        }}
                      >
                        NEW
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: 11,
                        color: '#64748b',
                        background: '#f1f5f9',
                        borderRadius: 6,
                        padding: '1px 6px',
                      }}
                    >
                      {notif.category || notif.type}
                    </span>
                  </div>

                  <p style={{ fontSize: 13, color: '#475569', margin: '6px 0 0 0', lineHeight: 1.45 }}>
                    {notif.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
                    <span>{notif.sender || 'System'}</span>
                    <span>•</span>
                    <span>
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {notif.link && (
                      <>
                        <span>•</span>
                        <span style={{ color: '#c0392b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <span>Open link</span>
                          <ExternalLink size={10} />
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={(e) => handleDelete(notif._id, e)}
                  title="Dismiss notification"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: 4,
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
