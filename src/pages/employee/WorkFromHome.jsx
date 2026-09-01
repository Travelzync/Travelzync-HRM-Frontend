import { useState, useMemo } from 'react'
import { Home, Calendar, Search, Download, BookOpen, AlertCircle, X, Plus } from 'lucide-react'

// Initial state is empty as requested
const INITIAL_REQUESTS = []

export default function WorkFromHome() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  
  // Apply WFH Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  
  // Input fields state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  // Dynamically compute stats from state list
  const totalRequests = requests.length
  const approvedCount = requests.filter(r => r.status === 'Approved').length
  const pendingCount = requests.filter(r => r.status === 'Pending').length
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length

  // Filter list by status & search query
  const filteredRequests = useMemo(() => {
    return requests.filter(item => {
      const matchesSearch = item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.reason.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [requests, searchQuery, statusFilter])

  // Handle request form submission
  const handleApply = (e) => {
    e.preventDefault()
    if (!startDate || !endDate) return

    // Calculate days duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    // Format date as DD/MM/YYYY
    const formatDate = (dateStr) => {
      const d = new Date(dateStr)
      const day = d.getDate().toString().padStart(2, '0')
      const month = (d.getMonth() + 1).toString().padStart(2, '0')
      return `${day}/${month}/${d.getFullYear()}`
    }

    const newRequest = {
      id: `WFH-${100 + requests.length + 1}`,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      days: diffDays,
      reason: reason || 'Not specified',
      status: 'Pending'
    }

    setRequests([newRequest, ...requests])
    setStartDate('')
    setEndDate('')
    setReason('')
    setApplyModalOpen(false)
  }

  // Reset all filters
  const handleReset = () => {
    setSearchQuery('')
    setStatusFilter('All')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        background: 'linear-gradient(180deg, #c0392b 0%, #922b21 60%, #7b241c 100%)',
        borderRadius: '8px',
        padding: '20px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }} className="wfh-hero-banner">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Work From Home</h2>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', margin: '2px 0 0 0' }}>Manage and track your remote work requests</p>
        </div>
        <button 
          onClick={() => setApplyModalOpen(true)}
          style={{
            background: '#c0392b',
            color: '#fff',
            border: '1.5px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          + Create Request
        </button>
      </div>

      {/* 2. Stats Counters Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {/* Total requests card */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#7b241c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} className="wfh-icon-box">
            <Home size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{totalRequests}</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Total Requests</p>
          </div>
        </div>

        {/* Approved card */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#7b241c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} className="wfh-icon-box">
            <Calendar size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{approvedCount}</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Approved</p>
          </div>
        </div>

        {/* Pending card */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#7b241c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} className="wfh-icon-box">
            <AlertCircle size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{pendingCount}</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Pending</p>
          </div>
        </div>

        {/* Rejected card */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#7b241c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} className="wfh-icon-box">
            <X size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{rejectedCount}</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Rejected</p>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Panel */}
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{ background: '#7b241c', padding: '10px 16px', color: '#fff' }} className="wfh-panel-header">
          <h3 style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>Quick Actions</h3>
        </div>
        <div style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          
          <button 
            onClick={() => setApplyModalOpen(true)}
            style={{
              flex: '1 1 150px',
              background: '#fff',
              border: '1px solid #7b241c',
              borderRadius: '6px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} color="#7b241c" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#7b241c' }}>Apply WFH Request</span>
          </button>

          <button 
            onClick={() => alert('Download triggered!')}
            style={{
              flex: '1 1 150px',
              background: '#fff',
              border: '1px solid #7b241c',
              borderRadius: '6px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Download size={16} color="#7b241c" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#7b241c' }}>Download Report</span>
          </button>

          <button 
            onClick={() => {}}
            style={{
              flex: '1 1 150px',
              background: '#fff',
              border: '1px solid #7b241c',
              borderRadius: '6px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <BookOpen size={16} color="#7b241c" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#7b241c' }}>View Policy</span>
          </button>
        </div>
      </div>

      {/* 4. Request History Section */}
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {/* Table Title & Filter bar */}
        <div style={{
          background: 'linear-gradient(90deg, #c0392b 0%, #922b21 100%)',
          padding: '12px 16px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }} className="wfh-table-header">
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>Request History</h3>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', margin: '2px 0 0 0' }}>Your work from home requests and their status</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#fff',
              borderRadius: '6px',
              padding: '4px 8px',
              width: '140px'
            }}>
              <Search size={12} color="#94a3b8" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..." 
                style={{ border: 'none', background: 'none', outline: 'none', fontSize: '11px', color: '#334155', width: '100%' }}
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="wfh-select-filter"
              style={{
                background: '#7b241c',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
            
            <button 
              onClick={handleReset}
              style={{
                background: '#5c1a13',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table logs body */}
        {filteredRequests.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Request ID', 'Start Date', 'End Date', 'Days', 'Reason', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', fontWeight: 600, fontSize: '10px', color: '#475569', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((row, index) => (
                  <tr key={row.id} style={{
                    borderBottom: '1px solid #f1f5f9',
                    background: index % 2 === 1 ? '#fff5f5' : '#fff'
                  }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1e293b' }}>{row.id}</td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>{row.startDate}</td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>{row.endDate}</td>
                    <td style={{ padding: '10px 12px', color: '#1e293b', fontWeight: 700 }}>{row.days} days</td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>{row.reason}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        background: row.status === 'Approved' ? '#fff7ed' : row.status === 'Rejected' ? '#fef2f2' : '#eff6ff',
                        color: row.status === 'Approved' ? '#c2410c' : row.status === 'Rejected' ? '#ef4444' : '#1d4ed8',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {/* 5. Create Request Modal overlay */}
      {applyModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(15, 23, 42, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '440px',
            padding: '20px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#7b241c', margin: 0 }}>New WFH Request</h3>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>Request remote work days from your manager.</p>
              </div>
              <button onClick={() => setApplyModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Start Date</label>
                  <input 
                    type="date" 
                    required 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>End Date</label>
                  <input 
                    type="date" 
                    required 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Reason for Request</label>
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder="Describe your reason for remote work request..." 
                  rows={3} 
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', color: '#334155', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" onClick={() => setApplyModalOpen(false)} style={{ background: '#94a3b8', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#7b241c', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Apply Now</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
