import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  Hash,
  Users,
  Lock,
  Plus,
  Settings,
  X,
  Check,
  UserPlus,
  Trash2,
  Loader2,
  Shield,
} from 'lucide-react'
import {
  getChannels,
  getChatUsers,
  createChannel,
  addChannelMembers,
  removeChannelMember,
} from '../services/chatService'
import { getCurrentUser } from '../services/authService'
import { useTheme } from '../hooks/useTheme'
import {
  initSocket,
  subscribeToSocket,
  joinChannelRoom,
} from '../services/socketService'

export default function ChatSidebar({
  isOpen,
  onClose,
  selectedChat,
  setSelectedChat,
  backPath = '/employee/overview',
}) {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const isAdmin = currentUser?.role === 'admin'
  const { isDark } = useTheme()

  const [publicChannels, setPublicChannels] = useState([])
  const [privateChannels, setPrivateChannels] = useState([])
  const [deptChannels, setDeptChannels] = useState([])
  const [dmUsers, setDmUsers] = useState([])
  const [onlineUserIds, setOnlineUserIds] = useState(new Set())

  // Modals state
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

  // Fetch channels & contacts
  const loadSidebarData = useCallback(async () => {
    try {
      const [channelsRes, usersRes] = await Promise.allSettled([
        getChannels(),
        getChatUsers(),
      ])

      if (channelsRes.status === 'fulfilled' && channelsRes.value?.success) {
        setPublicChannels(channelsRes.value.publicChannels || [])
        setPrivateChannels(channelsRes.value.privateChannels || [])
        setDeptChannels(channelsRes.value.departmentChannels || [])
      }

      if (usersRes.status === 'fulfilled' && usersRes.value?.success) {
        const users = usersRes.value.users || []
        setDmUsers(users)
        // Initialize online users from user list isOnline property
        const onlineSet = new Set(
          users.filter((u) => u.isOnline).map((u) => u._id.toString())
        )
        setOnlineUserIds((prev) => new Set([...prev, ...onlineSet]))
      }
    } catch {
      // fallback
    }
  }, [])

  // Socket setup
  useEffect(() => {
    loadSidebarData()
    initSocket()

    // 1. Initial online users list from server
    const unsubOnline = subscribeToSocket('online_users', (userIds) => {
      if (Array.isArray(userIds)) {
        setOnlineUserIds(new Set(userIds.map((id) => id.toString())))
      }
    })

    // 2. User connected
    const unsubUserOnline = subscribeToSocket('user_online', ({ userId }) => {
      if (userId) {
        setOnlineUserIds((prev) => new Set([...prev, userId.toString()]))
      }
    })

    // 3. User disconnected
    const unsubUserOffline = subscribeToSocket('user_offline', ({ userId }) => {
      if (userId) {
        setOnlineUserIds((prev) => {
          const next = new Set(prev)
          next.delete(userId.toString())
          return next
        })
      }
    })

    // 4. Channel created
    const unsubChannelCreated = subscribeToSocket('channel_created', (chan) => {
      if (!chan) return
      if (chan.type === 'private') {
        setPrivateChannels((prev) => {
          if (prev.some((c) => c.id === chan.slug)) return prev
          return [
            ...prev,
            {
              _id: chan._id,
              id: chan.slug,
              name: chan.slug,
              label: chan.name,
              description: chan.description,
              type: 'private',
              members: chan.members,
              unreadCount: 0,
            },
          ]
        })
      } else {
        setPublicChannels((prev) => {
          if (prev.some((c) => c.id === chan.slug)) return prev
          return [
            ...prev,
            {
              _id: chan._id,
              id: chan.slug,
              name: chan.slug,
              label: chan.name,
              description: chan.description,
              type: 'public',
              unreadCount: 0,
            },
          ]
        })
      }
    })

    // 5. Channel updated
    const unsubChannelUpdated = subscribeToSocket('channel_updated', (chan) => {
      if (!chan) return
      loadSidebarData()
    })

    // 6. Channel removed
    const unsubChannelRemoved = subscribeToSocket('channel_removed', ({ channelId }) => {
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

    // 7. Unread message alert
    const unsubMessageAlert = subscribeToSocket('new_message_alert', (alert) => {
      if (!alert) return
      if (alert.type === 'direct') {
        const sId = alert.senderId?.toString()
        if (selectedChat?.type === 'direct' && selectedChat?.recipientId === sId) {
          return // Currently open, no unread badge increment
        }
        setDmUsers((prev) =>
          prev.map((u) =>
            u._id.toString() === sId
              ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
              : u
          )
        )
      } else {
        const ch = alert.channel
        if (selectedChat?.type !== 'direct' && selectedChat?.id === ch) {
          return // Currently open
        }
        setPublicChannels((prev) =>
          prev.map((c) => (c.id === ch ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c))
        )
        setPrivateChannels((prev) =>
          prev.map((c) => (c.id === ch ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c))
        )
        setDeptChannels((prev) =>
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
      unsubChannelRemoved()
      unsubMessageAlert()
    }
  }, [loadSidebarData, selectedChat, setSelectedChat])

  // Select a chat item and clear its unread count
  const handleSelectChat = (item) => {
    setSelectedChat(item)
    if (item.type === 'direct') {
      setDmUsers((prev) =>
        prev.map((u) => (u._id === item.recipientId ? { ...u, unreadCount: 0 } : u))
      )
    } else {
      joinChannelRoom(item.id)
      setPublicChannels((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, unreadCount: 0 } : c))
      )
      setPrivateChannels((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, unreadCount: 0 } : c))
      )
      setDeptChannels((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, unreadCount: 0 } : c))
      )
    }
    onClose()
  }

  // Create Channel Handler
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
        await loadSidebarData()
        handleSelectChat({
          type: res.channel.type,
          id: res.channel.slug,
          name: res.channel.slug,
          label: res.channel.name,
        })
      }
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to create group')
    } finally {
      setCreatingGroup(false)
    }
  }

  // Add Member Handler
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
        await loadSidebarData()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member')
    } finally {
      setManagingMembers(false)
    }
  }

  // Remove Member Handler
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
        await loadSidebarData()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member')
    } finally {
      setManagingMembers(false)
    }
  }

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <>
      {/* Mobile background overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        style={{
          background: isDark
            ? '#0b101d'
            : 'linear-gradient(180deg, #c0392b 0%, #922b21 60%, #7b241c 100%)',
          borderRight: isDark ? '1px solid #1e293b' : '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '260px',
        }}
        className={`fixed lg:static top-0 left-0 z-50 shrink-0 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header: Back Button & Branding */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <button
            onClick={() => navigate(backPath)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '12px',
              fontWeight: 700,
              color: '#fff',
              padding: 0,
            }}
          >
            <ChevronLeft size={14} /> Back to Dashboard
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    background: '#fff',
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                  }}
                />
                <h2
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#fff',
                    margin: 0,
                    letterSpacing: '0.03em',
                  }}
                >
                  TravelZync Chat
                </h2>
              </div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', margin: '2px 0 0 0' }}>
                Real-Time Enterprise Hub
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                title="Create Group or Channel"
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Plus size={13} />
                <span>Group</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div
          style={{ flex: 1, overflowY: 'auto', padding: '16px 8px' }}
          className="hide-scroll"
        >
          {/* 1. PUBLIC CHANNELS */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 8px',
                marginBottom: '6px',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.6)',
                  letterSpacing: '0.05em',
                }}
              >
                PUBLIC CHANNELS
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {publicChannels.map((channel) => {
                const isSelected =
                  selectedChat?.type === 'public' && selectedChat?.id === channel.id
                return (
                  <div
                    key={channel.id}
                    onClick={() =>
                      handleSelectChat({
                        type: 'public',
                        id: channel.id,
                        name: channel.name,
                        label: channel.label || channel.name,
                      })
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(255,255,255,0.2)' : 'transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <Hash size={14} color={isSelected ? '#fff' : 'rgba(255,255,255,0.7)'} />
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: isSelected ? 700 : 500,
                          color: '#fff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {channel.name}
                      </span>
                    </div>

                    {channel.unreadCount > 0 && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          background: '#fff',
                          color: '#c0392b',
                          borderRadius: '8px',
                          padding: '1px 5px',
                        }}
                      >
                        {channel.unreadCount}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. PRIVATE GROUPS */}
          {privateChannels.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0 8px',
                  marginBottom: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: 'rgba(255,255,255,0.6)',
                    letterSpacing: '0.05em',
                  }}
                >
                  PRIVATE GROUPS ({privateChannels.length})
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {privateChannels.map((group) => {
                  const isSelected =
                    selectedChat?.type === 'private' && selectedChat?.id === group.id
                  return (
                    <div
                      key={group.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: isSelected ? 'rgba(255,255,255,0.2)' : 'transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div
                        onClick={() =>
                          handleSelectChat({
                            type: 'private',
                            id: group.id,
                            name: group.name,
                            label: group.label || group.name,
                          })
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <Lock size={13} color={isSelected ? '#fff' : 'rgba(255,255,255,0.7)'} />
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: isSelected ? 700 : 500,
                            color: '#fff',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {group.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {group.unreadCount > 0 && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              background: '#fff',
                              color: '#c0392b',
                              borderRadius: '8px',
                              padding: '1px 5px',
                            }}
                          >
                            {group.unreadCount}
                          </span>
                        )}

                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveManageChannel(group)
                              setShowManageModal(true)
                            }}
                            title="Manage Group Members"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'rgba(255,255,255,0.6)',
                              padding: 2,
                            }}
                          >
                            <Settings size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 3. DEPARTMENT CHANNELS */}
          {deptChannels.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ padding: '0 8px', marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: 'rgba(255,255,255,0.6)',
                    letterSpacing: '0.05em',
                  }}
                >
                  DEPARTMENT TEAMS
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {deptChannels.map((dept) => {
                  const isSelected =
                    selectedChat?.type === 'department' && selectedChat?.id === dept.id
                  return (
                    <div
                      key={dept.id}
                      onClick={() =>
                        handleSelectChat({
                          type: 'department',
                          id: dept.id,
                          name: dept.name,
                          label: dept.label || dept.name,
                        })
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(255,255,255,0.2)' : 'transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <Users size={14} color={isSelected ? '#fff' : 'rgba(255,255,255,0.7)'} />
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: isSelected ? 700 : 500,
                            color: '#fff',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {dept.name}
                        </span>
                      </div>

                      {dept.unreadCount > 0 && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            background: '#fff',
                            color: '#c0392b',
                            borderRadius: '8px',
                            padding: '1px 5px',
                          }}
                        >
                          {dept.unreadCount}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 4. DIRECT MESSAGES */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 8px',
                marginBottom: '6px',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.6)',
                  letterSpacing: '0.05em',
                }}
              >
                STAFF DIRECT ({dmUsers.length})
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {dmUsers.map((u) => {
                const isSelected =
                  selectedChat?.type === 'direct' && selectedChat?.recipientId === u._id
                const isUserOnline = onlineUserIds.has(u._id.toString())
                const userInitials = u.name
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
                      handleSelectChat({
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
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(255,255,255,0.2)' : 'transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: u.role === 'admin' ? '#fbbf24' : 'rgba(255,255,255,0.25)',
                            color: u.role === 'admin' ? '#78350f' : '#fff',
                            fontSize: '10px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {userInitials}
                        </div>
                        {/* Live Online Presence Dot */}
                        <span
                          style={{
                            position: 'absolute',
                            bottom: -1,
                            right: -1,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: isUserOnline ? '#22c55e' : '#94a3b8',
                            border: '1.5px solid #922b21',
                            boxShadow: isUserOnline ? '0 0 5px #22c55e' : 'none',
                          }}
                        />
                      </div>

                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: isSelected ? 700 : 500,
                          color: '#fff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {u.name}
                      </span>
                    </div>

                    {u.unreadCount > 0 && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          background: '#fff',
                          color: '#c0392b',
                          borderRadius: '8px',
                          padding: '1px 5px',
                          marginLeft: 4,
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

        {/* Footer Profile Box */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#fff',
                color: '#c0392b',
                fontSize: '12px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {initials}
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: '0px',
                right: '0px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#22c55e',
                border: '1.5px solid #c0392b',
              }}
            />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#fff',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentUser?.name || 'User'}
            </p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              {currentUser?.role === 'admin' ? 'Administrator' : 'Online'}
            </p>
          </div>
        </div>
      </aside>

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
                Create New Group or Channel
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
                  Group Name
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. core-operations, dubai-tour-team"
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
                  placeholder="Purpose of this channel..."
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
                      name="groupType"
                      checked={newGroupType === 'public'}
                      onChange={() => setNewGroupType('public')}
                    />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Public</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>Visible to all staff</div>
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
                      name="groupType"
                      checked={newGroupType === 'private'}
                      onChange={() => setNewGroupType('private')}
                    />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Private</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>Members only</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Members selector for Private Group */}
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

      {/* MANAGE GROUP MEMBERS MODAL (ADMIN ONLY) */}
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
                  Private Team Channel
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
                CURRENT MEMBERS ({activeManageChannel.members?.length || 0})
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
    </>
  )
}
