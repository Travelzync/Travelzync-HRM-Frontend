import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send, Hash, Users, User, Search, Loader2, Sparkles
} from 'lucide-react'
import { getChannels, getChatUsers, getMessages, sendMessage } from '../../services/chatService'
import { getCurrentUser } from '../../services/authService'

export default function AdminChat() {
  const currentUser = getCurrentUser()

  const [publicChannels, setPublicChannels] = useState([])
  const [deptChannels, setDeptChannels] = useState([])
  const [dmUsers, setDmUsers] = useState([])
  const [searchContact, setSearchContact] = useState('')

  const [selectedChat, setSelectedChat] = useState({
    type: 'public',
    id: 'general',
    name: 'general',
    label: 'General Hub',
  })

  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  const chatEndRef = useRef(null)

  // Load channels and users directory
  const loadSidebar = async () => {
    try {
      const [chRes, uRes] = await Promise.allSettled([getChannels(), getChatUsers()])
      if (chRes.status === 'fulfilled' && chRes.value?.success) {
        setPublicChannels(chRes.value.publicChannels || [])
        setDeptChannels(chRes.value.departmentChannels || [])
      }
      if (uRes.status === 'fulfilled' && uRes.value?.success) {
        setDmUsers(uRes.value.users || [])
      }
    } catch {
      // silent
    }
  }

  useEffect(() => {
    loadSidebar()
  }, [])

  // Load active conversation messages
  const fetchMessages = useCallback(
    async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true)
        const params = {
          type: selectedChat.type,
          channel: selectedChat.type === 'direct' ? undefined : selectedChat.id,
          recipientId: selectedChat.type === 'direct' ? selectedChat.recipientId : undefined,
        }
        const res = await getMessages(params)
        if (res?.success) {
          setMessages(res.messages || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (isInitial) setLoading(false)
      }
    },
    [selectedChat]
  )

  useEffect(() => {
    fetchMessages(true)
    const interval = setInterval(() => fetchMessages(false), 3000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle send message
  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputText.trim() || sending) return

    const textToSend = inputText.trim()
    setInputText('')

    try {
      setSending(true)
      const payload = {
        type: selectedChat.type,
        channel: selectedChat.type === 'direct' ? undefined : selectedChat.id,
        recipientId: selectedChat.type === 'direct' ? selectedChat.recipientId : undefined,
        text: textToSend,
      }
      const res = await sendMessage(payload)
      if (res?.success && res.chatMessage) {
        setMessages((prev) => [...prev, res.chatMessage])
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const filteredUsers = dmUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchContact.toLowerCase()) ||
      u.email.toLowerCase().includes(searchContact.toLowerCase())
  )

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 120px)',
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      }}
    >
      {/* 1. Left Channel & Contact Pane */}
      <div
        style={{
          width: 280,
          borderRight: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '16px 14px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Company Channels & DMs
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              padding: '6px 10px',
              marginTop: 10,
            }}
          >
            <Search size={13} color="#94a3b8" />
            <input
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              placeholder="Search staff..."
              style={{ border: 'none', outline: 'none', background: 'none', fontSize: 12, width: '100%' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }} className="hide-scroll">
          {/* Public Channels */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', padding: '0 8px', letterSpacing: 0.5 }}>
              PUBLIC CHANNELS
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 6 }}>
              {publicChannels.map((c) => {
                const isSelected = selectedChat.type === 'public' && selectedChat.id === c.id
                return (
                  <div
                    key={c.id}
                    onClick={() =>
                      setSelectedChat({
                        type: 'public',
                        id: c.id,
                        name: c.name,
                        label: c.label || c.name,
                      })
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '7px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      background: isSelected ? '#fef2f2' : 'transparent',
                      color: isSelected ? '#c0392b' : '#334155',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: 12.5,
                    }}
                  >
                    <Hash size={14} color={isSelected ? '#c0392b' : '#94a3b8'} />
                    <span>{c.name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Department Channels */}
          {deptChannels.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', padding: '0 8px', letterSpacing: 0.5 }}>
                DEPARTMENTS
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 6 }}>
                {deptChannels.map((d) => {
                  const isSelected = selectedChat.type === 'department' && selectedChat.id === d.id
                  return (
                    <div
                      key={d.id}
                      onClick={() =>
                        setSelectedChat({
                          type: 'department',
                          id: d.id,
                          name: d.name,
                          label: d.label || d.name,
                        })
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '7px 10px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: isSelected ? '#fef2f2' : 'transparent',
                        color: isSelected ? '#c0392b' : '#334155',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: 12.5,
                      }}
                    >
                      <Users size={14} color={isSelected ? '#c0392b' : '#94a3b8'} />
                      <span>{d.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Direct Messages */}
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', padding: '0 8px', letterSpacing: 0.5 }}>
              STAFF DIRECT ({filteredUsers.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 6 }}>
              {filteredUsers.map((u) => {
                const isSelected = selectedChat.type === 'direct' && selectedChat.recipientId === u._id
                const uInitials = u.name
                  ? u.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'U'

                return (
                  <div
                    key={u._id}
                    onClick={() =>
                      setSelectedChat({
                        type: 'direct',
                        recipientId: u._id,
                        name: u.name,
                        role: u.role,
                        department: u.department,
                      })
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '7px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      background: isSelected ? '#fef2f2' : 'transparent',
                      color: isSelected ? '#c0392b' : '#334155',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: 12.5,
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: isSelected ? '#c0392b' : '#e2e8f0',
                        color: isSelected ? '#fff' : '#475569',
                        fontSize: 10,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {uInitials}
                    </div>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Right Active Chat Feed Pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fff',
          }}
        >
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {selectedChat.type === 'direct' ? selectedChat.name : `# ${selectedChat.name}`}
            </h3>
            <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0 0' }}>
              {selectedChat.type === 'direct'
                ? `Direct Messaging • ${selectedChat.department || 'Staff'}`
                : selectedChat.label || 'Channel'}
            </p>
          </div>

          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              background: '#f0fdf4',
              color: '#16a34a',
              borderRadius: 12,
              padding: '3px 8px',
              border: '1px solid #dcfce7',
            }}
          >
            ● Live Sync (3s)
          </span>
        </div>

        {/* Message Feed */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
          className="hide-scroll"
        >
          {loading ? (
            <div style={{ margin: 'auto', color: '#94a3b8' }}>
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : messages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8' }}>
              <Sparkles size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ fontWeight: 600, color: '#334155' }}>No messages yet</p>
              <p style={{ fontSize: 12 }}>Send an announcement or message to start the discussion.</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isOutgoing =
                msg.isOutgoing || msg.sender?._id === currentUser?.userId || msg.sender?._id === currentUser?._id
              const sName = msg.sender?.name || 'User'
              const sInitials = sName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()

              return (
                <div
                  key={msg._id || i}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    justifyContent: isOutgoing ? 'flex-end' : 'flex-start',
                  }}
                >
                  {!isOutgoing && (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#e2e8f0',
                        color: '#475569',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {sInitials}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isOutgoing ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                    }}
                  >
                    {!isOutgoing && (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#1e293b' }}>{sName}</span>
                        <span style={{ fontSize: 10, color: '#94a3b8' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    <div
                      style={{
                        background: isOutgoing
                          ? 'linear-gradient(135deg, #c0392b, #922b21)'
                          : '#ffffff',
                        color: isOutgoing ? '#ffffff' : '#0f172a',
                        borderRadius: isOutgoing ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        padding: '9px 14px',
                        fontSize: 13,
                        lineHeight: 1.45,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        border: isOutgoing ? 'none' : '1px solid #e2e8f0',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.text}
                    </div>

                    {isOutgoing && (
                      <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Send Input */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #e2e8f0',
            background: '#fff',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${selectedChat.name}...`}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 24,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              outline: 'none',
              background: '#f8fafc',
            }}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            style={{
              background: 'linear-gradient(135deg, #c0392b, #922b21)',
              color: '#fff',
              border: 'none',
              borderRadius: 24,
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 600,
              cursor: !inputText.trim() || sending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 6px rgba(192, 57, 43, 0.3)',
              opacity: !inputText.trim() || sending ? 0.7 : 1,
            }}
          >
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  )
}
