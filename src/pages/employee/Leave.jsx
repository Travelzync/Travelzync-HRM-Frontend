import { useState, useMemo } from 'react'
import { Calendar, Search, FileText, AlertCircle, X, ChevronDown, CheckCircle2, SlidersHorizontal, Trash2 } from 'lucide-react'

// Initial leave records with unique dates and reasons
const INITIAL_LEAVES = [
  { id: 1, leaveType: 'Sick Leave', from: '18 Aug 2026', to: '19 Aug 2026', days: 2, reason: 'Annual health checkup', status: 'Approved', appliedOn: '15 Aug 2026 09:30 AM', adminRemarks: 'Approved based on doctor prescription', processedBy: 'HR Manager', processedAt: '16 Aug 2026 10:00 AM', createdAt: '15 Aug 2026 09:30 AM', lastUpdated: '16 Aug 2026 10:00 AM' },
  { id: 2, leaveType: 'Casual Leave', from: '10 Aug 2026', to: '10 Aug 2026', days: 1, reason: 'Moving to new apartment', status: 'Approved', appliedOn: '08 Aug 2026 11:20 AM', adminRemarks: '-', processedBy: 'Project Lead', processedAt: '09 Aug 2026 09:00 AM', createdAt: '08 Aug 2026 11:20 AM', lastUpdated: '09 Aug 2026 09:00 AM' },
  { id: 3, leaveType: 'Earned Leave', from: '28 Jul 2026', to: '30 Jul 2026', days: 3, reason: "Sister's graduation ceremony", status: 'Approved', appliedOn: '24 Jul 2026 10:15 AM', adminRemarks: '-', processedBy: 'HR Manager', processedAt: '25 Jul 2026 11:30 AM', createdAt: '24 Jul 2026 10:15 AM', lastUpdated: '25 Jul 2026 11:30 AM' },
  { id: 4, leaveType: 'Casual Leave', from: '15 Jun 2026', to: '15 Jun 2026', days: 1, reason: 'Government office documentation', status: 'Rejected', appliedOn: '14 Jun 2026 02:00 PM', adminRemarks: 'Understaffed on this day', processedBy: 'Project Lead', processedAt: '14 Jun 2026 04:30 PM', createdAt: '14 Jun 2026 02:00 PM', lastUpdated: '14 Jun 2026 04:30 PM' },
  { id: 5, leaveType: 'Sick Leave', from: '05 Jun 2026', to: '06 Jun 2026', days: 2, reason: 'Migraine attack recovery', status: 'Approved', appliedOn: '04 Jun 2026 08:45 AM', adminRemarks: '-', processedBy: 'HR Manager', processedAt: '04 Jun 2026 12:00 PM', createdAt: '04 Jun 2026 08:45 AM', lastUpdated: '04 Jun 2026 12:00 PM' },
  { id: 6, leaveType: 'Earned Leave', from: '22 May 2026', to: '24 May 2026', days: 3, reason: 'Weekend getaway to Wayanad', status: 'Pending', appliedOn: '20 May 2026 04:10 PM', adminRemarks: '-', processedBy: '-', processedAt: '-', createdAt: '20 May 2026 04:10 PM', lastUpdated: '20 May 2026 04:10 PM' },
  { id: 7, leaveType: 'Casual Leave', from: '10 May 2026', to: '10 May 2026', days: 1, reason: 'Home appliance delivery', status: 'Approved', appliedOn: '09 May 2026 01:15 PM', adminRemarks: '-', processedBy: 'Project Lead', processedAt: '09 May 2026 03:00 PM', createdAt: '09 May 2026 01:15 PM', lastUpdated: '09 May 2026 03:00 PM' }
]

