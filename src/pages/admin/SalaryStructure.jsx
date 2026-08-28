import { useState, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  Eye, 
  X, 
  Calendar, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit,
  Building2,
  Users
} from 'lucide-react'

const INITIAL_STRUCTURES = [
  { id: '01', name: 'Frontend Developer - Structure 1', department: 'Development', designation: 'Frontend Developer', effectiveFrom: '12 Sep 2026', status: 'Active', basic: 35000, allowances: 12500, deductions: 5500, description: 'Salary structure for Frontend Developer role in the development department.', createdBy: 'Admin User', createdOn: '10 Sep 2026' },
  { id: '02', name: 'UI/UX Designer - Structure 1', department: 'Design', designation: 'UI/UX Designer', effectiveFrom: '18 Sep 2026', status: 'Active', basic: 32000, allowances: 11000, deductions: 5000, description: 'Salary structure for UI/UX Designer role in the design department.', createdBy: 'Admin User', createdOn: '15 Sep 2026' },
  { id: '03', name: 'HR Executive - Structure 1', department: 'HR', designation: 'HR Executive', effectiveFrom: '24 Sep 2026', status: 'Active', basic: 28000, allowances: 9000, deductions: 4000, description: 'Salary structure for HR Executive role in the HR department.', createdBy: 'Admin User', createdOn: '20 Sep 2026' }
]

