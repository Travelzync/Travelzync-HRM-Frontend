import { useState, useMemo } from 'react'
import { Calendar, Search, FileText, AlertCircle, X, ChevronDown, CheckCircle2 } from 'lucide-react'

// Initial leave records with unique dates and reasons
const INITIAL_LEAVES = [
  { id: 1, leaveType: 'Casual Leave', from: '08/18/2026', to: '08/20/2026', days: 3, reason: "Sister's wedding ceremony in hometown", attachment: '', status: 'Accepted' },
  { id: 2, leaveType: 'Medical Leave', from: '08/12/2026', to: '08/12/2026', days: 1, reason: 'Wisdom tooth extraction surgery', attachment: '', status: 'Rejected' },
  { id: 3, leaveType: 'Annual Leave', from: '08/05/2026', to: '08/06/2026', days: 2, reason: 'Family trip to Munnar', attachment: '', status: 'Accepted' },
  { id: 4, leaveType: 'Casual Leave', from: '07/28/2026', to: '07/28/2026', days: 1, reason: 'Renewing driving license at RTO office', attachment: '', status: 'Accepted' },
  { id: 5, leaveType: 'Medical Leave', from: '07/15/2026', to: '07/17/2026', days: 3, reason: 'Severe viral fever doctor recommendation', attachment: '', status: 'Accepted' }
]

// Balances tracker to display left vs used counters
const LEAVE_BALANCES = {
  'Casual Leave': { left: 12, used: 2 },
  'Medical Leave': { left: 8, used: 1 },
  'Annual Leave': { left: 15, used: 3 }
}