export default function Leave() {
  const [leaves, setLeaves] = useState(INITIAL_LEAVES)
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  
  // State for selected leave detail panel
  const [selectedId, setSelectedId] = useState(6) // Default to ID 6 (Earned Leave pending)
  const [modalOpen, setModalOpen] = useState(false)

  // Form states
  const [leaveType, setLeaveType] = useState('Casual Leave')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  // Calculate dynamic stats
  const totalRequests = leaves.length
  const pendingRequests = leaves.filter(l => l.status === 'Pending').length
  const approvedRequests = leaves.filter(l => l.status === 'Approved').length
  const rejectedRequests = leaves.filter(l => l.status === 'Rejected').length

  // Filter lists based on dropdown filters
  const filteredLeaves = useMemo(() => {
    return leaves.filter(item => {
      const matchStatus = statusFilter === 'All' || item.status === statusFilter
      const matchType = typeFilter === 'All' || item.leaveType === typeFilter
      return matchStatus && matchType
    })
  }, [leaves, statusFilter, typeFilter])

  // Get active selected leave details
  const selectedLeave = useMemo(() => {
    return leaves.find(l => l.id === selectedId) || leaves[0]
  }, [leaves, selectedId])

  // Cancel pending leave request
  const handleCancelRequest = (id, e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to cancel this pending leave request?')) {
      setLeaves(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'Cancelled',
            lastUpdated: new Date().toLocaleString()
          }
        }
        return item
      }))
    }
  }

  // Handle leave application submit
  const handleApply = (e) => {
    e.preventDefault()
    if (!startDate || !endDate) return

    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    const options = { day: '2-digit', month: 'short', year: 'numeric' }
    const formatStr = (d) => new Date(d).toLocaleDateString('en-GB', options)

    const nowStr = new Date().toLocaleString()

    const newLeave = {
      id: Date.now(),
      leaveType,
      from: formatStr(startDate),
      to: formatStr(endDate),
      days: diffDays,
      reason: reason || 'Not specified',
      status: 'Pending',
      appliedOn: nowStr,
      adminRemarks: '-',
      processedBy: '-',
      processedAt: '-',
      createdAt: nowStr,
      lastUpdated: nowStr
    }

    setLeaves([newLeave, ...leaves])
    setSelectedId(newLeave.id)
    setStartDate('')
    setEndDate('')
    setReason('')
    setModalOpen(false)
  }

  const handleClearFilters = () => {
    setStatusFilter('All')
    setTypeFilter('All')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', paddingBottom: 24 }}>
      
      {/* 1. Statistics Summary Row (Unified Card Banner) */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Left Icon Panel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#c0392b'
            }}>
              <Calendar size={22} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: 0 }}>Total Leave Requests</p>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#c0392b', margin: '2px 0 0 0' }}>{totalRequests}</h2>
            </div>
          </div>

          {/* Divider & Sub-Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }} className="responsive-stats-grid-3">
            {/* Pending */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308' }} />
              <div>
                <p style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Pending</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>{pendingRequests}</p>
              </div>
            </div>

            {/* Approved */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderLeft: '1px solid #f1f5f9', paddingLeft: 24 }} className="responsive-leave-item">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              <div>
                <p style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Approved</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>{approvedRequests}</p>
              </div>
            </div>

            {/* Rejected */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderLeft: '1px solid #f1f5f9', paddingLeft: 24 }} className="responsive-leave-item">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
              <div>
                <p style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Rejected</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>{rejectedRequests}</p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, fontSize: 11, color: '#94a3b8' }}>
          Summary of your leave requests.
        </div>
      </div>

      {/* 2. Action Filter Bar */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Status</span>
            <div style={{ position: 'relative' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '6px 28px 6px 12px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  fontSize: 13,
                  color: '#334155',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none'
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: 10, top: 9, pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Leave Type Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Leave Type</span>
            <div style={{ position: 'relative' }}>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{
                  padding: '6px 28px 6px 12px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  fontSize: 13,
                  color: '#334155',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none'
                }}
              >
                <option value="All">All Types</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Earned Leave">Earned Leave</option>
              </select>
              <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: 10, top: 9, pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(statusFilter !== 'All' || typeFilter !== 'All') && (
            <button
              onClick={handleClearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#c0392b',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                marginTop: 18
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Apply Leave Trigger Button */}
        <button
          onClick={() => setModalOpen(true)}
          style={{
            background: '#c0392b',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(192, 57, 43, 0.15)',
            transition: 'background 0.2s ease'
          }}
        >
          Apply Leave
        </button>
      </div>

      {/* 3. Leave Logs Table */}
      <div style={{
        background: '#fff',
        border: '1px solid #f1f5f9',
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16, marginTop: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 4, height: 16, background: '#c0392b', borderRadius: 2 }} />
          Leave Requests
        </h3>

        <div style={{ overflowX: 'auto' }} className="hide-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                {['#', 'Leave Type', 'From Date', 'To Date', 'Reason', 'Status', 'Applied On', 'Action'].map((h, i) => (
                  <th key={i} style={{ padding: '12px 8px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((row, index) => {
                const isSelected = row.id === selectedId
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                    style={{
                      borderBottom: '1px solid #f8fafc',
                      background: isSelected ? '#fff5f5' : (index % 2 === 1 ? '#fafafa' : '#fff'),
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <td style={{ padding: '14px 8px', color: '#64748b' }}>{index + 1}</td>
                    <td style={{ padding: '14px 8px', fontWeight: 600, color: '#1e293b' }}>
                      <span style={{
                        color: row.leaveType === 'Sick Leave' ? '#8b5cf6' : row.leaveType === 'Earned Leave' ? '#ea580c' : '#2563eb',
                        background: row.leaveType === 'Sick Leave' ? '#f5f3ff' : row.leaveType === 'Earned Leave' ? '#fff7ed' : '#eff6ff',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11
                      }}>{row.leaveType}</span>
                    </td>
                    <td style={{ padding: '14px 8px', color: '#475569' }}>{row.from}</td>
                    <td style={{ padding: '14px 8px', color: '#475569' }}>{row.to}</td>
                    <td style={{ padding: '14px 8px', color: '#475569' }}>{row.reason}</td>
                    <td style={{ padding: '14px 8px' }}>
                      <span style={{
                        background: row.status === 'Approved' ? '#e8f5e9' : row.status === 'Rejected' ? '#ffebee' : row.status === 'Pending' ? '#fff9db' : '#eceff1',
                        color: row.status === 'Approved' ? '#2e7d32' : row.status === 'Rejected' ? '#c62828' : row.status === 'Pending' ? '#f59f00' : '#455a64',
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px', color: '#64748b', fontSize: 12 }}>{row.appliedOn}</td>
                    <td style={{ padding: '14px 8px' }}>
                      {row.status === 'Pending' ? (
                        <button
                          onClick={(e) => handleCancelRequest(row.id, e)}
                          style={{
                            background: '#fff',
                            border: '1px solid #fca5a5',
                            color: '#ef4444',
                            borderRadius: 6,
                            padding: '4px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'all 0.15s'
                          }}
                        >
                          Cancel
                        </button>
                      ) : '-'}
                    </td>
                  </tr>
                )
              })}
              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No leave applications found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Selected Leave Details Card (Below Table) */}
      {selectedLeave && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #f1f5f9',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          padding: 24
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16, marginTop: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 4, height: 16, background: '#c0392b', borderRadius: 2 }} />
            Leave Request Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {/* Left Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #fafafa', paddingBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Leave Type</span>
                <span style={{
                  color: selectedLeave.leaveType === 'Sick Leave' ? '#8b5cf6' : selectedLeave.leaveType === 'Earned Leave' ? '#ea580c' : '#2563eb',
                  fontWeight: 600
                }}>{selectedLeave.leaveType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #fafafa', paddingBottom: 6 }}>
                <span style={{ color: '#64748b' }}>From Date</span>
                <span style={{ fontWeight: 500, color: '#1e293b' }}>{selectedLeave.from}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #fafafa', paddingBottom: 6 }}>
                <span style={{ color: '#64748b' }}>To Date</span>
                <span style={{ fontWeight: 500, color: '#1e293b' }}>{selectedLeave.to}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #fafafa', paddingBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Reason</span>
                <span style={{ fontWeight: 500, color: '#1e293b' }}>{selectedLeave.reason}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Status</span>
                <span style={{
                  background: selectedLeave.status === 'Approved' ? '#e8f5e9' : selectedLeave.status === 'Rejected' ? '#ffebee' : selectedLeave.status === 'Pending' ? '#fff9db' : '#eceff1',
                  color: selectedLeave.status === 'Approved' ? '#2e7d32' : selectedLeave.status === 'Rejected' ? '#c62828' : selectedLeave.status === 'Pending' ? '#f59f00' : '#455a64',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700
                }}>{selectedLeave.status}</span>
              </div>
            </div>

            {/* Right Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #fafafa', paddingBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Admin Remarks</span>
                <span style={{ fontWeight: 500, color: '#334155' }}>{selectedLeave.adminRemarks}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #fafafa', paddingBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Processed By</span>
                <span style={{ fontWeight: 500, color: '#334155' }}>{selectedLeave.processedBy}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #fafafa', paddingBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Processed At</span>
                <span style={{ fontWeight: 500, color: '#334155' }}>{selectedLeave.processedAt}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #fafafa', paddingBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Created At</span>
                <span style={{ fontWeight: 500, color: '#334155', fontSize: 12 }}>{selectedLeave.createdAt}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Last Updated</span>
                <span style={{ fontWeight: 500, color: '#334155', fontSize: 12 }}>{selectedLeave.lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Apply Leave Modal Backdrop Popup */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '480px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#c0392b', margin: 0 }}>New Leave Request</h3>
                <p style={{ fontSize: '12px', color: '#c0392b', opacity: 0.7, margin: '2px 0 0 0' }}>Request time-off from work.</p>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Leave Type Select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#922b21' }}>Leave Type</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #c0392b',
                      fontSize: '13px',
                      outline: 'none',
                      appearance: 'none',
                      background: '#fff',
                      color: '#1e293b'
                    }}>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Earned Leave">Earned Leave</option>
                  </select>
                  <ChevronDown size={14} color="#c0392b" style={{ position: 'absolute', right: '12px', top: '13px', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Dates grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#922b21' }}>Start Date</label>
                  <input 
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #c0392b',
                      fontSize: '12px',
                      outline: 'none',
                      color: '#334155'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#922b21' }}>End Date</label>
                  <input 
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #c0392b',
                      fontSize: '12px',
                      outline: 'none',
                      color: '#334155'
                    }}
                  />
                </div>
              </div>

              {/* Reason Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#922b21' }}>Reason for Absence</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Vacation trip with family"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #c0392b',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none',
                    color: '#334155'
                  }}
                />
              </div>

              {/* Buttons Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    background: '#a8a29e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    background: '#c0392b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
