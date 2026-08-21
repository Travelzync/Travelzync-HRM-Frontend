import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Search, Sun, Bell } from 'lucide-react'

// Define the static list of projects matching the design details (Seclob replaced by TravelZync)
export const PROJECTS_DATA = [
  {
    id: 'crm-app',
    name: 'CRM APP (Comparison B/W Mobile View & App)',
    tech: 'Flutter',
    priority: 'high',
    badge: '12',
    color: '#3b82f6', // blue
    status: 'active'
  },
  {
    id: 'travelzync-aura',
    name: 'TravelZync Aura New Design',
    tech: 'React',
    priority: 'high',
    badge: '7',
    color: '#ef4444', // red
    status: 'active'
  },
  {
    id: 'travelzync-jobs',
    name: 'TravelZync Jobs',
    tech: 'React',
    priority: 'high',
    badge: '',
    color: '#10b981', // green
    status: 'pending'
  },
  {
    id: 'malabarkeys',
    name: 'Malabarkeys',
    tech: 'React',
    priority: 'high',
    badge: '',
    color: '#f59e0b', // orange
    status: 'pending'
  },
  {
    id: 'crm-admin-pa',
    name: 'CRM APP(ADMIN PANEL)',
    tech: 'React',
    priority: 'high',
    badge: '1',
    color: '#8b5cf6', // purple
    status: 'pending'
  },
  {
    id: 'crm-admin-panel',
    name: 'CRM ADMIN PANEL',
    tech: 'React',
    priority: 'high',
    badge: '99+',
    color: '#ec4899', // pink
    status: 'active'
  },
  {
    id: 'travelzync-rooms',
    name: 'TravelZync Rooms',
    tech: 'React',
    priority: 'medium',
    badge: '',
    color: '#06b6d4', // cyan
    status: 'on-hold'
  },
  {
    id: 'travelzync-saloon',
    name: 'TravelZync Aura Saloon Management',
    tech: 'React',
    priority: 'high',
    badge: '',
    color: '#14b8a6', // teal
    status: 'pending'
  },
  {
    id: 'crm-performance',
    name: 'CRM PERFORMANCE',
    tech: 'React',
    priority: 'high',
    badge: '3',
    color: '#f43f5e', // rose
    status: 'active'
  },
  {
    id: 'superadmin-crm',
    name: 'SuperAdmin TravelZync Crm',
    tech: 'React',
    priority: 'medium',
    badge: '',
    color: '#6366f1', // indigo
    status: 'pending'
  },
  {
    id: 'walkingoals',
    name: 'Walkingoals',
    tech: 'React',
    priority: 'medium',
    badge: '1',
    color: '#a855f7', // purple
    status: 'active'
  }
]

