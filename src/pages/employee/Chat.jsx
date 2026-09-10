import { useState, useRef, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Send, Hash, Users, User, ShieldCheck, Loader2 } from 'lucide-react'
import { getMessages, sendMessage, markAsRead } from '../../services/chatService'
import { getCurrentUser } from '../../services/authService'

export default function Chat() {
  const context = useOutletContext() || {}
  const selectedChat = context.selectedChat || {
    type: 'public',
    id: 'general',
    name: 'general',
    label: 'General Hub',
  }
  const setSidebarOpen = context.setSidebarOpen || (() => {})

  const currentUser = getCurrentUser()
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load messages for current chat target
  const fetchChatMessages = useCallback(
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
        console.error('Failed to load chat messages:', err)
      } finally {
        if (isInitial) setLoading(false)
      }
    },
    [selectedChat]
  )

  useEffect(() => {
    fetchChatMessages(true)
    const interval = setInterval(() => fetchChatMessages(false), 3000)
    return () => clearInterval(interval)
  }, [fetchChatMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle Send Message
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
        scrollToBottom()
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  // Header Title metadata
  const getHeaderInfo = () => {
    if (selectedChat.type === 'direct') {
      return {
        title: selectedChat.name,
        subtitle: `${selectedChat.role === 'admin' ? 'Administrator' : 'Team Member'} • Direct Message`,
        icon: User,
      }
    }
    if (selectedChat.type === 'department') {
      return {
        title: `# ${selectedChat.name}`,
        subtitle: 'Department Team Channel',
        icon: Users,
      }
    }
    return {
      title: `# ${selectedChat.name}`,
      subtitle: selectedChat.label || 'Company-wide Public Channel',
      icon: Hash,
    }
  }

  const headerInfo = getHeaderInfo()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#fff',
        flex: 1,
      }}
    >
      {/* 1. Chat Header */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#fff',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#334155',
            }}
          >
            ☰
          </button>

          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#fef2f2',
              color: '#c0392b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <headerInfo.icon size={18} />
          </div>

          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              {headerInfo.title}
            </h2>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '1px 0 0 0' }}>
              {headerInfo.subtitle}
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            background: '#f0fdf4',
            color: '#16a34a',
            borderRadius: 12,
            padding: '3px 9px',
            border: '1px solid #dcfce7',
          }}
        >
          ● Active Now
        </span>
      </div>

      {/* 2. Scrollable Messages Feed Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
        className="hide-scroll"
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, color: '#94a3b8' }}>
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto' }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 16,
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
              }}
            >
              <headerInfo.icon size={22} color="#94a3b8" />
            </div>
            <p style={{ fontWeight: 600, fontSize: 14, color: '#334155', margin: 0 }}>
              No messages yet
            </p>
            <p style={{ fontSize: 12, marginTop: 4 }}>
              Be the first to start the conversation in {headerInfo.title}!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOutgoing =
              msg.isOutgoing || msg.sender?._id === currentUser?.userId || msg.sender?._id === currentUser?._id
            const senderName = msg.sender?.name || 'User'
            const senderInitials = senderName
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()
            const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <div
                key={msg._id || index}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  justifyContent: isOutgoing ? 'flex-end' : 'flex-start',
                }}
              >
                {!isOutgoing && (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#fee2e2',
                      color: '#c0392b',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {senderInitials}
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
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>
                        {senderName}
                      </span>
                      {msg.sender?.role === 'admin' && (
                        <span
                          style={{
                            fontSize: '9px',
                            background: '#fef3c7',
                            color: '#b45309',
                            fontWeight: 700,
                            borderRadius: 4,
                            padding: '1px 4px',
                          }}
                        >
                          ADMIN
                        </span>
                      )}
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{timeStr}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    style={{
                      background: isOutgoing
                        ? 'linear-gradient(135deg, #c0392b, #922b21)'
                        : '#ffffff',
                      color: isOutgoing ? '#ffffff' : '#0f172a',
                      borderRadius: isOutgoing ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      padding: '9px 14px',
                      fontSize: '13px',
                      lineHeight: 1.45,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      border: isOutgoing ? 'none' : '1px solid #e2e8f0',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.text}
                  </div>

                  {isOutgoing && (
                    <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>
                      {timeStr}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 3. Bottom Message Input Bar */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '14px 20px',
          borderTop: '1px solid #e2e8f0',
          background: '#fff',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${headerInfo.title}...`}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 24,
            border: '1px solid #cbd5e1',
            fontSize: '13px',
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
            fontSize: '13px',
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
  )
}
