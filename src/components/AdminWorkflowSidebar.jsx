import { useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, 
  LayoutDashboard, 
  Folder, 
  CheckSquare, 
  Clock, 
  Bug, 
  MessageSquare, 
  Bell 
} from 'lucide-react'

export default function AdminWorkflowSidebar({ isOpen, onClose, activeTab, setActiveTab }) {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/admin/dashboard')
  }

  // Sidebar link details
  const workflowLinks = [
    { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'Projects', label: 'Projects', icon: Folder },
    { id: 'Tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'Time Requests', label: 'Time Requests', icon: Clock },
    { id: 'Bugs', label: 'Bugs', icon: Bug },
    { id: 'Chat', label: 'Chat', icon: MessageSquare },
    { id: 'Notifications', label: 'Notifications', icon: Bell }
  ]

  return (
    <>
      {/* Mobile background overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
          onClick={onClose} 
        />
      )}

      <aside
        style={{
          background: 'linear-gradient(180deg, #c0392b 0%, #922b21 60%, #7b241c 100%)'
        }}
        className={`fixed lg:static top-0 left-0 z-30 w-[220px] h-screen flex flex-col shrink-0 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Header: Back Button & Title */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Back Action */}
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
              padding: 0,
              textAlign: 'left'
            }}
          >
            <ChevronLeft size={14} strokeWidth={2.5} /> Back to Portal
          </button>

          {/* Logo Title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '18px',
                height: '18px',
                border: '2px solid #fff',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <CheckSquare size={10} strokeWidth={3} />
              </div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '0.02em' }}>Workflow</h2>
            </div>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', margin: '2px 0 0 0' }}>Task Management</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }} className="hide-scroll">
          {workflowLinks.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id)
                  onClose()
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  marginBottom: 2,
                  fontSize: 13,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  background: isActive ? '#fff' : 'transparent',
                  color: isActive ? '#c0392b' : 'rgba(255,255,255,0.85)',
                }}
              >
                <Icon size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom profile info card */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255,255,255,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>AD</span>
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, lineHeight: 1, margin: 0 }}>Admin</p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 3, margin: 0 }}>Super Admin</p>
            </div>
          </div>
        </div>

      </aside>
    </>
  )
}
