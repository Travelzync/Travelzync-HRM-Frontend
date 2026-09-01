import { useState, useMemo } from 'react'
import { 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Users, 
  Building2, 
  CheckCircle2, 
  Eye, 
  Edit, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const INITIAL_DEPARTMENTS = [
  { id: '01', name: 'Development', description: 'Handles product development and technical operations', manager: { name: 'Ashfak', avatar: 'AS' }, employees: 2, status: 'Active' },
  { id: '02', name: 'Design', description: 'Responsible for UI/UX design and creative solutions', manager: { name: 'Ansar', avatar: 'AN' }, employees: 1, status: 'Active' },
  { id: '03', name: 'Human Resources', description: 'Manages recruitment, employee relations and HR policies', manager: { name: 'Rabah', avatar: 'RA' }, employees: 1, status: 'Active' }
]

export default function Departments() {
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newManager, setNewManager] = useState('Ashfak')
  const [newStatus, setNewStatus] = useState('Active')

  const handleAddDept = (e) => {
     e.preventDefault()
     if (!newName.trim()) return

     const newId = String(departments.length + 1).padStart(2, '0')
     const initials = newManager.split(' ').map(n => n[0]).join('')

     const newEntry = {
       id: newId,
       name: newName,
       description: newDesc,
       manager: { name: newManager, avatar: initials },
       employees: 0,
       status: newStatus
     }

     setDepartments(prev => [...prev, newEntry])
     setIsAddModalOpen(false)
     setNewName('')
     setNewDesc('')
  }

  const handleDelete = (id) => {
    setDepartments(prev => prev.filter(d => d.id !== id))
  }

  const stats = useMemo(() => {
    const totalDept = departments.length
    const totalEmp = departments.reduce((sum, d) => sum + d.employees, 0)
    const active = departments.filter(d => d.status === 'Active').length
    const inactive = departments.filter(d => d.status === 'Inactive').length

    return { totalDept, totalEmp, active, inactive }
  }, [departments])

  const filteredDepartments = useMemo(() => {
    return departments.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            d.manager.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'All Status' || d.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [departments, searchQuery, statusFilter])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Department Management</h1>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', margin: 0 }}>Manage all departments and team structures</p>
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
          <Plus size={16} /> Add Department
        </button>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Stat 1: Total Departments */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(192, 57, 43, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
            <Building2 size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.totalDept}</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Total Departments</p>
          </div>
        </div>

        {/* Stat 2: Total Employees */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
            <Users size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.totalEmp}</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Total Employees</p>
          </div>
        </div>

        {/* Stat 3: Active Departments */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.active}</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Active Departments</p>
          </div>
        </div>

        {/* Stat 4: Inactive Departments */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}>
            <X size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.inactive}</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Inactive Departments</p>
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
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search departments..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('All Status')
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

      {/* Departments Table */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ background: '#c0392b', color: '#fff', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>#</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Department Name</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Description</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Head of Department</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Employees</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover:bg-slate-50">
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{d.id}</td>
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#1e293b', fontWeight: 700 }}>{d.name}</td>
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', fontWeight: 500, maxWidth: '260px' }}>{d.description}</td>
                  
                  {/* Manager Avatar + Name */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {d.manager.avatar}
                      </div>
                      <span style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>{d.manager.name}</span>
                    </div>
                  </td>

                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>{d.employees}</td>
                  
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      background: d.status === 'Active' ? '#f0fdf4' : '#fef2f2',
                      color: d.status === 'Active' ? '#15803d' : '#b91c1c',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}>
                      {d.status}
                    </span>
                  </td>
                  
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}><Eye size={15} /></button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}><Edit size={15} /></button>
                      <button 
                        onClick={() => handleDelete(d.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ padding: '48px 18px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No departments found matching filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination summary row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Showing 1 to {filteredDepartments.length} of {departments.length} departments</span>
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '440px', position: 'relative' }}>
            <button onClick={() => setIsAddModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Add Department</h3>
            <form onSubmit={handleAddDept} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Department Name</label>
                <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Sales Division" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Description</label>
                <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Core goals and tasks of this team..." style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Department Manager</label>
                <select value={newManager} onChange={e => setNewManager(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                  <option value="Ashfak">Ashfak</option>
                  <option value="Ansar">Ansar</option>
                  <option value="Rabah">Rabah</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginTop: '6px' }}>
                Save Department
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
