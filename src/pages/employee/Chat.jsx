import { useState, useRef, useEffect, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Paperclip, Smile, Search, Phone, Users, ShieldAlert, Check } from 'lucide-react'

// Initial seed channels data
const INITIAL_MESSAGES = {
  'channel-test2': [
    { id: 1, date: 'Today', sender: 'Travelzync', avatar: 'TZ', text: 'Hey team, please share your project updates in this channel.', time: '10:15 AM', isHighlight: false }
  ],
  'channel-gig': [
    { id: 1, date: 'Today', sender: 'Travelzync', avatar: 'TZ', text: 'This is the GIG project channel.', time: '10:00 AM', isHighlight: false }
  ],
  'channel-test-channel': [
    { id: 1, date: 'Yesterday', sender: 'Faisal', avatar: 'F', text: 'Hello! Setting up the testing channel.', time: '04:12 PM', isHighlight: false }
  ],
  'channel-ttt': [
    { id: 1, date: 'Yesterday', sender: 'Neha', avatar: 'N', text: 'Welcome to TTT channel!', time: '01:15 PM', isHighlight: false }
  ],
  'dm-neha': [
    { id: 1, date: 'Today', sender: 'Neha', avatar: 'N', text: 'Hey Adhil, did you finish the leave module API?', time: '09:30 AM', isHighlight: false }
  ],
  'dm-faisal': [
    { id: 1, date: 'Yesterday', sender: 'Faisal', avatar: 'F', text: 'Can you look into the task card styles?', time: '06:45 PM', isHighlight: false }
  ]
}

