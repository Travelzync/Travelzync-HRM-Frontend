import { useState, useEffect } from 'react'
import {
  Bell, Plus, CheckCheck, Trash2, Megaphone, Loader2,
  X, CheckCircle2, AlertTriangle, Info, XCircle, Send
} from 'lucide-react'
import {
  getMyNotifications,
  sendBroadcastNotification,
  markAllNotificationsAsRead,
  deleteNotification
} from '../../services/notificationService'
import { showSuccess, showError } from '../../utils/toast'
import { subscribeToSocket } from '../../services/socketService'

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false)
  const [sending, setSending] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    severity: 'info',
    link: '',
  })

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const res = await getMyNotifications({ limit: 100 })
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
    const unsub = subscribeToSocket('new_notification', (notif) => {
      if (notif) {
        setNotifications((prev) => [notif, ...prev])
      }
    })
    return () => unsub()
  }, [])

  const handleSendBroadcast = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.message) {
      showError('Title and message are required')
      return
    }

    try {
      setSending(true)
      await sendBroadcastNotification(formData)
      showSuccess('Broadcast announcement sent to all employees!')
      setBroadcastModalOpen(false)
      setFormData({ title: '', message: '', severity: 'info', link: '' })
      loadNotifications()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send broadcast')
    } finally {
      setSending(false)
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

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      showSuccess('Notification deleted')
    } catch {
      showError('Failed to delete notification')
    }
  }

  const broadcasts = notifications.filter((n) => n.isBroadcast)
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
            Notifications & Broadcast Hub
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0' }}>
            Broadcast instant company-wide alerts and track system logs across departments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 8,
                padding: '9px 14px',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <CheckCheck size={14} /> Mark Read
            </button>
          )}

          <button
            onClick={() => setBroadcastModalOpen(true)}
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
            <Megaphone size={16} /> Broadcast Announcement
          </button>
        </div>
      </div>

      {/* 2. Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total In-App Alerts</span>
            <Bell size={16} color="#c0392b" />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '8px 0 0 0' }}>
            {notifications.length}
          </h3>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Company Broadcasts</span>
            <Megaphone size={16} color="#d97706" />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '8px 0 0 0' }}>
            {broadcasts.length}
          </h3>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Unread Alerts</span>
            <AlertTriangle size={16} color="#dc2626" />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '8px 0 0 0' }}>
            {unreadCount}
          </h3>
        </div>
      </div>

      {/* 3. Notifications List */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Recent Notification Stream
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
            <span>Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            No notifications generated yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((notif) => (
              <div
                key={notif._id}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 16,
                  background: notif.isRead ? '#fff' : '#fef2f2',
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: notif.isBroadcast ? '#fef3c7' : '#fef2f2',
                      color: notif.isBroadcast ? '#b45309' : '#c0392b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {notif.isBroadcast ? <Megaphone size={18} /> : <Bell size={18} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                        {notif.title}
                      </span>
                      {notif.isBroadcast && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: 4 }}>
                          COMPANY BROADCAST
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        {new Date(notif.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: '#475569', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                      {notif.message}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(notif._id)}
                  title="Delete"
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
            ))}
          </div>
        )}
      </div>

      {/* 4. Broadcast Modal */}
      {broadcastModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              maxWidth: 480,
              width: '100%',
              padding: 24,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Megaphone size={18} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Send Company Broadcast
                </h3>
              </div>
              <button
                onClick={() => setBroadcastModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office Closed on Friday for Annual Meet"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Message Content *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Full announcement details sent instantly to all employees..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Severity Level
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                >
                  <option value="info">Information (Blue)</option>
                  <option value="success">Success / Celebration (Green)</option>
                  <option value="warning">Important Notice (Amber)</option>
                  <option value="error">Critical Alert (Red)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setBroadcastModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    color: '#64748b',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, #c0392b, #922b21)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: sending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  <span>Broadcast to All</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
