import { useState, useMemo } from 'react'
import { 
  Search, 
  Plus, 
  Filter, 
  Trash2, 
  Users, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Edit, 
  X,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react'

const INITIAL_EMPLOYEES = [
  { id: '01', name: 'Ashfak', email: 'ashfak@travelzync.com', empId: 'TZ-EMP-001', department: 'Development', designation: 'Frontend Developer', status: 'Active', joiningDate: '12 Sep 2026' },
  { id: '02', name: 'Ansar', email: 'ansar@travelzync.com', empId: 'TZ-EMP-002', department: 'Development', designation: 'UI/UX Designer', status: 'Active', joiningDate: '18 Sep 2026' },
  { id: '03', name: 'Rabah', email: 'rabah@travelzync.com', empId: 'TZ-EMP-003', department: 'HR', designation: 'HR Executive', status: 'On Leave', joiningDate: '24 Sep 2026' }
]

export default function Employees() {
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES)
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('All Departments')
  const [desgFilter, setDesgFilter] = useState('All Designations')
  const [statusFilter, setStatusFilter] = useState('All Status')

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newDept, setNewDept] = useState('Development')
  const [newDesg, setNewDesg] = useState('Frontend Developer')
  const [newStatus, setNewStatus] = useState('Active')
  const [newJoiningDate, setNewJoiningDate] = useState('')

  const handleAddEmployee = (e) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) return

    const newId = String(employees.length + 1).padStart(2, '0')
    const empCode = `TZ-EMP-00${employees.length + 1}`
    
    const newEntry = {
      id: newId,
      name: newName,
      email: newEmail,
      empId: empCode,
      department: newDept,
      designation: newDesg,
      status: newStatus,
      joiningDate: newJoiningDate || '28 Aug 2026'
    }

    setEmployees(prev => [...prev, newEntry])
    setIsAddModalOpen(false)
    setNewName('')
    setNewEmail('')
    setNewJoiningDate('')
  }

  const handleDelete = (id) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id))
  }

  const stats = useMemo(() => {
    const total = employees.length
    const active = employees.filter(emp => emp.status === 'Active').length
    const onLeave = employees.filter(emp => emp.status === 'On Leave').length
    const inactive = employees.filter(emp => emp.status === 'Inactive').length

    return { total, active, onLeave, inactive }
  }, [employees])

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            emp.empId.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDept = deptFilter === 'All Departments' || emp.department === deptFilter
      const matchesDesg = desgFilter === 'All Designations' || emp.designation === desgFilter
      const matchesStatus = statusFilter === 'All Status' || emp.status === statusFilter

      return matchesSearch && matchesDept && matchesDesg && matchesStatus
    })
  }, [employees, searchQuery, deptFilter, desgFilter, statusFilter])

  const uniqueDepts = ['All Departments', 'Development', 'HR']
  const uniqueDesgs = ['All Designations', 'Frontend Developer', 'UI/UX Designer', 'HR Executive']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Employees</h1>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', margin: 0 }}>Manage all employees in the organization</p>
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
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Stat 1: Total Employees */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(192, 57, 43, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
            <Users size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.total}</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Total Employees</p>
          </div>
        </div>

        {/* Stat 2: Active Employees */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.active}</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Active (93.3%)</p>
          </div>
        </div>

        {/* Stat 3: On Leave */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}>
            <Clock size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.onLeave}</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>On Leave (4.4%)</p>
          </div>
        </div>

        {/* Stat 4: Inactive */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.inactive}</h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Inactive (2.2%)</p>
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
            placeholder="Search by name, email, or ID..."
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
            {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            value={desgFilter}
            onChange={(e) => setDesgFilter(e.target.value)}
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
            {uniqueDesgs.map(d => <option key={d} value={d}>{d}</option>)}
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
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={() => {
              setSearchQuery('')
              setDeptFilter('All Departments')
              setDesgFilter('All Designations')
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

      {/* Employees Table */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
          <thead>
            <tr style={{ background: '#c0392b', color: '#fff', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>#</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Employee</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Employee ID</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Department</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Designation</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Joining Date</th>
              <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover:bg-slate-50">
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{emp.id}</td>
                  
                  {/* Avatar + name */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{emp.name}</p>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>{emp.empId}</td>
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{emp.department}</td>
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{emp.designation}</td>
                  
                  {/* Status Badge */}
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      background: emp.status === 'Active' ? '#f0fdf4' : emp.status === 'On Leave' ? '#fefce8' : '#fef2f2',
                      color: emp.status === 'Active' ? '#15803d' : emp.status === 'On Leave' ? '#854d0e' : '#b91c1c',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}>
                      {emp.status}
                    </span>
                  </td>
                  
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{emp.joiningDate}</td>
                  
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}><Eye size={15} /></button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}><Edit size={15} /></button>
                      <button 
                        onClick={() => handleDelete(emp.id)}
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
                <td colSpan="8" style={{ padding: '48px 18px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No employees found matching filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination summary row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Showing 1 to {filteredEmployees.length} of {employees.length} employees</span>
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

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '440px', position: 'relative' }}>
            <button onClick={() => setIsAddModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Add Employee</h3>
            <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Full Name</label>
                <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Sreejith Nair" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Email Address</label>
                <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="e.g. sreejith@company.com" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Department</label>
                  <select value={newDept} onChange={e => setNewDept(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="QA / Testing">QA / Testing</option>
                    <option value="HR">HR</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Designation</label>
                  <select value={newDesg} onChange={e => setNewDesg(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="HR Executive">HR Executive</option>
                    <option value="QA Engineer">QA Engineer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Joining Date</label>
                  <input type="text" value={newJoiningDate} onChange={e => setNewJoiningDate(e.target.value)} placeholder="e.g. 28 Aug 2026" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>
              <button type="submit" style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginTop: '6px' }}>
                Add Member
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
