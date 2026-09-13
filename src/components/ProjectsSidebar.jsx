import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Search, Sun, Bell } from 'lucide-react'
import { getProjects } from '../services/taskService'

// Define projects matching the exact design screenshot
export const PROJECTS_DATA = [
  {
    id: 'crm-app',
    code: 'CRM-APP',
    name: 'CRM APP (Comparison B/W Mobile View & App)',
    tech: 'Flutter',
    priority: 'high',
    badge: '12',
    color: '#3b82f6', // blue
    status: 'active'
  },
  {
    id: 'travelzync-aura',
    code: 'TZ-AURA',
    name: 'TravelZync Aura New Design',
    tech: 'React',
    priority: 'high',
    badge: '7',
    color: '#ef4444', // red
    status: 'active'
  },
  {
    id: 'travelzync-jobs',
    code: 'TZ-JOBS',
    name: 'TravelZync Jobs',
    tech: 'React',
    priority: 'high',
    badge: '',
    color: '#10b981', // green
    status: 'pending'
  },
  {
    id: 'malabarkeys',
    code: 'MALABAR',
    name: 'Malabarkeys',
    tech: 'React',
    priority: 'high',
    badge: '',
    color: '#f59e0b', // orange
    status: 'pending'
  },
  {
    id: 'crm-admin-pa',
    code: 'CRM-PA',
    name: 'CRM APP(ADMIN PANEL)',
    tech: 'React',
    priority: 'high',
    badge: '1',
    color: '#8b5cf6', // purple
    status: 'pending'
  },
  {
    id: 'crm-admin-panel',
    code: 'CRM-ADM',
    name: 'CRM ADMIN PANEL',
    tech: 'React',
    priority: 'high',
    badge: '99+',
    color: '#ec4899', // pink
    status: 'active'
  },
  {
    id: 'travelzync-rooms',
    code: 'TZ-ROOMS',
    name: 'TravelZync Rooms',
    tech: 'React',
    priority: 'medium',
    badge: '',
    color: '#06b6d4', // cyan
    status: 'on-hold'
  },
  {
    id: 'travelzync-saloon',
    code: 'TZ-SALOON',
    name: 'TravelZync Aura Saloon Management',
    tech: 'React',
    priority: 'high',
    badge: '',
    color: '#14b8a6', // teal
    status: 'pending'
  },
  {
    id: 'crm-performance',
    code: 'CRM-PERF',
    name: 'CRM PERFORMANCE',
    tech: 'React',
    priority: 'high',
    badge: '3',
    color: '#f43f5e', // rose
    status: 'active'
  },
  {
    id: 'superadmin-crm',
    code: 'SUP-CRM',
    name: 'SuperAdmin TravelZync Crm',
    tech: 'React',
    priority: 'medium',
    badge: '',
    color: '#6366f1', // indigo
    status: 'pending'
  },
  {
    id: 'walkingoals',
    code: 'WALKING',
    name: 'Walkingoals',
    tech: 'React',
    priority: 'medium',
    badge: '1',
    color: '#a855f7', // purple
    status: 'active'
  }
]