export default function Leave() {
  const [leaves, setLeaves] = useState(INITIAL_LEAVES)
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  // Form input states
  const [leaveType, setLeaveType] = useState('Casual Leave')
  const [duration, setDuration] = useState('Full Day')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  // Calculate dynamic stats from active state array
  const totalLeaves = leaves.length
  const approvedLeaves = leaves.filter(l => l.status === 'Accepted').length
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length
  const rejectedLeaves = leaves.filter(l => l.status === 'Rejected').length

  // Filter leave history list
  const filteredLeaves = useMemo(() => {
    return leaves.filter(item => 
      item.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [leaves, searchQuery])

  // Handle leave application submit
  const handleApply = (e) => {
    e.preventDefault()
    if (!startDate || !endDate) return

    // Calculate days duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    // Format dates as MM/DD/YYYY
    const formatDate = (dateStr) => {
      const d = new Date(dateStr)
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
    }

    const newLeave = {
      id: Date.now(),
      leaveType,
      from: formatDate(startDate),
      to: formatDate(endDate),
      days: diffDays,
      reason: reason || 'Not specified',
      attachment: '',
      status: 'Pending'
    }

    // Append to list, reset inputs, close modal
    setLeaves([newLeave, ...leaves])
    setStartDate('')
    setEndDate('')
    setReason('')
    setModalOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* 1. Statistics Summary Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {/* Total Leaves */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#c0392b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 700 }}>
            {totalLeaves}
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Total</p>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>Leaves</h4>
          </div>
        </div>

        {/* Approved Leaves */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#922b21', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 700 }}>
            {approvedLeaves}
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Approved</p>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>Leaves</h4>
          </div>
        </div>

        {/* Pending Leaves */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#7b241c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 700 }}>
            {pendingLeaves}
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Pending</p>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>Leaves</h4>
          </div>
        </div>

        {/* Rejected Leaves */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#5c1a13', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 700 }}>
            {rejectedLeaves}
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Rejected</p>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>Leaves</h4>
          </div>
        </div>
      </div>

      {/* 2. Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        {/* Filter Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '8px 12px',
          width: '240px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <Search size={14} color="#94a3b8" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by status..." 
            style={{
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: '13px',
              color: '#334155',
              width: '100%'
            }}
          />
        </div>

        {/* Trigger Button */}
        <button 
          onClick={() => setModalOpen(true)}
          style={{
            background: '#c0392b',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'background 0.2s ease'
          }}>
          Apply Leave
        </button>
      </div>

      {/* 3. Leave Logs Table */}
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }} className="hide-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#c0392b', color: '#fff', borderBottom: '2px solid #922b21' }}>
                {['Leave Type', 'From', 'To', 'Days', 'Reason', 'Attachment', 'Status'].map(h => (
                  <th key={h} style={{ padding: '14px 12px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((row, index) => (
                <tr key={row.id} style={{
                  borderBottom: '1px solid #f1f5f9',
                  background: index % 2 === 1 ? '#fff5f5' : '#fff' // Alternating rows
                }}>
                  <td style={{ padding: '14px 12px', fontWeight: 600, color: '#1e293b' }}>{row.leaveType}</td>
                  <td style={{ padding: '14px 12px', color: '#475569' }}>{row.from}</td>
                  <td style={{ padding: '14px 12px', color: '#475569' }}>{row.to}</td>
                  <td style={{ padding: '14px 12px', color: '#1e293b', fontWeight: 600 }}>{row.days}</td>
                  <td style={{ padding: '14px 12px', color: '#475569' }}>{row.reason}</td>
                  <td style={{ padding: '14px 12px' }}>
                    {row.attachment ? (
                      <span style={{ color: '#c0392b', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <FileText size={12} /> Attachment
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        background: row.status === 'Accepted' ? '#fff7ed' : row.status === 'Rejected' ? '#fef2f2' : '#eff6ff',
                        color: row.status === 'Accepted' ? '#c2410c' : row.status === 'Rejected' ? '#ef4444' : '#1d4ed8',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {row.status}
                      </span>
                      {row.status === 'Rejected' && <AlertCircle size={14} color="#ef4444" style={{ cursor: 'pointer' }} title="Leave request declined by manager" />}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No leave applications found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination mock */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
          <button style={{ border: '1px solid #e2e8f0', background: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', color: '#64748b', cursor: 'pointer' }}>Previous</button>
          <button style={{ border: 'none', background: '#c0392b', color: '#fff', borderRadius: '6px', width: '28px', height: '28px', fontSize: '12px', fontWeight: 600 }}>1</button>
          <button style={{ border: '1px solid #e2e8f0', background: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', color: '#64748b', cursor: 'pointer' }}>Next</button>
        </div>
      </div>

      {/* 4. Apply Leave Modal Backdrop Popup */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.4)', // transparent slate-900 overlay
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          {/* Modal Card content box */}
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
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#c0392b', margin: 0 }}>New Leave Request</h3>
                <p style={{ fontSize: '12px', color: '#c0392b', opacity: 0.7, margin: '2px 0 0 0' }}>Fill in the required details to request a new leave.</p>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Input Form */}
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
                    <option value="Medical Leave">Medical Leave</option>
                    <option value="Annual Leave">Annual Leave</option>
                  </select>
                  <ChevronDown size={14} color="#c0392b" style={{ position: 'absolute', right: '12px', top: '13px', pointerEvents: 'none' }} />
                </div>
                
                {/* Remaining Info pill */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <span style={{
                    background: '#fff5f5',
                    color: '#c0392b',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}>
                    {leaveType} {LEAVE_BALANCES[leaveType].left} left / {LEAVE_BALANCES[leaveType].used} used
                  </span>
                </div>
              </div>

              {/* Select Duration */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#922b21' }}>Select Duration</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
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
                    <option value="Full Day">Full Day</option>
                    <option value="Half Day (Morning)">Half Day (Morning)</option>
                    <option value="Half Day (Afternoon)">Half Day (Afternoon)</option>
                  </select>
                  <ChevronDown size={14} color="#c0392b" style={{ position: 'absolute', right: '12px', top: '13px', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Dates grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#922b21' }}>Start Date</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#922b21' }}>End Date</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
              </div>

              {/* Reason Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#922b21' }}>Reason for Absence</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Feeling Not Well"
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
                    background: '#a8a29e', // gray-red/stone neutral cancellation styling
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
                  Apply Now
                </button>
              </div>
              
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