export default function SalaryStructure() {
  const [structures, setStructures] = useState(INITIAL_STRUCTURES)
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('All Departments')
  const [desgFilter, setDesgFilter] = useState('All Designations')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [selectedStructureId, setSelectedStructureId] = useState(null)
  
  // Drawer tab control
  const [drawerActiveTab, setDrawerActiveTab] = useState('Overview') // Overview, Allowances, Deductions

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDept, setNewDept] = useState('Development')
  const [newDesg, setNewDesg] = useState('Frontend Developer')
  const [newDesc, setNewDesc] = useState('')
  const [newBasic, setNewBasic] = useState('')
  const [newAllowances, setNewAllowances] = useState('')
  const [newDeductions, setNewDeductions] = useState('')

  const selectedStructure = useMemo(() => {
    return structures.find(s => s.id === selectedStructureId)
  }, [structures, selectedStructureId])

  const handleAddStructure = (e) => {
    e.preventDefault()
    if (!newName.trim()) return

    const newId = String(structures.length + 1).padStart(2, '0')
    const newEntry = {
      id: newId,
      name: newName,
      department: newDept,
      designation: newDesg,
      effectiveFrom: '28 Aug 2026',
      status: 'Active',
      basic: Number(newBasic) || 30000,
      allowances: Number(newAllowances) || 10000,
      deductions: Number(newDeductions) || 5000,
      description: newDesc || `Salary structure for ${newName}.`,
      createdBy: 'Admin User',
      createdOn: '28 Aug 2026'
    }

    setStructures(prev => [...prev, newEntry])
    setIsAddModalOpen(false)
    setNewName('')
    setNewDesc('')
    setNewBasic('')
    setNewAllowances('')
    setNewDeductions('')
  }

  const handleDelete = (id) => {
    setStructures(prev => prev.filter(s => s.id !== id))
  }

  const stats = useMemo(() => {
    const total = structures.length
    const active = structures.filter(s => s.status === 'Active').length
    const inactive = structures.filter(s => s.status === 'Inactive').length
    const upcoming = 0

    return { total, active, inactive, upcoming }
  }, [structures])

  const filteredStructures = useMemo(() => {
    return structures.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.designation.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDept = deptFilter === 'All Departments' || s.department === deptFilter
      const matchesDesg = desgFilter === 'All Designations' || s.designation === desgFilter
      const matchesStatus = statusFilter === 'All Statuses' || s.status === statusFilter

      return matchesSearch && matchesDept && matchesDesg && matchesStatus
    })
  }, [structures, searchQuery, deptFilter, desgFilter, statusFilter])

  // Formatter utility
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)
  }

  const uniqueDepts = ['All Departments', 'Development', 'Design', 'QA / Testing', 'Human Resources', 'Finance', 'Marketing']
  const uniqueDesgs = ['All Designations', 'Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'HR Executive', 'QA Engineer', 'DevOps Engineer']

  return (
    <div style={{ display: 'flex', gap: '24px', flex: 1, position: 'relative', height: '100%', overflow: 'hidden' }}>
      
      {/* Main Table Content panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }} className="hide-scroll">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Salary Structure</h1>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', margin: 0 }}>Manage and define employee salary structures</p>
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
            <Plus size={16} /> Create Salary Structure
          </button>
        </div>

        {/* Stats cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(192, 57, 43, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
              <FileText size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.total}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Total Structures</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
              <Users size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.active}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Active Structures</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <X size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.inactive}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Inactive Structures</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
              <Calendar size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.upcoming}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Upcoming Changes</p>
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
              placeholder="Search by structure name..."
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
              {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              value={desgFilter}
              onChange={e => setDesgFilter(e.target.value)}
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
              <option value="All Statuses">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('')
                setDeptFilter('All Departments')
                setDesgFilter('All Designations')
                setStatusFilter('All Statuses')
              }}
              style={{
                background: '#f1f5f9',
                color: '#475569',
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

        {/* Salary Structures Table */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ background: '#c0392b', color: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>#</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Structure Name</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Department</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Designation</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Effective From</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStructures.length > 0 ? (
                filteredStructures.map((s) => {
                  const isSelected = selectedStructureId === s.id
                  return (
                    <tr 
                      key={s.id}
                      onClick={() => {
                        setSelectedStructureId(isSelected ? null : s.id)
                        setDrawerActiveTab('Overview')
                      }}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: isSelected ? '#f8fafc' : 'transparent' }}
                      className="hover:bg-slate-50"
                    >
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{s.id}</td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#1e293b', fontWeight: 700 }}>{s.name}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: 'rgba(192, 57, 43, 0.05)', color: '#c0392b',
                          fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px'
                        }}>{s.department}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{s.designation}</td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{s.effectiveFrom}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: s.status === 'Active' ? '#f0fdf4' : '#fef2f2',
                          color: s.status === 'Active' ? '#15803d' : '#b91c1c',
                          fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px'
                        }}>{s.status}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button 
                            onClick={() => { setSelectedStructureId(s.id); setDrawerActiveTab('Overview'); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                          >
                            <Eye size={15} />
                          </button>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                            <Edit size={15} />
                          </button>
                          <button 
                            onClick={() => handleDelete(s.id)}
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
                  <td colSpan="7" style={{ padding: '48px 18px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    No salary structures found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination summary row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Showing 1 to {filteredStructures.length} of {structures.length} structures</span>
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

      {/* DRAWER CONTAINER: Slides in from the right if selectedStructure is not null */}
      {selectedStructure && (
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
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Structure Details</h3>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', margin: 0 }}>{selectedStructure.department} • {selectedStructure.designation}</p>
            </div>
            <button 
              onClick={() => setSelectedStructureId(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Info status card */}
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>{selectedStructure.name}</p>
            <span style={{
              background: selectedStructure.status === 'Active' ? '#f0fdf4' : '#fef2f2',
              color: selectedStructure.status === 'Active' ? '#15803d' : '#b91c1c',
              fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px'
            }}>{selectedStructure.status}</span>
          </div>

          {/* Tab Selection Row within Drawer */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '16px' }}>
            {['Overview', 'Allowances', 'Deductions'].map(tab => {
              const isSelected = drawerActiveTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => setDrawerActiveTab(tab)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: isSelected ? '2px solid #c0392b' : '2px solid transparent',
                    color: isSelected ? '#c0392b' : '#64748b',
                    padding: '6px 0 8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {tab}
                </button>
              )
            })}
          </div>

          {/* Tab Contents */}
          <div style={{ flex: 1, fontSize: '13px' }}>
            
            {drawerActiveTab === 'Overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Basic Salary</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatCurrency(selectedStructure.basic)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Total Allowances</span>
                  <span style={{ fontWeight: 600, color: '#15803d' }}>+ {formatCurrency(selectedStructure.allowances)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: 500 }}>Total Deductions</span>
                  <span style={{ fontWeight: 600, color: '#ef4444' }}>- {formatCurrency(selectedStructure.deductions)}</span>
                </div>

                <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Gross Salary</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{formatCurrency(selectedStructure.basic + selectedStructure.allowances)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(22, 163, 74, 0.05)', padding: '8px 10px', borderRadius: '6px' }}>
                  <span style={{ color: '#15803d', fontWeight: 700 }}>Net Salary</span>
                  <span style={{ fontWeight: 800, color: '#15803d', fontSize: '14px' }}>{formatCurrency(selectedStructure.basic + selectedStructure.allowances - selectedStructure.deductions)}</span>
                </div>
              </div>
            )}

            {drawerActiveTab === 'Allowances' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>HRA (House Rent Allowance)</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatCurrency(selectedStructure.allowances * 0.5)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Travel Allowance</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatCurrency(selectedStructure.allowances * 0.3)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Medical Allowance</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatCurrency(selectedStructure.allowances * 0.2)}</span>
                </div>
              </div>
            )}

            {drawerActiveTab === 'Deductions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Provident Fund (PF)</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatCurrency(selectedStructure.deductions * 0.7)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Professional Tax (PT)</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{formatCurrency(selectedStructure.deductions * 0.3)}</span>
                </div>
              </div>
            )}

            <div style={{ height: '1px', background: '#f1f5f9', margin: '14px 0' }} />

            <div>
              <p style={{ color: '#64748b', fontWeight: 600, margin: '0 0 4px' }}>Description</p>
              <p style={{ color: '#334155', lineHeight: 1.4, margin: 0 }}>{selectedStructure.description}</p>
            </div>

            <div style={{ marginTop: '14px' }}>
              <p style={{ color: '#64748b', fontWeight: 600, margin: '0 0 2px' }}>Created By</p>
              <p style={{ color: '#334155', fontWeight: 700, margin: 0 }}>{selectedStructure.createdBy}</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>{selectedStructure.createdOn}</p>
            </div>

          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <button
              style={{
                width: '100%', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px',
                padding: '8px 12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
              }}
            >
              View Full Details
            </button>
            <button
              onClick={() => setSelectedStructureId(null)}
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

      {/* Create Salary Structure Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '440px', position: 'relative' }}>
            <button onClick={() => setIsAddModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Create Salary Structure</h3>
            <form onSubmit={handleAddStructure} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Structure Name</label>
                <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Frontend Developer - Structure 1" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Department</label>
                  <select value={newDept} onChange={e => setNewDept(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="QA / Testing">QA / Testing</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Description</label>
                <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Salary structure description..." style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Basic Salary (₹)</label>
                  <input required type="number" value={newBasic} onChange={e => setNewBasic(e.target.value)} placeholder="35000" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Allowances (₹)</label>
                  <input required type="number" value={newAllowances} onChange={e => setNewAllowances(e.target.value)} placeholder="12500" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Deductions (₹)</label>
                  <input required type="number" value={newDeductions} onChange={e => setNewDeductions(e.target.value)} placeholder="5500" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>
              <button type="submit" style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginTop: '6px' }}>
                Create Structure
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
