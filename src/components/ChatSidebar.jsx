import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Hash, Users, Lock, ShieldCheck } from 'lucide-react'
import { getChannels, getChatUsers } from '../services/chatService'
import { getCurrentUser } from '../services/authService'
import { useTheme } from '../hooks/useTheme'

export default function ChatSidebar({
  isOpen,
  onClose,
  selectedChat,
  setSelectedChat,
  backPath = '/employee/overview',
}) {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const { isDark } = useTheme()

  const [publicChannels, setPublicChannels] = useState([
    { id: 'general', name: 'general', label: 'General Hub' },
    { id: 'announcements', name: 'announcements', label: 'Announcements' },
    { id: 'travel-deals', name: 'travel-deals', label: 'Travel Deals & Ops' },
  ])
  const [deptChannels, setDeptChannels] = useState([])
  const [dmUsers, setDmUsers] = useState([])

  const loadSidebarData = async () => {
    try {
      const [channelsRes, usersRes] = await Promise.allSettled([
        getChannels(),
        getChatUsers(),
      ])

      if (channelsRes.status === 'fulfilled' && channelsRes.value?.success) {
        setPublicChannels(channelsRes.value.publicChannels || [])
        setDeptChannels(channelsRes.value.departmentChannels || [])
      }

      if (usersRes.status === 'fulfilled' && usersRes.value?.success) {
        setDmUsers(usersRes.value.users || [])
      }
    } catch {
      // fallback
    }
  }

  useEffect(() => {
    loadSidebarData()
    const interval = setInterval(loadSidebarData, 10000)
    return () => clearInterval(interval)
  }, [])

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
          width: '240px',
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
              Enterprise Communication
            </p>
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
                    onClick={() => {
                      setSelectedChat({
                        type: 'public',
                        id: channel.id,
                        name: channel.name,
                        label: channel.label || channel.name,
                      })
                      onClose()
                    }}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Hash size={14} color={isSelected ? '#fff' : 'rgba(255,255,255,0.7)'} />
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: isSelected ? 700 : 500,
                          color: '#fff',
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

          {/* 2. DEPARTMENT CHANNELS */}
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
                      onClick={() => {
                        setSelectedChat({
                          type: 'department',
                          id: dept.id,
                          name: dept.name,
                          label: dept.label || dept.name,
                        })
                        onClose()
                      }}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={14} color={isSelected ? '#fff' : 'rgba(255,255,255,0.7)'} />
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: isSelected ? 700 : 500,
                            color: '#fff',
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

          {/* 3. DIRECT MESSAGES */}
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
                DIRECT MESSAGES ({dmUsers.length})
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {dmUsers.map((u) => {
                const isSelected =
                  selectedChat?.type === 'direct' && selectedChat?.recipientId === u._id
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
                    onClick={() => {
                      setSelectedChat({
                        type: 'direct',
                        recipientId: u._id,
                        name: u.name,
                        role: u.role,
                        department: u.department,
                      })
                      onClose()
                    }}
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
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: u.role === 'admin' ? '#fbbf24' : 'rgba(255,255,255,0.25)',
                          color: u.role === 'admin' ? '#78350f' : '#fff',
                          fontSize: '10px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {userInitials}
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
    </>
  )
}
