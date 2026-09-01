import { useState, useMemo } from 'react'
import { 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Users, 
  CheckCircle2, 
  Building2, 
  Eye, 
  Edit, 
  ClipboardList, 
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const INITIAL_DESIGNATIONS = [
  { id: '01', name: 'Frontend Developer', department: 'Development', description: 'Responsible for building user interface', employees: 1, status: 'Active' },
  { id: '02', name: 'UI/UX Designer', department: 'Design', description: 'Designs user interfaces and user experience', employees: 1, status: 'Active' },
  { id: '03', name: 'HR Executive', department: 'Human Resources', description: 'Handles HR operations and employee relations', employees: 1, status: 'Active' }
]

export default function Designations() {
  const [designations, setDesignations] = useState(INITIAL_DESIGNATIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('All Departments')
  const [statusFilter, setStatusFilter] = useState('All Status')
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDept, setNewDept] = useState('Development')
  const [newDesc, setNewDesc] = useState('')
  const [newStatus, setNewStatus] = useState('Active')

  const handleAddDesignation = (e) => {
    e.preventDefault()
    if (!newName.trim()) return

    const newId = String(designations.length + 1).padStart(2, '0')
    const newEntry = {
      id: newId,
      name: newName,
      department: newDept,
      description: newDesc,
      employees: 0,
      status: newStatus
    }

    setDesignations(prev => [...prev, newEntry])
    setIsAddModalOpen(false)
    setNewName('')
    setNewDesc('')
  }

  const handleDelete = (id) => {
    setDesignations(prev => prev.filter(d => d.id !== id))
  }

  const stats = useMemo(() => {
    const totalDesg = designations.length
    const totalEmp = designations.reduce((sum, d) => sum + d.employees, 0)
    const active = designations.filter(d => d.status === 'Active').length
    const inactive = designations.filter(d => d.status === 'Inactive').length
    return { totalDesg, totalEmp, active, inactive }
  }, [designations])

  const filteredDesignations = useMemo(() => {
    return designations.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            d.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDept = deptFilter === 'All Departments' || d.department === deptFilter
      const matchesStatus = statusFilter === 'All Status' || d.status === statusFilter

      return matchesSearch && matchesDept && matchesStatus
    })
  }, [designations, searchQuery, deptFilter, statusFilter])

  const uniqueDepartments = ['All Departments', 'Development', 'Design', 'Human Resources', 'QA / Testing', 'Finance', 'Marketing']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Designation Management</h1>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', margin: 0 }}>Manage all designations in the organization</p>
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
          <Plus size={16} /> Add Designation
        </button>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Stat 1: Total Designations */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(192, 57, 43, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
            <ClipboardList size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.totalDesg}</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Total Designations</p>
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

        {/* Stat 3: Active Designations */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.active}</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Active Designations</p>
          </div>
        </div>

        {/* Stat 4: Inactive Designations */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}>
            <X size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.inactive}</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Inactive Designations</p>
          </div>
        </div>

      </div>

      {/* Filter Options Row */}
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
            placeholder="Search designations..."
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
            onChange={(e) => setDeptFilter(e.target.value)}
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
            {uniqueDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>

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
              setDeptFilter('All Departments')
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

      {/* Designations Table */}
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
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Designation Name</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Department</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Description</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Employees</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDesignations.length > 0 ? (
              filteredDesignations.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover:bg-slate-50">
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{d.id}</td>
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#1e293b', fontWeight: 700 }}>{d.name}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      background: 'rgba(192, 57, 43, 0.06)',
                      color: '#c0392b',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      display: 'inline-block'
                    }}>
                      {d.department}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{d.description}</td>
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
                  No designations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (Mock representation) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Showing 1 to {filteredDesignations.length} of {designations.length} designations</span>
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
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Add Designation</h3>
            <form onSubmit={handleAddDesignation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Designation Name</label>
                <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Lead QA Architect" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Department</label>
                <select value={newDept} onChange={e => setNewDept(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="QA / Testing">QA / Testing</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Description</label>
                <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Short description of core duties..." style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginTop: '6px' }}>
                Save Designation
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