export default function ProjectsSidebar({ isOpen, onClose, selectedProjectId, setSelectedProjectId, backPath }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [dbProjects, setDbProjects] = useState([])

  // Fetch projects from backend API to sync with database
  useEffect(() => {
    getProjects()
      .then(res => {
        if (res?.projects && Array.isArray(res.projects) && res.projects.length > 0) {
          setDbProjects(res.projects)
        }
      })
      .catch(err => console.warn('Could not fetch backend projects:', err))
  }, [])

  // Merge static project visual configurations with backend IDs if available
  const projectsList = useMemo(() => {
    return PROJECTS_DATA.map(p => {
      const match = dbProjects.find(db => 
        db.projectCode?.toUpperCase() === p.code || 
        db.name?.toLowerCase().includes(p.name.slice(0, 10).toLowerCase())
      )
      return {
        ...p,
        dbId: match?._id || p.id
      }
    })
  }, [dbProjects])

  // Calculate dynamic counts for the filter badges matching screenshot
  const counts = useMemo(() => {
    return {
      all: projectsList.length,
      active: projectsList.filter(p => p.status === 'active').length,
      pending: projectsList.filter(p => p.status === 'pending').length,
      onHold: projectsList.filter(p => p.status === 'on-hold').length
    }
  }, [projectsList])

  // Filter projects list based on selected status tab and search text
  const filteredProjects = useMemo(() => {
    return projectsList.filter(p => {
      const matchesTab = activeTab === 'all' || p.status === activeTab
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.tech.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesTab && matchesSearch
    })
  }, [projectsList, activeTab, searchQuery])

  // Navigate back to overview/dashboard to restore the main sidebar
  const handleBack = () => {
    if (backPath) {
      navigate(backPath)
    } else if (window.location.pathname.startsWith('/admin')) {
      navigate('/admin/dashboard')
    } else {
      navigate('/employee/overview')
    }
  }

  return (
    <>
      {/* Mobile background overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden" 
          onClick={onClose} 
        />
      )}

      <aside 
        style={{
          background: '#090e1c',
          borderRight: '1px solid #172036',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '245px',
        }}
        className={`fixed lg:static top-0 left-0 z-50 shrink-0 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header: Back Button & Icons matching screenshot */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #172036',
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
              color: '#f8fafc',
              padding: '4px 0'
            }}
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            Projects
          </button>

          {/* Quick Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
              <Sun size={15} />
            </button>
            <div style={{ position: 'relative' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
                <Bell size={15} />
              </button>
              <span style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: '#c0392b',
                color: '#fff',
                fontSize: '8px',
                fontWeight: 700,
                borderRadius: '8px',
                padding: '1px 4px',
                lineHeight: 1,
                transform: 'translate(40%, -40%)'
              }}>99+</span>
            </div>
          </div>
        </div>

        {/* Project Search Bar in Dark theme */}
        <div style={{ padding: '12px 14px 8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#111827',
            border: '1px solid #1f293d',
            borderRadius: '6px',
            padding: '6px 10px'
          }}>
            <Search size={13} color="#64748b" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              style={{
                border: 'none',
                background: 'none',
                outline: 'none',
                fontSize: '12px',
                color: '#f8fafc',
                width: '100%'
              }}
              className="placeholder-slate-500"
            />
          </div>
        </div>

        {/* Category Filters Tab (All 11, Active 5, Pending 5, On Hold 1) matching screenshot */}
        <div style={{ 
          padding: '4px 10px 8px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '4px',
          borderBottom: '1px solid #172036'
        }}>
          <button 
            onClick={() => setActiveTab('all')}
            style={{
              background: activeTab === 'all' ? '#1e293b' : '#111827',
              color: activeTab === 'all' ? '#ffffff' : '#94a3b8',
              border: activeTab === 'all' ? '1px solid #334155' : '1px solid transparent',
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
              background: activeTab === 'active' ? '#1e293b' : '#111827',
              color: activeTab === 'active' ? '#ffffff' : '#94a3b8',
              border: activeTab === 'active' ? '1px solid #334155' : '1px solid transparent',
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
              background: activeTab === 'pending' ? '#1e293b' : '#111827',
              color: activeTab === 'pending' ? '#ffffff' : '#94a3b8',
              border: activeTab === 'pending' ? '1px solid #334155' : '1px solid transparent',
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
              background: activeTab === 'on-hold' ? '#1e293b' : '#111827',
              color: activeTab === 'on-hold' ? '#ffffff' : '#94a3b8',
              border: activeTab === 'on-hold' ? '1px solid #334155' : '1px solid transparent',
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

        {/* Scrollable Project List matching screenshot */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }} className="hide-scroll">
          {filteredProjects.map((project) => {
            const isSelected = selectedProjectId === project.id || selectedProjectId === project.code || selectedProjectId === project.dbId
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
                  marginBottom: '3px',
                  transition: 'all 0.15s',
                  background: isSelected ? '#ffffff' : 'transparent',
                  border: isSelected ? '1px solid #ffffff' : '1px solid transparent'
                }}
                className={!isSelected ? 'hover:bg-slate-800/40' : ''}
              >
                {/* Colored Icon box */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: project.color,
                  opacity: 0.95,
                  flexShrink: 0
                }} />

                {/* Info Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isSelected ? '#0f172a' : '#f8fafc',
                    margin: 0,
                    lineHeight: 1.2
                  }} className="truncate">
                    {project.name}
                  </p>
                  <p style={{
                    fontSize: '10px',
                    color: isSelected ? '#64748b' : '#94a3b8',
                    margin: '2px 0 0 0'
                  }}>
                    {project.tech} - {project.priority}
                  </p>
                </div>

                {/* Badge Count */}
                {project.badge && (
                  <span style={{
                    background: isSelected ? '#ef4444' : '#1e293b',
                    color: '#ffffff',
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
