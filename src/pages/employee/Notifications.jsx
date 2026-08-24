import { useState, useMemo } from 'react'
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Star, 
  Search, 
  Trash2, 
  Calendar, 
  Check, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Clock,
  DollarSign,
  Umbrella,
  FileText
} from 'lucide-react'

// Initial onboarding notifications for a new employee
const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Welcome to the Travelzync Team!',
    category: 'System',
    text: 'Welcome onboard! We are excited to have you with us. Please take a few minutes to explore the workspace and verify your credentials.',
    time: 'Just now',
    read: false,
    important: true,
    severity: 'success', // green accent
    sender: 'HR Department'
  },
  {
    id: 2,
    title: 'Complete Your Employee Profile',
    category: 'Tasks',
    text: 'Please head over to the settings page to complete your employee profile details, including emergency contact information.',
    time: '10 minutes ago',
    read: false,
    important: false,
    severity: 'warning', // orange/yellow accent
    sender: 'HR Operations'
  },
  {
    id: 3,
    title: 'Setup Direct Deposit / Bank Account',
    category: 'Payroll',
    text: 'Remember to submit your bank account details via the payslips or settings panel to ensure your payroll configuration is complete.',
    time: '1 hour ago',
    read: false,
    important: false,
    severity: 'info', // blue/grey accent
    sender: 'Payroll Team'
  }
]

