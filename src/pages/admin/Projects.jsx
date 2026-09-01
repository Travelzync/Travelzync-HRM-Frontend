import { useState, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  Eye, 
  X, 
  Calendar, 
  Folder,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit,
  ClipboardList
} from 'lucide-react'

const INITIAL_PROJECTS = [
  { id: '01', name: 'TravelZync Frontend System', code: 'TZ-SYS-001', department: 'Development', start: '12 Sep 2026', due: '15 Dec 2026', status: 'Active', priority: 'High', description: 'Complete frontend migrations, layouts, routing, and design integration.', members: ['AS', 'AN'], tasksCount: 3, completedTasks: 1, inProgressTasks: 1, toDoTasks: 1 },
  { id: '02', name: 'HR Guidelines Documentation', code: 'TZ-DOC-002', department: 'HR', start: '18 Sep 2026', due: '30 Nov 2026', status: 'In Progress', priority: 'Medium', description: 'Employee onboarding handbook, validation procedures and policies.', members: ['RA'], tasksCount: 2, completedTasks: 0, inProgressTasks: 1, toDoTasks: 1 },
  { id: '03', name: 'Brand Colors Palette Test', code: 'TZ-DSN-003', department: 'Design', start: '24 Sep 2026', due: '25 Oct 2026', status: 'Completed', priority: 'Low', description: 'Reviewing frontend brand palette and design elements.', members: ['AN', 'AS'], tasksCount: 4, completedTasks: 4, inProgressTasks: 0, toDoTasks: 0 }
]