export default function ProjectsSidebar({ isOpen, onClose, selectedProjectId, setSelectedProjectId }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Calculate dynamic counts for the filter badges
  const counts = useMemo(() => {
    return {
      all: PROJECTS_DATA.length,
      active: PROJECTS_DATA.filter(p => p.status === 'active').length,
      pending: PROJECTS_DATA.filter(p => p.status === 'pending').length,
      onHold: PROJECTS_DATA.filter(p => p.status === 'on-hold').length
    }
  }, [])

  // Filter projects list based on selected status tab and search text
  const filteredProjects = useMemo(() => {
    return PROJECTS_DATA.filter(p => {
      const matchesTab = activeTab === 'all' || p.status === activeTab
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.tech.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesTab && matchesSearch
    })
  }, [activeTab, searchQuery])

  // Navigate back to overview to restore the main EmployeeSidebar
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
        {/* Sidebar Header: Back Button & Icons */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
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
              fontSize: '14px',
              fontWeight: 700,
              color: '#fff',
              padding: '4px 0'
            }}
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            Projects
          </button>

          {/* Quick Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 4 }}>
              <Sun size={15} />
            </button>
            <div style={{ position: 'relative' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 4 }}>
                <Bell size={15} />
              </button>
              <span style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: '#fff',
                color: '#c0392b',
                fontSize: '8px',
                fontWeight: 700,
                borderRadius: '8px',
                padding: '1px 3px',
                lineHeight: 1,
                transform: 'translate(40%, -40%)'
              }}>99+</span>
            </div>
          </div>
        </div>

        {/* Project Search Bar */}
        <div style={{ padding: '12px 14px 8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '6px',
            padding: '6px 10px'
          }}>
            <Search size={13} color="rgba(255,255,255,0.6)" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              style={{
                border: 'none',
                background: 'none',
                outline: 'none',
                fontSize: '12px',
                color: '#fff',
                width: '100%'
              }}
              className="placeholder-white/50"
            />
          </div>
        </div>

        {/* Category Filters Tab (All, Active, Pending, On Hold) */}
        <div style={{ 
          padding: '4px 10px 8px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '4px',
          borderBottom: '1px solid rgba(255,255,255,0.12)'
        }}>
          <button 
            onClick={() => setActiveTab('all')}
            style={{
              background: activeTab === 'all' ? '#fff' : 'rgba(255,255,255,0.1)',
              color: activeTab === 'all' ? '#c0392b' : 'rgba(255,255,255,0.85)',
              border: 'none',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600,
              padding: '4px 8px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            All {counts.all}
          </button>
          <button 
            onClick={() => setActiveTab('active')}
            style={{
              background: activeTab === 'active' ? '#fff' : 'rgba(255,255,255,0.1)',
              color: activeTab === 'active' ? '#c0392b' : 'rgba(255,255,255,0.85)',
              border: 'none',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600,
              padding: '4px 8px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Active {counts.active}
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            style={{
              background: activeTab === 'pending' ? '#fff' : 'rgba(255,255,255,0.1)',
              color: activeTab === 'pending' ? '#c0392b' : 'rgba(255,255,255,0.85)',
              border: 'none',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600,
              padding: '4px 8px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Pending {counts.pending}
          </button>
          <button 
            onClick={() => setActiveTab('on-hold')}
            style={{
              background: activeTab === 'on-hold' ? '#fff' : 'rgba(255,255,255,0.1)',
              color: activeTab === 'on-hold' ? '#c0392b' : 'rgba(255,255,255,0.85)',
              border: 'none',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600,
              padding: '4px 8px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            On Hold {counts.onHold}
          </button>
        </div>

        {/* Scrollable Project List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }} className="hide-scroll">
          {filteredProjects.map((project) => {
            const isSelected = selectedProjectId === project.id
            return (
              <div
                key={project.id}
                onClick={() => {
                  setSelectedProjectId(project.id)
                  onClose()
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '2px',
                  transition: 'all 0.15s',
                  background: isSelected ? '#fff' : 'transparent',
                  border: isSelected ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
                }}
                className={!isSelected ? 'hover:bg-white/6' : ''}
              >
                {/* Colored Icon box */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: project.color,
                  opacity: 0.85,
                  flexShrink: 0
                }} />

                {/* Info Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: isSelected ? '#c0392b' : 'rgba(255,255,255,0.95)',
                    margin: 0,
                    lineHeight: 1.2
                  }} className="truncate">
                    {project.name}
                  </p>
                  <p style={{
                    fontSize: '10px',
                    color: isSelected ? 'rgba(192, 57, 43, 0.7)' : 'rgba(255,255,255,0.6)',
                    margin: '2px 0 0 0'
                  }}>
                    {project.tech} - {project.priority}
                  </p>
                </div>

                {/* Badge Count */}
                {project.badge && (
                  <span style={{
                    background: isSelected ? '#c0392b' : 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 700,
                    borderRadius: '10px',
                    padding: '2px 6px',
                    minWidth: '20px',
                    textAlign: 'center',
                    lineHeight: 1
                  }}>
                    {project.badge}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </aside>
    </>
  )
}
