import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send,
  Hash,
  Users,
  User,
  Search,
  Loader2,
  Sparkles,
  Lock,
  Plus,
  Settings,
  X,
  Check,
  UserPlus,
  Trash2,
  Pin,
  Smile,
  Forward,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'react-toastify'
import {
  getChannels,
  getChatUsers,
  getMessages,
  sendMessage,
  createChannel,
  addChannelMembers,
  removeChannelMember,
  deleteChannel,
  pinMessage,
  deleteMessage,
  reactToMessage,
  forwardMessage,
} from '../../services/chatService'
import { getCurrentUser } from '../../services/authService'
import {
  initSocket,
  subscribeToSocket,
  joinChannelRoom,
  sendTypingStatus,
} from '../../services/socketService'
import {
  requestNotificationPermission,
  sendBrowserNotification,
} from '../../services/browserNotificationService'

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉']

export default function AdminChat() {
  const currentUser = getCurrentUser()
  const currentUserId = (currentUser?.id || currentUser?._id || currentUser?.userId)?.toString()

  const [publicChannels, setPublicChannels] = useState([])
  const [privateChannels, setPrivateChannels] = useState([])
  const [deptChannels, setDeptChannels] = useState([])
  const [dmUsers, setDmUsers] = useState([])
  const [searchContact, setSearchContact] = useState('')
  const [onlineUserIds, setOnlineUserIds] = useState(new Set())

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

  // Hover & Action states
  const [hoveredMsgId, setHoveredMsgId] = useState(null)
  const [activeEmojiPickerMsgId, setActiveEmojiPickerMsgId] = useState(null)
  const [showPinnedBanner, setShowPinnedBanner] = useState(true)

  // Group creation modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [newGroupType, setNewGroupType] = useState('public')
  const [selectedMemberIds, setSelectedMemberIds] = useState([])
  const [creatingGroup, setCreatingGroup] = useState(false)

  // Manage members modal
  const [activeManageChannel, setActiveManageChannel] = useState(null)
  const [showManageModal, setShowManageModal] = useState(false)
  const [memberToAdd, setMemberToAdd] = useState('')
  const [managingMembers, setManagingMembers] = useState(false)

  // Delete channel modal
  const [channelToDelete, setChannelToDelete] = useState(null)
  const [deletingChannel, setDeletingChannel] = useState(false)

  // Forward Modal State
  const [forwardModalMsg, setForwardModalMsg] = useState(null)
  const [forwardTargetType, setForwardTargetType] = useState('public')
  const [forwardTargetChannel, setForwardTargetChannel] = useState('general')
  const [forwardTargetRecipient, setForwardTargetRecipient] = useState('')
  const [forwarding, setForwarding] = useState(false)

  // Typing status
  const [typingUsers, setTypingUsers] = useState(new Set())
  const typingTimeoutRef = useRef(null)

  const chatEndRef = useRef(null)

  const scrollToBottom = (smooth = true) => {
    chatEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }

  // Load channels and users directory
  const loadSidebar = useCallback(async () => {
    try {
      const [chRes, uRes] = await Promise.allSettled([getChannels(), getChatUsers()])
      if (chRes.status === 'fulfilled' && chRes.value?.success) {
        setPublicChannels(chRes.value.publicChannels || [])
        setPrivateChannels(chRes.value.privateChannels || [])
        setDeptChannels(chRes.value.departmentChannels || [])
      }
      if (uRes.status === 'fulfilled' && uRes.value?.success) {
        const users = uRes.value.users || []
        setDmUsers(users)
        const onlineSet = new Set(
          users.filter((u) => u.isOnline).map((u) => u._id.toString())
        )
        setOnlineUserIds((prev) => new Set([...prev, ...onlineSet]))
      }
    } catch {
      // silent
    }
  }, [])

  // Socket setup & presence
  useEffect(() => {
    loadSidebar()
    initSocket()
    requestNotificationPermission()

    const unsubOnline = subscribeToSocket('online_users', (userIds) => {
      if (Array.isArray(userIds)) {
        setOnlineUserIds(new Set(userIds.map((id) => id.toString())))
      }
    })

    const unsubUserOnline = subscribeToSocket('user_online', ({ userId }) => {
      if (userId) setOnlineUserIds((prev) => new Set([...prev, userId.toString()]))
    })

    const unsubUserOffline = subscribeToSocket('user_offline', ({ userId }) => {
      if (userId) {
        setOnlineUserIds((prev) => {
          const next = new Set(prev)
          next.delete(userId.toString())
          return next
        })
      }
    })

    const unsubChannelCreated = subscribeToSocket('channel_created', () => {
      loadSidebar()
    })

    const unsubChannelUpdated = subscribeToSocket('channel_updated', () => {
      loadSidebar()
    })

    const unsubChannelDeleted = subscribeToSocket('channel_deleted', ({ channelId }) => {
      setPublicChannels((prev) => prev.filter((c) => c.id !== channelId))
      setPrivateChannels((prev) => prev.filter((c) => c.id !== channelId))
      if (selectedChat?.id === channelId) {
        setSelectedChat({
          type: 'public',
          id: 'general',
          name: 'general',
          label: 'General Hub',
        })
      }
    })

    const unsubMessageAlert = subscribeToSocket('new_message_alert', (alert) => {
      if (!alert) return
      const isCurrentChat =
        alert.type === 'direct'
          ? selectedChat?.type === 'direct' && selectedChat?.recipientId === alert.senderId?.toString()
          : selectedChat?.type !== 'direct' && selectedChat?.id === alert.channel

      const isHidden = typeof document !== 'undefined' && document.hidden

      if (!isCurrentChat || isHidden) {
        const notifTitle =
          alert.type === 'direct'
            ? `Message from ${alert.senderName || 'Staff'}`
            : `#${alert.channel} • ${alert.senderName || 'Staff'}`
        sendBrowserNotification(notifTitle, {
          body: alert.message || 'New message in chat',
          url: '/admin/chat',
        })

        toast.info(
          <div style={{ cursor: 'pointer' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{notifTitle}</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>{alert.message}</div>
          </div>,
          {
            position: 'top-right',
            autoClose: 4000,
          }
        )
      }

      if (alert.type === 'direct') {
        const sId = alert.senderId?.toString()
        if (isCurrentChat) return
        setDmUsers((prev) =>
          prev.map((u) =>
            u._id.toString() === sId ? { ...u, unreadCount: (u.unreadCount || 0) + 1 } : u
          )
        )
      } else {
        const ch = alert.channel
        if (isCurrentChat) return
        setPublicChannels((prev) =>
          prev.map((c) => (c.id === ch ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c))
        )
        setPrivateChannels((prev) =>
          prev.map((c) => (c.id === ch ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c))
        )
      }
    })

    return () => {
      unsubOnline()
      unsubUserOnline()
      unsubUserOffline()
      unsubChannelCreated()
      unsubChannelUpdated()
      unsubChannelDeleted()
      unsubMessageAlert()
    }
  }, [loadSidebar, selectedChat])

  // Load active conversation messages
  const fetchMessages = useCallback(async () => {
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
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedChat])

  useEffect(() => {
    fetchMessages()
    if (selectedChat.type !== 'direct') {
      joinChannelRoom(selectedChat.id)
    }
  }, [fetchMessages, selectedChat])

  useEffect(() => {
    if (!loading) {
      scrollToBottom(false)
    }
  }, [loading])

  // Real-time message events for active chat
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

      if (isRelevant) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev
          return [...prev, msg]
        })
        scrollToBottom(true)

        const msgSenderId = (msg.sender?._id || msg.sender?.id || msg.sender)?.toString()
        if (msgSenderId !== currentUserId) {
          const title =
            msg.type === 'direct'
              ? `Message from ${msg.sender?.name || 'Staff'}`
              : `#${msg.channel} • ${msg.sender?.name || 'Staff'}`
          sendBrowserNotification(title, {
            body: msg.text,
            url: '/admin/chat',
          })
        }
      }
    })

    const unsubPinned = subscribeToSocket('message_pinned', ({ messageId, isPinned, pinnedBy, pinnedAt }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isPinned, pinnedBy, pinnedAt } : m
        )
      )
    })

    const unsubDeleted = subscribeToSocket('message_deleted', ({ messageId, text }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, text: text || '🚫 This message was deleted', attachments: [] }
            : m
        )
      )
    })

    const unsubReaction = subscribeToSocket('message_reaction', ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
      )
    })

    const unsubTyping = subscribeToSocket('user_typing', ({ userId, channel, isTyping, type }) => {
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

  // Typing event
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

  // Send message
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
      console.error(err)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // Pin message
  const handleTogglePin = async (msgId) => {
    try {
      const res = await pinMessage(msgId)
      if (res?.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === msgId ? { ...m, isPinned: res.isPinned } : m))
        )
        toast.success(res.isPinned ? 'Message pinned' : 'Message unpinned')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update pin')
    }
  }

  // Delete message
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

  // React to message
  const handleReact = async (msgId, emoji) => {
    setActiveEmojiPickerMsgId(null)
    try {
      const res = await reactToMessage(msgId, emoji)
      if (res?.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === msgId ? { ...m, reactions: res.reactions } : m))
        )
      }
    } catch (err) {
      console.error('Failed to react:', err)
    }
  }

  // Open Forward Modal
  const openForwardModal = (msg) => {
    setForwardModalMsg(msg)
    if (publicChannels.length > 0) setForwardTargetChannel(publicChannels[0].id)
    if (dmUsers.length > 0) setForwardTargetRecipient(dmUsers[0]._id)
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

  // Create Channel / Group
  const handleCreateGroup = async (e) => {
    e.preventDefault()
    if (!newGroupName.trim() || creatingGroup) return

    try {
      setCreatingGroup(true)
      const res = await createChannel({
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        type: newGroupType,
        members: selectedMemberIds,
      })

      if (res?.success && res.channel) {
        setShowCreateModal(false)
        setNewGroupName('')
        setNewGroupDesc('')
        setSelectedMemberIds([])
        setNewGroupType('public')
        toast.success(res.message || 'Group created successfully!')
        await loadSidebar()
        setSelectedChat({
          type: res.channel.type,
          id: res.channel.slug,
          name: res.channel.slug,
          label: res.channel.name,
        })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group')
    } finally {
      setCreatingGroup(false)
    }
  }

  // Delete Channel
  const handleConfirmDeleteChannel = async () => {
    if (!channelToDelete || deletingChannel) return
    try {
      setDeletingChannel(true)
      const targetId = channelToDelete.id || channelToDelete.slug || channelToDelete._id
      const res = await deleteChannel(targetId)
      if (res?.success) {
        toast.success(res.message || 'Channel deleted successfully')
        setChannelToDelete(null)
        await loadSidebar()
        if (selectedChat?.id === targetId || selectedChat?.id === channelToDelete.slug || selectedChat?.id === channelToDelete._id) {
          setSelectedChat({
            type: 'public',
            id: 'general',
            name: 'general',
            label: 'General Hub',
          })
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete channel')
    } finally {
      setDeletingChannel(false)
    }
  }

  // Add Member
  const handleAddMember = async () => {
    if (!memberToAdd || !activeManageChannel) return
    try {
      setManagingMembers(true)
      const res = await addChannelMembers(activeManageChannel.id, [memberToAdd])
      if (res?.success) {
        setMemberToAdd('')
        setActiveManageChannel((prev) => ({
          ...prev,
          members: res.channel.members,
        }))
        toast.success('Member added successfully')
        await loadSidebar()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member')
    } finally {
      setManagingMembers(false)
    }
  }

  // Remove Member
  const handleRemoveMember = async (memberId) => {
    if (!activeManageChannel) return
    try {
      setManagingMembers(true)
      const res = await removeChannelMember(activeManageChannel.id, memberId)
      if (res?.success) {
        setActiveManageChannel((prev) => ({
          ...prev,
          members: res.channel.members,
        }))
        toast.success('Member removed from group')
        await loadSidebar()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member')
    } finally {
      setManagingMembers(false)
    }
  }

  const pinnedMessages = messages.filter((m) => m.isPinned && !m.isDeleted)

  const filteredUsers = dmUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchContact.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchContact.toLowerCase())
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
          width: 300,
          borderRight: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Company Channels
            </h3>
            <button
              onClick={() => setShowCreateModal(true)}
              title="Create Public or Private Channel"
              style={{
                background: '#c0392b',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Plus size={13} />
              <span>Create</span>
            </button>
          </div>

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
                const canDelete = c.id !== 'general'

                return (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: 8,
                      background: isSelected ? '#fef2f2' : 'transparent',
                      color: isSelected ? '#c0392b' : '#334155',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: 12.5,
                    }}
                  >
                    <div
                      onClick={() => {
                        setSelectedChat({
                          type: 'public',
                          id: c.id,
                          name: c.name,
                          label: c.label || c.name,
                        })
                        setPublicChannels((prev) =>
                          prev.map((item) => (item.id === c.id ? { ...item, unreadCount: 0 } : item))
                        )
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, cursor: 'pointer', minWidth: 0 }}
                    >
                      <Hash size={14} color={isSelected ? '#c0392b' : '#94a3b8'} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {c.unreadCount > 0 && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            background: '#c0392b',
                            color: '#fff',
                            borderRadius: 8,
                            padding: '1px 5px',
                          }}
                        >
                          {c.unreadCount}
                        </span>
                      )}

                      {canDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setChannelToDelete(c)
                          }}
                          title="Delete Channel"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            padding: 2,
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Private Groups */}
          {privateChannels.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', padding: '0 8px', letterSpacing: 0.5 }}>
                PRIVATE GROUPS ({privateChannels.length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 6 }}>
                {privateChannels.map((group) => {
                  const isSelected = selectedChat.type === 'private' && selectedChat.id === group.id
                  return (
                    <div
                      key={group.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: 8,
                        background: isSelected ? '#fef2f2' : 'transparent',
                        color: isSelected ? '#c0392b' : '#334155',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: 12.5,
                      }}
                    >
                      <div
                        onClick={() => {
                          setSelectedChat({
                            type: 'private',
                            id: group.id,
                            name: group.name,
                            label: group.label || group.name,
                          })
                          setPrivateChannels((prev) =>
                            prev.map((item) => (item.id === group.id ? { ...item, unreadCount: 0 } : item))
                          )
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1, minWidth: 0 }}
                      >
                        <Lock size={13} color={isSelected ? '#c0392b' : '#94a3b8'} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {group.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {group.unreadCount > 0 && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              background: '#c0392b',
                              color: '#fff',
                              borderRadius: 8,
                              padding: '1px 5px',
                            }}
                          >
                            {group.unreadCount}
                          </span>
                        )}

                        <button
                          onClick={() => {
                            setActiveManageChannel(group)
                            setShowManageModal(true)
                          }}
                          title="Manage members"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            padding: 2,
                          }}
                        >
                          <Settings size={13} />
                        </button>

                        <button
                          onClick={() => setChannelToDelete(group)}
                          title="Delete group"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            padding: 2,
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: isSelected ? '#fef2f2' : 'transparent',
                        color: isSelected ? '#c0392b' : '#334155',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: 12.5,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Users size={14} color={isSelected ? '#c0392b' : '#94a3b8'} />
                        <span>{d.name}</span>
                      </div>

                      {d.unreadCount > 0 && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            background: '#c0392b',
                            color: '#fff',
                            borderRadius: 8,
                            padding: '1px 5px',
                          }}
                        >
                          {d.unreadCount}
                        </span>
                      )}
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
                const isOnline = onlineUserIds.has(u._id.toString())
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
                    onClick={() => {
                      setSelectedChat({
                        type: 'direct',
                        recipientId: u._id,
                        name: u.name,
                        role: u.role,
                        department: u.department,
                      })
                      setDmUsers((prev) =>
                        prev.map((item) => (item._id === u._id ? { ...item, unreadCount: 0 } : item))
                      )
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      background: isSelected ? '#fef2f2' : 'transparent',
                      color: isSelected ? '#c0392b' : '#334155',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: 12.5,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: isSelected ? '#c0392b' : '#e2e8f0',
                            color: isSelected ? '#fff' : '#475569',
                            fontSize: 10,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {uInitials}
                        </div>
                        {/* Live Online Dot */}
                        <span
                          style={{
                            position: 'absolute',
                            bottom: -1,
                            right: -1,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: isOnline ? '#22c55e' : '#cbd5e1',
                            border: '1.5px solid #fff',
                            boxShadow: isOnline ? '0 0 4px #22c55e' : 'none',
                          }}
                        />
                      </div>

                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.name}
                      </span>
                    </div>

                    {u.unreadCount > 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          background: '#c0392b',
                          color: '#fff',
                          borderRadius: 8,
                          padding: '1px 5px',
                        }}
                      >
                        {u.unreadCount}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Right Active Chat Feed Pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        {/* Header */}
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
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {selectedChat.type === 'direct'
                ? selectedChat.name
                : selectedChat.type === 'private'
                ? `🔒 ${selectedChat.name}`
                : `# ${selectedChat.name}`}
            </h3>
            <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0 0' }}>
              {selectedChat.type === 'direct'
                ? `Direct Messaging • ${selectedChat.department || 'Staff'}`
                : selectedChat.label || 'Channel'}
            </p>
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
                padding: '3px 8px',
                border: '1px solid #dcfce7',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
              <span>Live Socket.IO</span>
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
              // Exact outgoing check: matches sender ID or flag
              const senderId = (msg.sender?._id || msg.sender?.id || msg.sender)?.toString()
              const isOutgoing = Boolean(msg.isOutgoing || (currentUserId && senderId === currentUserId))

              const sName = msg.sender?.name || 'User'
              const sInitials = sName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
              const isHovered = hoveredMsgId === msg._id

              return (
                <div
                  key={msg._id || i}
                  onMouseEnter={() => setHoveredMsgId(msg._id)}
                  onMouseLeave={() => {
                    setHoveredMsgId(null)
                    if (activeEmojiPickerMsgId === msg._id) setActiveEmojiPickerMsgId(null)
                  }}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    justifyContent: isOutgoing ? 'flex-end' : 'flex-start',
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {/* Left avatar only for incoming messages */}
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
                      maxWidth: '72%',
                      marginLeft: isOutgoing ? 'auto' : 0,
                      marginRight: isOutgoing ? 0 : 'auto',
                      position: 'relative',
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

                    {/* Forwarded Tag */}
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

                    {/* Pinned Tag */}
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
                        <span>Pinned</span>
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
                        color: msg.isDeleted ? '#64748b' : isOutgoing ? '#ffffff' : '#0f172a',
                        borderRadius: isOutgoing ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        padding: '10px 16px',
                        fontSize: 13,
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

                          {/* Admin can delete any message */}
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

                    {/* Reactions Display */}
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

        {/* Typing status bar */}
        {typingUsers.size > 0 && (
          <div style={{ padding: '4px 20px', fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>
            Someone is typing...
          </div>
        )}

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
            onChange={handleInputChange}
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

      {/* CREATE CHANNEL / GROUP MODAL */}
      {showCreateModal && (
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
              maxWidth: 440,
              padding: 20,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Create New Channel or Group
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Channel Name
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. leadership-team, client-relations"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Brief channel purpose..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Channel Type
                </label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <label
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: newGroupType === 'public' ? '2px solid #c0392b' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      background: newGroupType === 'public' ? '#fef2f2' : '#fff',
                    }}
                  >
                    <input
                      type="radio"
                      name="adminGroupType"
                      checked={newGroupType === 'public'}
                      onChange={() => setNewGroupType('public')}
                    />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Public</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>All employees</div>
                    </div>
                  </label>

                  <label
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: newGroupType === 'private' ? '2px solid #c0392b' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      background: newGroupType === 'private' ? '#fef2f2' : '#fff',
                    }}
                  >
                    <input
                      type="radio"
                      name="adminGroupType"
                      checked={newGroupType === 'private'}
                      onChange={() => setNewGroupType('private')}
                    />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Private</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>Assigned members</div>
                    </div>
                  </label>
                </div>
              </div>

              {newGroupType === 'private' && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Select Initial Members ({selectedMemberIds.length} selected)
                  </label>
                  <div
                    style={{
                      maxHeight: 140,
                      overflowY: 'auto',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      padding: 6,
                    }}
                  >
                    {dmUsers.map((u) => {
                      const isChecked = selectedMemberIds.includes(u._id)
                      return (
                        <div
                          key={u._id}
                          onClick={() => {
                            setSelectedMemberIds((prev) =>
                              isChecked ? prev.filter((id) => id !== u._id) : [...prev, u._id]
                            )
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            background: isChecked ? '#f8fafc' : 'transparent',
                          }}
                        >
                          <span style={{ fontSize: 12, color: '#334155' }}>
                            {u.name} ({u.department || 'Staff'})
                          </span>
                          {isChecked && <Check size={14} color="#16a34a" />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                  disabled={creatingGroup || !newGroupName.trim()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, #c0392b, #922b21)',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: creatingGroup ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {creatingGroup && <Loader2 size={13} className="animate-spin" />}
                  <span>Create Channel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE GROUP MEMBERS MODAL */}
      {showManageModal && activeManageChannel && (
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
              maxWidth: 440,
              padding: 20,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Manage Members: {activeManageChannel.name}
                </h3>
                <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0 0' }}>
                  Private Group Settings
                </p>
              </div>
              <button
                onClick={() => {
                  setShowManageModal(false)
                  setActiveManageChannel(null)
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Add Member Dropdown */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <select
                value={memberToAdd}
                onChange={(e) => setMemberToAdd(e.target.value)}
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  outline: 'none',
                }}
              >
                <option value="">Select employee to add...</option>
                {dmUsers
                  .filter(
                    (u) =>
                      !activeManageChannel.members?.some(
                        (m) => (m._id || m).toString() === u._id.toString()
                      )
                  )
                  .map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.department || 'Staff'})
                    </option>
                  ))}
              </select>

              <button
                onClick={handleAddMember}
                disabled={!memberToAdd || managingMembers}
                style={{
                  background: '#c0392b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '7px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: !memberToAdd || managingMembers ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <UserPlus size={13} />
                <span>Add</span>
              </button>
            </div>

            {/* Members List */}
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>
                MEMBERS ({activeManageChannel.members?.length || 0})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {activeManageChannel.members?.map((m) => {
                  const mId = (m._id || m).toString()
                  const isCreator = (activeManageChannel.createdBy?._id || activeManageChannel.createdBy)?.toString() === mId
                  return (
                    <div
                      key={mId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: '#f8fafc',
                        borderRadius: 6,
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#334155' }}>
                        {m.name || m.email || mId}
                        {isCreator && (
                          <span style={{ fontSize: 10, color: '#b45309', marginLeft: 6, fontWeight: 700 }}>
                            (Owner)
                          </span>
                        )}
                      </span>

                      {!isCreator && (
                        <button
                          onClick={() => handleRemoveMember(mId)}
                          disabled={managingMembers}
                          title="Remove from group"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            padding: 2,
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CHANNEL CONFIRMATION MODAL */}
      {channelToDelete && (
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
              maxWidth: 400,
              padding: 22,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <AlertTriangle size={22} />
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
              Delete #{channelToDelete.name}?
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete this {channelToDelete.type} channel? All messages and history in this group will be deleted for all members.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setChannelToDelete(null)}
                style={{
                  padding: '8px 16px',
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
                type="button"
                disabled={deletingChannel}
                onClick={handleConfirmDeleteChannel}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#dc2626',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: deletingChannel ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {deletingChannel && <Loader2 size={13} className="animate-spin" />}
                <span>Delete Channel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORWARD MODAL */}
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
                      name="forwardTypeAdmin"
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
                      name="forwardTypeAdmin"
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
                    {[...publicChannels, ...privateChannels].map((c) => (
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
                    {dmUsers.map((u) => (
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