export default function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  // Categories list based on target tabs in screenshot
  const categories = ['All', 'Attendance', 'Leave', 'Payroll', 'Holidays', 'Tasks', 'System']

  // Handle Important star toggling
  const handleToggleImportant = (id) => {
    setNotifications(prev => prev.map(item => 
      item.id === id ? { ...item, important: !item.important } : item
    ))
  }

  // Handle Mark as Read toggling
  const handleToggleRead = (id) => {
    setNotifications(prev => prev.map(item => 
      item.id === id ? { ...item, read: !item.read } : item
    ))
  }

  // Handle Delete/Dismiss item
  const handleDeleteNotification = (id) => {
    setNotifications(prev => prev.filter(item => item.id !== id))
    // Reset page to 1 if we empty current page
    setCurrentPage(1)
  }

  // Clear all notifications
  const handleClearAll = () => {
    setNotifications([])
    setCurrentPage(1)
  }

  // Reset/Restore notifications
  const handleResetNotifications = () => {
    setNotifications(INITIAL_NOTIFICATIONS)
    setCurrentPage(1)
    setSearchQuery('')
    setActiveTab('All')
  }

  // Compute stats dynamically
  const stats = useMemo(() => {
    const total = notifications.length
    const unread = notifications.filter(n => !n.read).length
    const read = notifications.filter(n => n.read).length
    const important = notifications.filter(n => n.important).length
    
    // Response rate calculations
    const responseRate = total > 0 ? Math.round((read / total) * 100) : 100

    return { total, unread, read, important, responseRate }
  }, [notifications])

  // Filter items based on tab & search query
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesTab = activeTab === 'All' || n.category.toLowerCase() === activeTab.toLowerCase()
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            n.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            n.sender.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesTab && matchesSearch
    })
  }, [notifications, activeTab, searchQuery])

  // Pagination calculation
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage) || 1
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredNotifications.slice(start, start + itemsPerPage)
  }, [filteredNotifications, currentPage])

  // Helper to fetch colors depending on severity/type
  const getSeverityStyles = (severity, isRead) => {
    if (isRead) {
      return {
        border: '1px solid #e2e8f0',
        background: '#fff',
        glow: 'rgba(0,0,0,0.02)',
        iconColor: '#94a3b8',
        tagBg: '#f1f5f9',
        tagText: '#64748b'
      }
    }
    switch (severity) {
      case 'error':
        return {
          border: '1px solid #fecaca',
          background: '#fff8f8',
          glow: 'rgba(239, 68, 68, 0.05)',
          iconColor: '#ef4444',
          tagBg: '#fee2e2',
          tagText: '#b91c1c'
        }
      case 'warning':
        return {
          border: '1px solid #fef08a',
          background: '#fefdf0',
          glow: 'rgba(234, 179, 8, 0.05)',
          iconColor: '#eab308',
          tagBg: '#fef9c3',
          tagText: '#854d0e'
        }
      case 'success':
        return {
          border: '1px solid #bbf7d0',
          background: '#f8fff9',
          glow: 'rgba(34, 197, 94, 0.05)',
          iconColor: '#22c55e',
          tagBg: '#dcfce7',
          tagText: '#15803d'
        }
      default:
        return {
          border: '1px solid #e2e8f0',
          background: '#fff',
          glow: 'rgba(0,0,0,0.02)',
          iconColor: '#3b82f6',
          tagBg: '#dbeafe',
          tagText: '#1d4ed8'
        }
    }
  }

  // Get icon depending on category
  const getCategoryIcon = (category, style) => {
    switch (category) {
      case 'Attendance':
        return <Clock {...style} />
      case 'Leave':
        return <Calendar {...style} />
      case 'Payroll':
        return <DollarSign {...style} />
      case 'Holidays':
        return <Umbrella {...style} />
      case 'Tasks':
        return <CheckCircle2 {...style} />
      default:
        return <ShieldAlert {...style} />
    }
  }

  // Helper for generating page numbers
  const pageNumbers = []
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #c0392b 0%, #922b21 60%, #7b241c 100%)',
        borderRadius: '16px',
        padding: '24px 32px',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 15px rgba(123, 36, 28, 0.15)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={24} style={{ color: 'rgba(255,255,255,0.85)' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Notification Center</h1>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '4px', fontWeight: 500 }}>
            Stay updated with all your corporate alerts, tasks, and system announcements
          </p>
        </div>
        {stats.total > 0 && (
          <button
            onClick={handleClearAll}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          >
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      {/* 2. Statistics Overview Widget Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* Total Widget */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(192, 57, 43, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c0392b'
          }}>
            <Bell size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.total}</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Total Alerts</p>
          </div>
        </div>

        {/* Unread Widget */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(249, 115, 22, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f97316'
          }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.unread}</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Unread Alerts</p>
          </div>
        </div>

        {/* Read Widget */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(34, 197, 94, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22c55e'
          }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.read}</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Read Alerts</p>
          </div>
        </div>

        {/* Important Widget */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(234, 179, 8, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#eab308'
          }}>
            <Star size={20} fill={stats.important > 0 ? '#eab308' : 'none'} />
          </div>
          <div>
            <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.important}</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Important</p>
          </div>
        </div>
      </div>

      {/* 3. Main Split Dashboard Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2.5fr 1.2fr',
        gap: '24px'
      }} className="responsive-double-grid">
        
        {/* LEFT COLUMN: Search, Filter Tabs, Notifications List, Pagination */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Filters Bar: Search & Category Tabs */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Search Input Box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 14px',
              gap: '10px'
            }}>
              <Search size={18} style={{ color: '#94a3b8' }} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset page on filter changes
                }}
                placeholder="Search notifications by title, content or sender..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#334155',
                  width: '100%',
                  fontWeight: 500
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Scrollable Category Filter Tabs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px'
            }} className="hide-scroll">
              {categories.map(tab => {
                const isActive = activeTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab)
                      setCurrentPage(1) // Reset page
                    }}
                    style={{
                      background: isActive ? '#c0392b' : '#f8fafc',
                      color: isActive ? '#fff' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s'
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = '#e2e8f0'
                        e.currentTarget.style.color = '#334155'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = '#f8fafc'
                        e.currentTarget.style.color = '#64748b'
                      }
                    }}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>
          </div>

          {/* List of Notification cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paginatedNotifications.length > 0 ? (
              paginatedNotifications.map((notif) => {
                const styles = getSeverityStyles(notif.severity, notif.read)
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleToggleRead(notif.id)}
                    style={{
                      background: styles.background,
                      border: styles.border,
                      borderRadius: '12px',
                      padding: '18px 20px',
                      boxShadow: `0 2px 5px ${styles.glow}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      transition: 'all 0.2s',
                      position: 'relative',
                      opacity: notif.read ? 0.75 : 1
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.04)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = `0 2px 5px ${styles.glow}`
                    }}
                  >
                    {/* Category specific indicator badge icon */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: styles.tagBg,
                      color: styles.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getCategoryIcon(notif.category, { size: 18 })}
                    </div>

                    {/* Content text section */}
                    <div style={{ flex: 1, marginRight: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: styles.tagBg, color: styles.tagText }}>
                          {notif.category}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                          {notif.time}
                        </span>
                        {!notif.read && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c0392b' }} />
                        )}
                      </div>

                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: notif.read ? '#64748b' : '#1e293b',
                        marginTop: '8px',
                        marginBottom: '4px'
                      }}>
                        {notif.title}
                      </h3>
                      <p style={{
                        fontSize: '13px',
                        color: notif.read ? '#94a3b8' : '#475569',
                        lineHeight: 1.5,
                        margin: 0
                      }}>
                        {notif.text}
                      </p>
                      
                      {/* Sender sign-off */}
                      <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: notif.read ? '#94a3b8' : '#64748b', marginTop: '6px' }}>
                        By {notif.sender}
                      </span>
                    </div>

                    {/* Actions panel: Star & Trash */}
                    <div 
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onClick={(e) => e.stopPropagation()} // Stop bubbling so click doesn't trigger read toggle
                    >
                      {/* Star Important toggle */}
                      <button
                        onClick={() => handleToggleImportant(notif.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: notif.important ? '#eab308' : '#94a3b8',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <Star size={16} fill={notif.important ? '#eab308' : 'none'} />
                      </button>

                      {/* Delete notification */}
                      <button
                        onClick={() => handleDeleteNotification(notif.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94a3b8',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = '#fee2e2'
                          e.currentTarget.style.color = '#ef4444'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'none'
                          e.currentTarget.style.color = '#94a3b8'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                )
              })
            ) : (
              // Empty State Illustration card
              <div style={{
                background: '#fff',
                border: '1px dashed #cbd5e1',
                borderRadius: '16px',
                padding: '48px 24px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#94a3b8'
                }}>
                  <Bell size={28} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#334155', margin: '0 0 4px' }}>All Caught Up!</h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>
                  There are no notifications matching your filters.
                </p>
                <button
                  onClick={handleResetNotifications}
                  style={{
                    background: '#c0392b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(192, 57, 43, 0.2)',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#922b21'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#c0392b'}
                >
                  Reload Notifications
                </button>
              </div>
            )}
          </div>

          {/* Pagination controls matching design structure */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px'
            }}>
              {/* Previous page */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  color: currentPage === 1 ? '#cbd5e1' : '#64748b',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Number tabs */}
              {pageNumbers.map(page => {
                const isSelected = currentPage === page
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      minWidth: '34px',
                      height: '34px',
                      borderRadius: '6px',
                      border: isSelected ? 'none' : '1px solid #e2e8f0',
                      background: isSelected ? '#c0392b' : '#fff',
                      color: isSelected ? '#fff' : '#64748b',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    {page}
                  </button>
                )
              })}

              {/* Next page */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  color: currentPage === totalPages ? '#cbd5e1' : '#64748b',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Recent Activity, Important Alerts list, Analytical summary card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 1: Recent Activity Timeline */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', margin: '0 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Recent Activity
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '20px' }}>
              {/* Vertical line connecting logs */}
              <div style={{ position: 'absolute', left: '6px', top: '4px', bottom: '4px', width: '1px', background: '#e2e8f0' }} />

              {notifications.slice(0, 4).map((notif) => (
                <div key={notif.id} style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {/* Circle dot on line */}
                  <div style={{
                    position: 'absolute',
                    left: '-20px',
                    top: '3px',
                    width: '13px',
                    height: '13px',
                    borderRadius: '50%',
                    background: notif.read ? '#cbd5e1' : '#c0392b',
                    border: '3px solid #fff',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.05)'
                  }} />
                  
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                    {notif.title}
                  </span>
                  <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                    {notif.time}
                  </span>
                </div>
              ))}

              {notifications.length === 0 && (
                <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', paddingLeft: '0px' }}>
                  No recent activity log
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Important Alerts widget list */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', margin: '0 0 12px' }}>
              Important Alerts
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }} className="hide-scroll">
              {notifications.filter(n => n.important).map(notif => (
                <div 
                  key={notif.id} 
                  onClick={() => handleToggleRead(notif.id)}
                  style={{
                    background: '#fff8f8',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c0392b' }}>
                    <AlertTriangle size={12} />
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>{notif.title}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {notif.text}
                  </p>
                </div>
              ))}

              {notifications.filter(n => n.important).length === 0 && (
                <div style={{
                  padding: '20px 10px',
                  textAlign: 'center',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#94a3b8',
                  fontStyle: 'italic'
                }}>
                  No flagged alerts
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Monthly Summary Analytics */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Standard bell background element */}
            <div style={{
              position: 'absolute',
              right: '-10px',
              bottom: '-10px',
              opacity: 0.04,
              color: '#1e293b',
              pointerEvents: 'none'
            }}>
              <Bell size={120} />
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', margin: '0 0 16px' }}>
              This Month
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Total Alerts</span>
                <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 700 }}>{stats.total}</span>
              </div>
              
              <div style={{ height: '1px', background: '#f1f5f9' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Response Rate</span>
                <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 700 }}>{stats.responseRate}%</span>
              </div>
              
              <div style={{ height: '1px', background: '#f1f5f9' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Pending Actions</span>
                <span style={{ fontSize: '13px', color: '#c0392b', fontWeight: 700 }}>{stats.unread}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
