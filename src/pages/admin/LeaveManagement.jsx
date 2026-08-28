import { useState, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  Eye, 
  X, 
  Download, 
  Calendar, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react'

const INITIAL_REQUESTS = [
  { id: '01', employee: { name: 'Ashfak', id: 'EMP-001', avatar: 'AS' }, department: 'Development', type: 'Casual Leave', duration: '2 Days', from: '12 Sep 2026', to: '13 Sep 2026', appliedOn: '10 Sep 2026', status: 'Pending', reason: 'Personal work at hometown.', attachment: 'leave_reason.pdf' },
  { id: '02', employee: { name: 'Ansar', id: 'EMP-002', avatar: 'AN' }, department: 'Development', type: 'Medical Leave', duration: '1 Day', from: '18 Sep 2026', to: '18 Sep 2026', appliedOn: '16 Sep 2026', status: 'Approved', reason: 'Dental appointment checkup.', attachment: '' },
  { id: '03', employee: { name: 'Rabah', id: 'EMP-003', avatar: 'RA' }, department: 'HR', type: 'Personal Leave', duration: '2 Days', from: '24 Sep 2026', to: '25 Sep 2026', appliedOn: '22 Sep 2026', status: 'Rejected', reason: 'Emergency family shift help.', attachment: '' }
]

export default function LeaveManagement() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All Requests') // All Requests, Pending, Approved, Rejected
  const [deptFilter, setDeptFilter] = useState('All Departments')
  const [typeFilter, setTypeFilter] = useState('All Leave Types')
  const [selectedRequestId, setSelectedRequestId] = useState(null)

  const selectedRequest = useMemo(() => {
    return requests.find(r => r.id === selectedRequestId)
  }, [requests, selectedRequestId])

  const handleApprove = (id) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r))
  }

  const handleReject = (id) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r))
  }

  const stats = useMemo(() => {
    const total = requests.length
    const pending = requests.filter(r => r.status === 'Pending').length
    const approved = requests.filter(r => r.status === 'Approved').length
    const rejected = requests.filter(r => r.status === 'Rejected').length
    return { total, pending, approved, rejected }
  }, [requests])

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesSearch = r.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            r.employee.id.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesTab = activeTab === 'All Requests' || 
                         (activeTab === 'Pending' && r.status === 'Pending') ||
                         (activeTab === 'Approved' && r.status === 'Approved') ||
                         (activeTab === 'Rejected' && r.status === 'Rejected')

      const matchesDept = deptFilter === 'All Departments' || r.department === deptFilter
      const matchesType = typeFilter === 'All Leave Types' || r.type === typeFilter

      return matchesSearch && matchesTab && matchesDept && matchesType
    })
  }, [requests, searchQuery, activeTab, deptFilter, typeFilter])

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Pending': return { bg: '#fff7ed', text: '#c2410c' } // orange
      case 'Approved': return { bg: '#f0fdf4', text: '#15803d' } // green
      default: return { bg: '#fef2f2', text: '#b91c1c' } // red
    }
  }

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'Casual Leave': return { bg: '#eff6ff', text: '#1d4ed8' } // blue
      case 'Medical Leave': return { bg: '#faf5ff', text: '#6b21a8' } // purple
      case 'Personal Leave': return { bg: '#f0fdf4', text: '#16a34a' } // green
      default: return { bg: '#fff7ed', text: '#c2410c' } // orange (Sick Leave)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '24px', flex: 1, position: 'relative', height: '100%', overflow: 'hidden' }}>
      
      {/* Main Table Content panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }} className="hide-scroll">
        
        {/* Title */}
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Leave Management</h1>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', margin: 0 }}>Manage and approve employee leave requests</p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(192, 57, 43, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
              <FileText size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.total}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Total Requests</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}>
              <Clock size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.pending}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Pending Requests</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.approved}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Approved Requests</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stats.rejected}</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Rejected Requests</p>
            </div>
          </div>

        </div>

        {/* Tab Selection Filter Row */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {['All Requests', 'Pending', 'Approved', 'Rejected'].map(tab => {
                const isSelected = activeTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      background: isSelected ? '#c0392b' : 'transparent',
                      color: isSelected ? '#fff' : '#64748b',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {tab}
                  </button>
                )
              })}
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
                <option value="QA / Testing">QA / Testing</option>
                <option value="DevOps">DevOps</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
              </select>

              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
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
                <option value="All Leave Types">All Leave Types</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Medical Leave">Medical Leave</option>
                <option value="Personal Leave">Personal Leave</option>
                <option value="Sick Leave">Sick Leave</option>
              </select>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Calendar size={14} /> 01 May 2026 - 31 May 2026
              </div>

            </div>
          </div>

          {/* Search Input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
            gap: '8px'
          }}>
            <Search size={16} color="#94a3b8" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by employee name or ID..."
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

        </div>

        {/* Requests Table */}
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
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Employee</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Department</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Leave Type</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Duration</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Applied On</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((r) => {
                  const statusStyle = getBadgeStyle(r.status)
                  const typeStyle = getLeaveTypeColor(r.type)
                  const isSelected = selectedRequestId === r.id
                  return (
                    <tr 
                      key={r.id} 
                      onClick={() => setSelectedRequestId(isSelected ? null : r.id)}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: isSelected ? '#f8fafc' : 'transparent' }} 
                      className="hover:bg-slate-50"
                    >
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{r.id}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '26px', height: '26px', borderRadius: '50%',
                            background: '#eff6ff', color: '#1d4ed8', fontSize: '10px', fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>{r.employee.avatar}</div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{r.employee.name}</p>
                            <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{r.employee.id}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{r.department}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: typeStyle.bg, color: typeStyle.text,
                          fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px'
                        }}>{r.type}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>{r.duration}</td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{r.appliedOn}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          background: statusStyle.bg, color: statusStyle.text,
                          fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px'
                        }}>{r.status}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }} onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => setSelectedRequestId(r.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ padding: '48px 18px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    No requests found matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination summary row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Showing 1 to {filteredRequests.length} of {requests.length} requests</span>
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

      {/* DRAWER CONTAINER: Slides in from the right if selectedRequest is not null */}
      {selectedRequest && (
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
          
          {/* Drawer Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Leave Request Details</h3>
            <button 
              onClick={() => setSelectedRequestId(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Selected Employee profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{selectedRequest.employee.avatar}</div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{selectedRequest.employee.name}</p>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{selectedRequest.employee.id} • {selectedRequest.department}</p>
            </div>
          </div>

          {/* Details fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>Leave Type</span>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedRequest.type}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>Duration</span>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedRequest.duration}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>From</span>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedRequest.from}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>To</span>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedRequest.to}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontWeight: 500 }}>Applied On</span>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedRequest.appliedOn}</span>
            </div>

            <div style={{ height: '1px', background: '#f1f5f9', margin: '6px 0' }} />

            <div>
              <p style={{ color: '#64748b', fontWeight: 600, margin: '0 0 4px' }}>Reason</p>
              <p style={{ color: '#334155', lineHeight: 1.4, margin: 0 }}>{selectedRequest.reason}</p>
            </div>

            {selectedRequest.attachment && (
              <div style={{ marginTop: '6px' }}>
                <p style={{ color: '#64748b', fontWeight: 600, margin: '0 0 6px' }}>Attachment</p>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyBox: 'space-between', justifyContent: 'space-between',
                  border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', background: '#f8fafc'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <FileText size={14} color="#64748b" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: '#334155', fontWeight: 600 }} className="truncate">{selectedRequest.attachment}</span>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', padding: '2px' }}><Download size={14} /></button>
                </div>
              </div>
            )}
          </div>

          {/* Timeline History */}
          <div>
            <p style={{ color: '#64748b', fontWeight: 600, fontSize: '13px', margin: '0 0 10px' }}>Approval History</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '14px' }}>
              <div style={{ position: 'absolute', left: '4px', top: '4px', bottom: '4px', width: '1px', background: '#cbd5e1' }} />
              
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-13px', top: '4px', width: '7px', height: '7px', borderRadius: '50%', background: '#c2410c' }} />
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#334155', margin: 0 }}>Applied & Pending</p>
                <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>{selectedRequest.appliedOn} • Requested by employee</p>
              </div>

              {selectedRequest.status !== 'Pending' && (
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-13px', top: '4px', width: '7px', height: '7px', borderRadius: '50%', background: selectedRequest.status === 'Approved' ? '#16a34a' : '#ef4444' }} />
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#334155', margin: 0 }}>Reviewed & {selectedRequest.status}</p>
                  <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0 }}>Processed by Admin Portal</p>
                </div>
              )}
            </div>
          </div>

          {/* Approval Actions buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            {selectedRequest.status === 'Pending' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  style={{
                    flex: 1, background: '#15803d', color: '#fff', border: 'none', borderRadius: '6px',
                    padding: '8px 12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                  }}
                >
                  <Check size={14} strokeWidth={2.5} /> Approve
                </button>
                <button
                  onClick={() => handleReject(selectedRequest.id)}
                  style={{
                    flex: 1, background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '6px',
                    padding: '8px 12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                  }}
                >
                  <X size={14} strokeWidth={2.5} /> Reject
                </button>
              </div>
            )}
            <button
              onClick={() => setSelectedRequestId(null)}
              style={{
                background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px',
                padding: '8px 12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Close Details
            </button>
          </div>

        </div>
      )}

    </div>
  )
}
