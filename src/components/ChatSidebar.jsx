import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus, Hash } from 'lucide-react'

// Mock lists of channels and users to chat with
export const CHANNELS_DATA = [
  { id: 'channel-test2', name: 'test2' },
  { id: 'channel-gig', name: 'gig' },
  { id: 'channel-test-channel', name: 'test-channel' },
  { id: 'channel-ttt', name: 'ttt' }
]

export const DM_DATA = [
  { id: 'dm-neha', name: 'Neha', avatar: 'N' },
  { id: 'dm-faisal', name: 'Faisal', avatar: 'F' }
]

export default function ChatSidebar({ isOpen, onClose, selectedChatId, setSelectedChatId }) {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/employee/overview')
  }

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
          background: 'linear-gradient(180deg, #c0392b 0%, #922b21 60%, #7b241c 100%)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
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
        <div style={{
          padding: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Back Action to return to main dashboard */}
          <button 
            onClick={handleBack}
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
              padding: 0
            }}
          >
            <ChevronLeft size={14} /> Back to Hub
          </button>

          {/* Branding Title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                background: '#fff',
                clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' // simple brand shield polygon
              }} />
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '0.03em' }}>Travelzync</h2>
            </div>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', margin: '2px 0 0 0' }}>Collaboration Hub</p>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 8px' }} className="hide-scroll">
          
          {/* 1. CHANNELS SECTION */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>CHANNELS</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {CHANNELS_DATA.map(channel => {
                const isSelected = selectedChatId === channel.id
                return (
                  <div
                    key={channel.id}
                    onClick={() => {
                      setSelectedChatId(channel.id)
                      onClose()
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(255,255,255,0.15)' : 'transparent',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Hash size={14} color={isSelected ? '#fff' : 'rgba(255,255,255,0.6)'} />
                    <span style={{
                      fontSize: '12px',
                      fontWeight: isSelected ? 700 : 500,
                      color: '#fff'
                    }}>
                      {channel.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. PRIVATE CHANNELS SECTION */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ padding: '0 8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>PRIVATE</span>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0, padding: '0 8px', fontStyle: 'italic' }}>
              No private channels
            </p>
          </div>

          {/* 3. DIRECT MESSAGES SECTION */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>DIRECT MESSAGES</span>
              <Plus size={12} color="rgba(255,255,255,0.6)" style={{ cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {DM_DATA.map(dm => {
                const isSelected = selectedChatId === dm.id
                return (
                  <div
                    key={dm.id}
                    onClick={() => {
                      setSelectedChatId(dm.id)
                      onClose()
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(255,255,255,0.15)' : 'transparent',
                      transition: 'all 0.15s'
                    }}
                  >
                    {/* Circle avatar badge */}
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {dm.avatar}
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: isSelected ? 700 : 500,
                      color: '#fff'
                    }}>
                      {dm.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* Footer Profile Box */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {/* Avatar circle */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#fff',
              color: '#c0392b',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              A
            </div>
            {/* Active online dot */}
            <span style={{
              position: 'absolute',
              bottom: '0px',
              right: '0px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
              border: '1.5px solid #c0392b'
            }} />
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff', margin: 0 }}>Adhil</p>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Active</p>
          </div>
        </div>

      </aside>
    </>
  )
}