export default function Projects() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('All Departments')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [priorityFilter, setPriorityFilter] = useState('All Priority')
  const [selectedProjectId, setSelectedProjectId] = useState(null)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDept, setNewDept] = useState('Development')
  const [newDesc, setNewDesc] = useState('')
  const [newPriority, setNewPriority] = useState('Medium')
  const [newStatus, setNewStatus] = useState('In Progress')

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId)
  }, [projects, selectedProjectId])

  const handleAddProject = (e) => {
    e.preventDefault()
    if (!newName.trim()) return

    const newId = String(projects.length + 1).padStart(2, '0')
    const codeNum = `00${projects.length + 1}`.slice(-3)
    const newEntry = {
      id: newId,
      name: newName,
      code: `TZ-PRO-${codeNum}`,
      department: newDept,
      start: '28 Aug 2026',
      due: '31 Mar 2027',
      status: newStatus,
      priority: newPriority,
      description: newDesc,
      members: ['AS', 'AN'],
      tasksCount: 10,
      completedTasks: 0,
      inProgressTasks: 0,
      toDoTasks: 10
    }

    setProjects(prev => [...prev, newEntry])
    setIsAddModalOpen(false)
    setNewName('')
    setNewDesc('')
  }

  const handleDelete = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const stats = useMemo(() => {
    const total = projects.length
    const active = projects.filter(p => p.status === 'Active').length
    const inProgress = projects.filter(p => p.status === 'In Progress').length
    const onHold = projects.filter(p => p.status === 'On Hold').length
    const completed = projects.filter(p => p.status === 'Completed').length

    return { total, active, inProgress, onHold, completed }
  }, [projects])

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.code.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDept = deptFilter === 'All Departments' || p.department === deptFilter
      const matchesStatus = statusFilter === 'All Status' || p.status === statusFilter
      const matchesPriority = priorityFilter === 'All Priority' || p.priority === priorityFilter

      return matchesSearch && matchesDept && matchesStatus && matchesPriority
    })
  }, [projects, searchQuery, deptFilter, statusFilter, priorityFilter])

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Urgent': return { bg: '#fef2f2', text: '#b91c1c' } // red
      case 'High': return { bg: '#fff7ed', text: '#c2410c' } // orange
      case 'Medium': return { bg: '#fffdeb', text: '#854d0e' } // yellow
      default: return { bg: '#f0fdf4', text: '#16a34a' } // low (green)
    }
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active': return { bg: '#f0fdf4', text: '#15803d' } // green
      case 'Completed': return { bg: '#f0fdf4', text: '#15803d' } // green
      case 'In Progress': return { bg: '#fffdeb', text: '#854d0e' } // yellow
      default: return { bg: '#eff6ff', text: '#1d4ed8' } // On Hold (blue)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '24px', flex: 1, position: 'relative', height: '100%', overflow: 'hidden' }}>
      
      {/* Main Table Content panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }} className="hide-scroll">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Project Management</h1>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', margin: 0 }}>Manage all organization projects and track progress</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: '#c0392b',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} /> Create Project
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(192, 57, 43, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
              <Folder size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.total}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Total Projects</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
              <Folder size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.active}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Active Projects</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}>
              <Folder size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.inProgress}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>In Progress</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <Folder size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.onHold}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>On Hold</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
              <Folder size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.completed}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Completed</p>
            </div>
          </div>

        </div>

        {/* Filters Row */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
            gap: '8px',
            width: '260px'
          }}>
            <Search size={16} color="#94a3b8" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or code..."
              style={{
                border: 'none',
                background: 'none',
                outline: 'none',
                fontSize: '13px',
                color: '#334155',
                width: '100%',
                fontWeight: 500
              }}
            />
          </div>

          {/* Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                color: '#475569',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All Departments">All Departments</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                color: '#475569',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                color: '#475569',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All Priority">All Priority</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('')
                setDeptFilter('All Departments')
                setStatusFilter('All Status')
                setPriorityFilter('All Priority')
              }}
              style={{
                background: '#c0392b',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Filter size={14} /> Clear Filter
            </button>
          </div>
        </div>

        {/* Projects Table */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
            <thead>
              <tr style={{ background: '#c0392b', color: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>#</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Project Name</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Project Code</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Department</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Start Date</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Due Date</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Priority</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Members</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((p) => {
                  const statusStyle = getStatusStyle(p.status)
                  const priorityStyle = getPriorityStyle(p.priority)
                  const isSelected = selectedProjectId === p.id
                  return (
                    <tr 
                      key={p.id}
                      onClick={() => setSelectedProjectId(isSelected ? null : p.id)}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: isSelected ? '#f8fafc' : 'transparent' }}
                      className="hover:bg-slate-50"
                    >
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{p.id}</td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#1e293b', fontWeight: 700, maxWidth: '220px' }}>{p.name}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: 'rgba(192, 57, 43, 0.05)', color: '#c0392b',
                          fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px'
                        }}>{p.code}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{p.department}</td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{p.start}</td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{p.due}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: statusStyle.bg, color: statusStyle.text,
                          fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px'
                        }}>{p.status}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: priorityStyle.bg, color: priorityStyle.text,
                          fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px'
                        }}>{p.priority}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {p.members.slice(0, 3).map((m, idx) => (
                            <div key={idx} style={{
                              width: '24px', height: '24px', borderRadius: '50%',
                              background: '#eff6ff', color: '#1d4ed8', fontSize: '9px', fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: '1.5px solid #fff', marginLeft: idx > 0 ? '-6px' : 0
                            }}>{m}</div>
                          ))}
                          {p.members.length > 3 && (
                            <div style={{
                              width: '24px', height: '24px', borderRadius: '50%',
                              background: '#f1f5f9', color: '#475569', fontSize: '9px', fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: '1.5px solid #fff', marginLeft: '-6px'
                            }}>+{p.members.length - 3}</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button 
                            onClick={() => setSelectedProjectId(p.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                          >
                            <Eye size={15} />
                          </button>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                            <Edit size={15} />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="10" style={{ padding: '48px 18px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    No projects found matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination summary row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Showing 1 to {filteredProjects.length} of {projects.length} projects</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '6px', padding: '6px', cursor: 'not-allowed', color: '#cbd5e1' }}>
              <ChevronLeft size={16} />
            </button>
            <button style={{ minWidth: '32px', height: '32px', borderRadius: '6px', border: 'none', background: '#c0392b', color: '#fff', fontWeight: 600, fontSize: '12px' }}>
              1
            </button>
            <button style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '6px', padding: '6px', cursor: 'not-allowed', color: '#cbd5e1' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* DRAWER CONTAINER: Slides in from the right if selectedProject is not null */}
      {selectedProject && (
        <div style={{
          width: '320px',
          background: '#fff',
          borderLeft: '1px solid #e2e8f0',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '-2px 0 12px rgba(0,0,0,0.03)',
          overflowY: 'auto'
        }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Project Details</h3>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', margin: 0 }}>{selectedProject.code}</p>
            </div>
            <button 
              onClick={() => setSelectedProjectId(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Profile/Status */}
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{selectedProject.name}</span>
            </div>
            <span style={{
              background: getStatusStyle(selectedProject.status).bg, color: getStatusStyle(selectedProject.status).text,
              fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px'
            }}>{selectedProject.status}</span>
          </div>

          {/* Details list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Department</span>
              <span style={{ fontWeight: 600, color: '#334155' }}>{selectedProject.department}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Priority</span>
              <span style={{ fontWeight: 700, color: getPriorityStyle(selectedProject.priority).text }}>{selectedProject.priority}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Start Date</span>
              <span style={{ fontWeight: 600, color: '#334155' }}>{selectedProject.start}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Due Date</span>
              <span style={{ fontWeight: 600, color: '#334155' }}>{selectedProject.due}</span>
            </div>

            <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

            <div>
              <p style={{ color: '#64748b', fontWeight: 600, margin: '0 0 4px' }}>Description</p>
              <p style={{ color: '#334155', lineHeight: 1.4, margin: 0 }}>{selectedProject.description}</p>
            </div>
          </div>

          {/* Members */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>Members (12)</span>
              <a href="#" style={{ fontSize: '11px', color: '#c0392b', fontWeight: 600, textDecoration: 'none' }}>View All</a>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {selectedProject.members.map((m, idx) => (
                <div key={idx} style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: '#eff6ff', color: '#1d4ed8', fontSize: '10px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid #cbd5e1'
                }}>{m}</div>
              ))}
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#f1f5f9', color: '#475569', fontSize: '10px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid #cbd5e1'
              }}>+7</div>
            </div>
          </div>

          {/* Tasks status */}
          <div>
            <p style={{ color: '#64748b', fontWeight: 700, fontSize: '12px', margin: '0 0 10px', textTransform: 'uppercase' }}>Tasks Status</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 2px' }}>Total Tasks</p>
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{selectedProject.tasksCount}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 2px' }}>Completed</p>
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#22c55e', margin: 0 }}>{selectedProject.completedTasks}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 2px' }}>In Progress</p>
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#eab308', margin: 0 }}>{selectedProject.inProgressTasks}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 2px' }}>To Do</p>
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb', margin: 0 }}>{selectedProject.toDoTasks}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <button
              style={{
                width: '100%', background: '#fff', border: '1px solid #c0392b', color: '#c0392b', borderRadius: '6px',
                padding: '8px 12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
              }}
            >
              View Full Details
            </button>
            <button
              onClick={() => setSelectedProjectId(null)}
              style={{
                width: '100%', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px',
                padding: '8px 12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>

        </div>
      )}

      {/* Create Project Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '440px', position: 'relative' }}>
            <button onClick={() => setIsAddModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Create Project</h3>
            <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Project Name</label>
                <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. API Integration" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Department</label>
                <select value={newDept} onChange={e => setNewDept(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Description</label>
                <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Short scope summary..." style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Priority</label>
                  <select value={newPriority} onChange={e => setNewPriority(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                    <option value="Active">Active</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>
              <button type="submit" style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginTop: '6px' }}>
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
