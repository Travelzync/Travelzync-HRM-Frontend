import { useState, useRef, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Send,
  Hash,
  Users,
  User,
  ShieldCheck,
  Loader2,
  Pin,
  Smile,
  Forward,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Lock,
} from 'lucide-react'
import { toast } from 'react-toastify'
import {
  getMessages,
  sendMessage,
  pinMessage,
  deleteMessage,
  reactToMessage,
  forwardMessage,
  getChannels,
  getChatUsers,
} from '../../services/chatService'
import { getCurrentUser } from '../../services/authService'
import {
  getSocket,
  subscribeToSocket,
  joinChannelRoom,
  sendTypingStatus,
} from '../../services/socketService'
import {
  requestNotificationPermission,
  sendBrowserNotification,
} from '../../services/browserNotificationService'

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉']

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
  // Ensure we check all possible ID keys from login / session
  const currentUserId = (currentUser?.id || currentUser?._id || currentUser?.userId)?.toString()
  const isAdmin = currentUser?.role === 'admin'

  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  // Hover & Action states
  const [hoveredMsgId, setHoveredMsgId] = useState(null)
  const [activeEmojiPickerMsgId, setActiveEmojiPickerMsgId] = useState(null)
  const [showPinnedBanner, setShowPinnedBanner] = useState(true)

  // Forward Modal State
  const [forwardModalMsg, setForwardModalMsg] = useState(null)
  const [forwardTargetType, setForwardTargetType] = useState('public')
  const [forwardTargetChannel, setForwardTargetChannel] = useState('general')
  const [forwardTargetRecipient, setForwardTargetRecipient] = useState('')
  const [forwarding, setForwarding] = useState(false)

  // Channels and Users for forward target selection
  const [allChannels, setAllChannels] = useState([])
  const [allUsers, setAllUsers] = useState([])

  // Typing status
  const [typingUsers, setTypingUsers] = useState(new Set())
  const typingTimeoutRef = useRef(null)

  const chatEndRef = useRef(null)
  const messageRefs = useRef({})

  const scrollToBottom = (smooth = true) => {
    chatEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }

  // Load message history for current active chat
  const fetchChatMessages = useCallback(async () => {
    try {
      setLoading(true)
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
      setLoading(false)
    }
  }, [selectedChat])

  // Join room and initial fetch
  useEffect(() => {
    fetchChatMessages()
    requestNotificationPermission()
    if (selectedChat.type !== 'direct') {
      joinChannelRoom(selectedChat.id)
    }
  }, [fetchChatMessages, selectedChat])

  // Scroll to bottom on initial message load
  useEffect(() => {
    if (!loading) {
      scrollToBottom(false)
    }
  }, [loading])

  // Real-time Socket.IO Listeners
  useEffect(() => {
    const unsubReceive = subscribeToSocket('receive_message', (msg) => {
      if (!msg) return

      let isRelevant = false
      if (selectedChat.type === 'direct') {
        const otherId = selectedChat.recipientId?.toString()
        const sId = (msg.sender?._id || msg.sender?.id || msg.sender)?.toString()
        const rId = (msg.recipient?._id || msg.recipient?.id || msg.recipient)?.toString()
        isRelevant =
          (sId === otherId && rId === currentUserId) ||
          (sId === currentUserId && rId === otherId)
      } else {
        isRelevant = msg.channel === selectedChat.id
      }

      const msgSenderId = (msg.sender?._id || msg.sender?.id || msg.sender)?.toString()
      const isFromOther = msgSenderId && msgSenderId !== currentUserId

      if (isRelevant) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev
          return [...prev, msg]
        })
        scrollToBottom(true)

        // Browser desktop notification if tab is hidden or minimized
        if (isFromOther && typeof document !== 'undefined' && document.hidden) {
          const title =
            msg.type === 'direct'
              ? `Message from ${msg.sender?.name || 'Colleague'}`
              : `#${msg.channel} • ${msg.sender?.name || 'Staff'}`
          sendBrowserNotification(title, {
            body: msg.text,
            url: '/employee/chat',
          })
        }
      } else if (isFromOther) {
        // Incoming message for another channel or conversation
        const title =
          msg.type === 'direct'
            ? `Message from ${msg.sender?.name || 'Colleague'}`
            : `#${msg.channel} • ${msg.sender?.name || 'Staff'}`
        sendBrowserNotification(title, {
          body: msg.text,
          url: '/employee/chat',
        })
        toast.info(
          <div style={{ cursor: 'pointer' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{title}</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>{msg.text}</div>
          </div>,
          { position: 'top-right', autoClose: 4000 }
        )
      }
    })

    // Message pinned update
    const unsubPinned = subscribeToSocket('message_pinned', ({ messageId, isPinned, pinnedBy, pinnedAt }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isPinned, pinnedBy, pinnedAt } : m
        )
      )
    })

    // Message deleted update
    const unsubDeleted = subscribeToSocket('message_deleted', ({ messageId, text, isDeleted }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, text: text || '🚫 This message was deleted', attachments: [] }
            : m
        )
      )
    })

    // Reaction update
    const unsubReaction = subscribeToSocket('message_reaction', ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, reactions } : m
        )
      )
    })

    // Typing status
    const unsubTyping = subscribeToSocket('user_typing', ({ userId, channel, recipientId, isTyping, type }) => {
      if (userId?.toString() === currentUserId) return

      let isCurrentRoom = false
      if (selectedChat.type === 'direct' && type === 'direct') {
        isCurrentRoom = userId?.toString() === selectedChat.recipientId?.toString()
      } else if (selectedChat.type !== 'direct' && type === 'channel') {
        isCurrentRoom = channel === selectedChat.id
      }

      if (isCurrentRoom) {
        setTypingUsers((prev) => {
          const next = new Set(prev)
          if (isTyping) next.add(userId)
          else next.delete(userId)
          return next
        })
      }
    })

    return () => {
      unsubReceive()
      unsubPinned()
      unsubDeleted()
      unsubReaction()
      unsubTyping()
    }
  }, [selectedChat, currentUserId])

  // Handle typing input
  const handleInputChange = (e) => {
    setInputText(e.target.value)

    sendTypingStatus({
      channel: selectedChat.type !== 'direct' ? selectedChat.id : undefined,
      recipientId: selectedChat.type === 'direct' ? selectedChat.recipientId : undefined,
      isTyping: true,
    })

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus({
        channel: selectedChat.type !== 'direct' ? selectedChat.id : undefined,
        recipientId: selectedChat.type === 'direct' ? selectedChat.recipientId : undefined,
        isTyping: false,
      })
    }, 2000)
  }

  // Handle Send Message
  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputText.trim() || sending) return

    const textToSend = inputText.trim()
    setInputText('')

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    sendTypingStatus({
      channel: selectedChat.type !== 'direct' ? selectedChat.id : undefined,
      recipientId: selectedChat.type === 'direct' ? selectedChat.recipientId : undefined,
      isTyping: false,
    })

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
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.chatMessage._id)) return prev
          return [...prev, { ...res.chatMessage, isOutgoing: true }]
        })
        scrollToBottom(true)
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // Pin / Unpin
  const handleTogglePin = async (msgId) => {
    try {
      const res = await pinMessage(msgId)
      if (res?.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === msgId ? { ...m, isPinned: res.isPinned } : m
          )
        )
        toast.success(res.isPinned ? 'Message pinned' : 'Message unpinned')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update pin')
    }
  }

  // Soft Delete
  const handleDelete = async (msgId) => {
    try {
      const res = await deleteMessage(msgId)
      if (res?.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === msgId
              ? { ...m, isDeleted: true, text: '🚫 This message was deleted', attachments: [] }
              : m
          )
        )
        toast.success('Message deleted')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete message')
    }
  }

  // React to Message
  const handleReact = async (msgId, emoji) => {
    setActiveEmojiPickerMsgId(null)
    try {
      const res = await reactToMessage(msgId, emoji)
      if (res?.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === msgId ? { ...m, reactions: res.reactions } : m
          )
        )
      }
    } catch (err) {
      console.error('Failed to react:', err)
    }
  }

  // Open Forward Modal
  const openForwardModal = async (msg) => {
    setForwardModalMsg(msg)
    try {
      const [chRes, uRes] = await Promise.allSettled([getChannels(), getChatUsers()])
      if (chRes.status === 'fulfilled' && chRes.value?.success) {
        const publicCh = chRes.value.publicChannels || []
        const privCh = chRes.value.privateChannels || []
        setAllChannels([...publicCh, ...privCh])
        if (publicCh.length > 0) setForwardTargetChannel(publicCh[0].id)
      }
      if (uRes.status === 'fulfilled' && uRes.value?.success) {
        const uList = uRes.value.users || []
        setAllUsers(uList)
        if (uList.length > 0) setForwardTargetRecipient(uList[0]._id)
      }
    } catch {
      // silent
    }
  }

  // Submit Forward
  const handleSubmitForward = async (e) => {
    e.preventDefault()
    if (!forwardModalMsg || forwarding) return

    try {
      setForwarding(true)
      const payload = {
        targetType: forwardTargetType,
        targetChannel: forwardTargetType === 'direct' ? undefined : forwardTargetChannel,
        recipientId: forwardTargetType === 'direct' ? forwardTargetRecipient : undefined,
      }

      const res = await forwardMessage(forwardModalMsg._id, payload)
      if (res?.success) {
        setForwardModalMsg(null)
        if (
          (forwardTargetType !== 'direct' && forwardTargetChannel === selectedChat.id) ||
          (forwardTargetType === 'direct' && forwardTargetRecipient === selectedChat.recipientId)
        ) {
          setMessages((prev) => [...prev, { ...res.chatMessage, isOutgoing: true }])
          scrollToBottom(true)
        }
        toast.success('Message forwarded successfully!')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to forward message')
    } finally {
      setForwarding(false)
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
    if (selectedChat.type === 'private') {
      return {
        title: `# ${selectedChat.name}`,
        subtitle: 'Private Group Channel',
        icon: Lock,
      }
    }
    return {
      title: `# ${selectedChat.name}`,
      subtitle: selectedChat.label || 'Company-wide Public Channel',
      icon: Hash,
    }
  }

  const headerInfo = getHeaderInfo()
  const pinnedMessages = messages.filter((m) => m.isPinned && !m.isDeleted)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#fff',
        flex: 1,
        position: 'relative',
      }}
    >
      {/* 1. Chat Header */}
      <div
        style={{
          padding: '12px 20px',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {pinnedMessages.length > 0 && (
            <button
              onClick={() => setShowPinnedBanner(!showPinnedBanner)}
              style={{
                background: showPinnedBanner ? '#fef2f2' : '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 600,
                color: '#c0392b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Pin size={12} fill="#c0392b" />
              <span>{pinnedMessages.length} Pinned</span>
              {showPinnedBanner ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}

          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              background: '#f0fdf4',
              color: '#16a34a',
              borderRadius: 12,
              padding: '3px 9px',
              border: '1px solid #dcfce7',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
            <span>Socket.IO Live</span>
          </span>
        </div>
      </div>

      {/* Pinned Messages Top Banner */}
      {showPinnedBanner && pinnedMessages.length > 0 && (
        <div
          style={{
            background: '#fffbeb',
            borderBottom: '1px solid #fef3c7',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            color: '#92400e',
            zIndex: 9,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
            <Pin size={14} color="#d97706" />
            <span style={{ fontWeight: 700 }}>Pinned:</span>
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#78350f',
              }}
            >
              "{pinnedMessages[pinnedMessages.length - 1].text}"
            </span>
          </div>

          <button
            onClick={() => handleTogglePin(pinnedMessages[pinnedMessages.length - 1]._id)}
            title="Unpin message"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#b45309',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Unpin
          </button>
        </div>
      )}

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
            // Precise check for current user outgoing message
            const senderId = (msg.sender?._id || msg.sender?.id || msg.sender)?.toString()
            const isOutgoing = Boolean(msg.isOutgoing || (currentUserId && senderId === currentUserId))

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
            const isHovered = hoveredMsgId === msg._id

            return (
              <div
                key={msg._id || index}
                ref={(el) => (messageRefs.current[msg._id] = el)}
                onMouseEnter={() => setHoveredMsgId(msg._id)}
                onMouseLeave={() => {
                  setHoveredMsgId(null)
                  if (activeEmojiPickerMsgId === msg._id) setActiveEmojiPickerMsgId(null)
                }}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  justifyContent: isOutgoing ? 'flex-end' : 'flex-start',
                  width: '100%',
                  position: 'relative',
                }}
              >
                {/* Incoming Message Avatar (Left only) */}
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
                    maxWidth: '72%',
                    marginLeft: isOutgoing ? 'auto' : 0,
                    marginRight: isOutgoing ? 0 : 'auto',
                    position: 'relative',
                  }}
                >
                  {/* Sender metadata & time (Incoming only) */}
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

                  {/* Forwarded Header */}
                  {msg.isForwarded && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 10,
                        color: '#64748b',
                        fontStyle: 'italic',
                        marginBottom: 2,
                      }}
                    >
                      <CornerDownRight size={10} />
                      <span>Forwarded from {msg.forwardedFrom?.name || 'Colleague'}</span>
                    </div>
                  )}

                  {/* Pinned Marker */}
                  {msg.isPinned && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 10,
                        color: '#b45309',
                        fontWeight: 700,
                        marginBottom: 2,
                      }}
                    >
                      <Pin size={10} fill="#b45309" />
                      <span>Pinned message</span>
                    </div>
                  )}

                  {/* Message Bubble - RIGHT SIDE FOR SENDER */}
                  <div
                    style={{
                      background: msg.isDeleted
                        ? '#f1f5f9'
                        : isOutgoing
                        ? 'linear-gradient(135deg, #c0392b, #922b21)'
                        : '#ffffff',
                      color: msg.isDeleted
                        ? '#64748b'
                        : isOutgoing
                        ? '#ffffff'
                        : '#0f172a',
                      borderRadius: isOutgoing ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      padding: '10px 16px',
                      fontSize: '13px',
                      lineHeight: 1.45,
                      boxShadow: isOutgoing ? '0 2px 6px rgba(192, 57, 43, 0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
                      border: msg.isDeleted ? '1px dashed #cbd5e1' : isOutgoing ? 'none' : '1px solid #e2e8f0',
                      wordBreak: 'break-word',
                      fontStyle: msg.isDeleted ? 'italic' : 'normal',
                      alignSelf: isOutgoing ? 'flex-end' : 'flex-start',
                      position: 'relative',
                    }}
                  >
                    {msg.text}

                    {/* Hover Action Toolbar */}
                    {isHovered && !msg.isDeleted && (
                      <div
                        style={{
                          position: 'absolute',
                          top: -28,
                          [isOutgoing ? 'right' : 'left']: 0,
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 20,
                          padding: '2px 6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                          zIndex: 20,
                        }}
                      >
                        {/* Reaction Trigger */}
                        <button
                          type="button"
                          onClick={() =>
                            setActiveEmojiPickerMsgId(
                              activeEmojiPickerMsgId === msg._id ? null : msg._id
                            )
                          }
                          title="Add reaction"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b',
                            padding: '3px',
                            display: 'flex',
                          }}
                        >
                          <Smile size={14} />
                        </button>

                        {/* Pin Button */}
                        <button
                          type="button"
                          onClick={() => handleTogglePin(msg._id)}
                          title={msg.isPinned ? 'Unpin' : 'Pin message'}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: msg.isPinned ? '#c0392b' : '#64748b',
                            padding: '3px',
                            display: 'flex',
                          }}
                        >
                          <Pin size={14} fill={msg.isPinned ? '#c0392b' : 'none'} />
                        </button>

                        {/* Forward Button */}
                        <button
                          type="button"
                          onClick={() => openForwardModal(msg)}
                          title="Forward message"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b',
                            padding: '3px',
                            display: 'flex',
                          }}
                        >
                          <Forward size={14} />
                        </button>

                        {/* Delete Button (sender or admin) */}
                        {(isOutgoing || isAdmin) && (
                          <button
                            type="button"
                            onClick={() => handleDelete(msg._id)}
                            title="Delete message"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#ef4444',
                              padding: '3px',
                              display: 'flex',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Emoji Picker Popup */}
                    {activeEmojiPickerMsgId === msg._id && (
                      <div
                        style={{
                          position: 'absolute',
                          top: -62,
                          [isOutgoing ? 'right' : 'left']: 0,
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 24,
                          padding: '4px 8px',
                          display: 'flex',
                          gap: 6,
                          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                          zIndex: 30,
                        }}
                      >
                        {EMOJI_OPTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReact(msg._id, emoji)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: 16,
                              cursor: 'pointer',
                              padding: '2px 4px',
                              borderRadius: 4,
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reactions Pill Display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4,
                        marginTop: 4,
                        justifyContent: isOutgoing ? 'flex-end' : 'flex-start',
                      }}
                    >
                      {msg.reactions.map((r) => {
                        const hasReacted = r.users?.some(
                          (u) => (u._id || u).toString() === currentUserId
                        )
                        return (
                          <button
                            key={r.emoji}
                            onClick={() => handleReact(msg._id, r.emoji)}
                            title={r.users?.map((u) => u.name || 'User').join(', ')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              background: hasReacted ? '#fef2f2' : '#fff',
                              border: hasReacted ? '1px solid #c0392b' : '1px solid #e2e8f0',
                              borderRadius: 12,
                              padding: '1px 6px',
                              fontSize: 11,
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                            }}
                          >
                            <span>{r.emoji}</span>
                            <span style={{ fontWeight: 700, color: hasReacted ? '#c0392b' : '#64748b' }}>
                              {r.users?.length || 1}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Outgoing Timestamp on the right */}
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

      {/* Typing Indicator Bar */}
      {typingUsers.size > 0 && (
        <div style={{ padding: '4px 24px', fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>
          typing...
        </div>
      )}

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
          onChange={handleInputChange}
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

      {/* FORWARD MESSAGE MODAL */}
      {forwardModalMsg && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              width: '100%',
              maxWidth: 420,
              padding: 20,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Forward Message
              </h3>
              <button
                onClick={() => setForwardModalMsg(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Message Preview */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                color: '#334155',
                marginBottom: 14,
                fontStyle: 'italic',
              }}
            >
              "{forwardModalMsg.text}"
            </div>

            <form onSubmit={handleSubmitForward} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Forward To Destination
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <label
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: forwardTargetType !== 'direct' ? '2px solid #c0392b' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      background: forwardTargetType !== 'direct' ? '#fef2f2' : '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="forwardType"
                      checked={forwardTargetType !== 'direct'}
                      onChange={() => setForwardTargetType('public')}
                    />
                    <span>Channel / Group</span>
                  </label>

                  <label
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: forwardTargetType === 'direct' ? '2px solid #c0392b' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      background: forwardTargetType === 'direct' ? '#fef2f2' : '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="forwardType"
                      checked={forwardTargetType === 'direct'}
                      onChange={() => setForwardTargetType('direct')}
                    />
                    <span>Staff Direct</span>
                  </label>
                </div>
              </div>

              {forwardTargetType !== 'direct' ? (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Select Channel
                  </label>
                  <select
                    value={forwardTargetChannel}
                    onChange={(e) => setForwardTargetChannel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  >
                    {allChannels.map((c) => (
                      <option key={c.id} value={c.id}>
                        # {c.name} ({c.type})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Select Staff Member
                  </label>
                  <select
                    value={forwardTargetRecipient}
                    onChange={(e) => setForwardTargetRecipient(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  >
                    {allUsers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.department || 'Staff'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setForwardModalMsg(null)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forwarding}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, #c0392b, #922b21)',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: forwarding ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {forwarding && <Loader2 size={13} className="animate-spin" />}
                  <span>Forward Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