export default function Chat() {
  // Read state and context from EmployeeLayout
  const { selectedChatId, setSidebarOpen } = useOutletContext()
  
  // Track messages local state in memory
  const [messagesMap, setMessagesMap] = useState(INITIAL_MESSAGES)
  const [inputMessage, setInputMessage] = useState('')

  const chatEndRef = useRef(null)

  // Retrieve messages for selected chat
  const activeMessages = useMemo(() => {
    return messagesMap[selectedChatId] || []
  }, [messagesMap, selectedChatId])

  // Scroll to bottom helper
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Scroll on selection change or new message
  useEffect(() => {
    scrollToBottom()
  }, [selectedChatId, activeMessages])

  // Get display metadata for the active selection
  const chatMeta = useMemo(() => {
    const isChannel = selectedChatId.startsWith('channel-')
    if (isChannel) {
      const name = selectedChatId.replace('channel-', '')
      return {
        title: `# ${name} - Travelzync Coordination`,
        subtitle: `${name} channel (2 members)`,
        placeholder: `Message #${name} (Type @ to mention for Travelzync team)`
      }
    } else {
      const name = selectedChatId === 'dm-neha' ? 'Neha' : 'Faisal'
      return {
        title: `@ ${name}`,
        subtitle: `Direct Message with ${name}`,
        placeholder: `Message @${name}...`
      }
    }
  }, [selectedChatId])

  // Handle message sending
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`

    const newMsg = {
      id: Date.now(),
      date: 'Today',
      sender: 'Adhil',
      avatar: 'A',
      text: inputMessage,
      time: formattedTime,
      isHighlight: false,
      isOutgoing: true
    }

    // Append to selected channel array
    setMessagesMap(prev => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), newMsg]
    }))

    setInputMessage('')
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#fff',
      flex: 1
    }} className="chat-main-container">
      {/* A. Top Chat Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        zIndex: 10
      }} className="chat-top-header">
        <div>
          {/* Mobile hamburger menu toggle */}
          <button 
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 8px 0 0',
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: '#334155'
            }}
            className="lg:hidden"
          >
            ☰
          </button>
          
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            {chatMeta.title}
          </h2>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
            {chatMeta.subtitle}
          </p>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b' }}>
          <Search size={16} style={{ cursor: 'pointer' }} />
          <Users size={16} style={{ cursor: 'pointer' }} />
          <Phone size={16} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* B. Scrollable Messages Feed Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        background: '#f8fafc', // Light-themed grid backdrop
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }} className="chat-feed-area hide-scroll">
        
        {/* Render group of messages grouped by Date */}
        {(() => {
          let lastDate = ''
          return activeMessages.map((msg, index) => {
            const showDateDivider = msg.date !== lastDate
            lastDate = msg.date

            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Date Divider line */}
                {showDateDivider && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '12px 0',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '1px',
                      background: '#e2e8f0',
                      zIndex: 1
                    }} />
                    <span style={{
                      background: '#f8fafc',
                      padding: '2px 12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#94a3b8',
                      position: 'relative',
                      zIndex: 2
                    }} className="chat-date-pill">
                      {msg.date}
                    </span>
                  </div>
                )}

                {/* Message Group row */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  justifyContent: msg.isOutgoing ? 'flex-end' : 'flex-start'
                }}>
                  {/* Sender Avatar Circle */}
                  {!msg.isOutgoing && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: msg.isHighlight ? '#fff5f5' : '#e2e8f0',
                      border: msg.isHighlight ? '1px solid #fee2e2' : 'none',
                      color: msg.isHighlight ? '#c0392b' : '#475569',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {msg.avatar}
                    </div>
                  )}

                  {/* Message Bubble box */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.isOutgoing ? 'flex-end' : 'flex-start',
                    maxWidth: '75%'
                  }}>
                    {/* Sender Info Row */}
                    {!msg.isOutgoing && (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{msg.sender}</span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{msg.time}</span>
                      </div>
                    )}

                    {/* Action marker if status check */}
                    {msg.isAction && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16a34a', fontWeight: 600, marginBottom: '4px' }}>
                        <Check size={12} /> {msg.sender} {msg.text}
                      </div>
                    )}

                    {/* Text Bubble */}
                    {!msg.isAction && (
                      <div 
                        className={msg.isOutgoing ? 'chat-bubble-outgoing' : 'chat-bubble-incoming'}
                        style={{
                          background: msg.isOutgoing 
                            ? '#fee2e2' // Light pink-red bubble for your messages
                            : msg.isHighlight 
                              ? '#fff5f5' // Highlighted test comments
                              : '#fff', // Standard white bubbles
                          color: msg.isOutgoing 
                            ? '#991b1b' 
                            : msg.isHighlight 
                              ? '#c0392b' 
                              : '#1e293b',
                          border: msg.isOutgoing
                            ? '1px solid #fecaca'
                            : msg.isHighlight
                              ? '1px solid #fecaca'
                              : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          fontSize: '12px',
                          lineHeight: 1.5,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}
                      >
                        {msg.text}
                      </div>
                    )}

                    {/* Time indicator for outgoing */}
                    {msg.isOutgoing && (
                      <span style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>{msg.time}</span>
                    )}
                  </div>
                </div>

              </div>
            )
          })
        })()}

        {/* Scroll Anchor */}
        <div ref={chatEndRef} />
      </div>

      {/* C. Bottom Message Input Bar */}
      <form 
        onSubmit={handleSendMessage}
        className="chat-bottom-bar"
        style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#fff',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}
      >
        {/* Attach File trigger */}
        <button 
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <Paperclip size={18} />
        </button>

        {/* Main Text Input */}
        <div 
          className="chat-input-wrapper"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '8px 16px',
            gap: '8px'
          }}
        >
          <input 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={chatMeta.placeholder}
            className="chat-input-field"
            style={{
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: '13px',
              color: '#334155',
              width: '100%'
            }}
          />
          <Smile size={18} color="#64748b" style={{ cursor: 'pointer' }} />
        </div>

        {/* Submit Send Button */}
        <button 
          type="submit"
          className="chat-send-btn"
          style={{
            background: '#c0392b',
            color: '#fff',
            border: 'none',
            borderRadius: '24px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'background 0.2s ease'
          }}
        >
          Send
        </button>
      </form>
    </div>
  )
}
