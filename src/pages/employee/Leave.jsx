import { useState, useEffect, useMemo } from 'react'
import {
  CalendarDays, Search, AlertCircle, X, ChevronDown, CheckCircle2,
  Loader2, Ban, Clock, Check, FileText
} from 'lucide-react'
import { getMyLeaves, applyLeave, cancelLeave } from '../../services/leaveService'
import { showSuccess, showError, showWarning } from '../../utils/toast'

const LEAVE_TYPE_MAP = {
  casual: 'Casual Leave',
  sick: 'Sick Leave',
  annual: 'Annual Leave',
  unpaid: 'Unpaid Leave',
  other: 'Other Leave',
}

export default function Leave() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)

  // Notifications
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Form input states
  const [leaveType, setLeaveType] = useState('casual')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      const res = await getMyLeaves()
      if (res?.leaves) {
        setLeaves(res.leaves)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch leave records'
      setErrorMsg(msg)
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [])

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [successMsg])

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 6000)
      return () => clearTimeout(timer)
    }
  }, [errorMsg])

  // Dynamic counts based on real applications
  const totalCount = leaves.length
  const approvedCount = leaves.filter((l) => l.status === 'approved').length
  const pendingCount = leaves.filter((l) => l.status === 'pending').length
  const rejectedCount = leaves.filter((l) => l.status === 'rejected').length

  // Filter list
  const filteredLeaves = useMemo(() => {
    return leaves.filter((item) => {
      const typeLabel = LEAVE_TYPE_MAP[item.leaveType] || item.leaveType
      const matchType = typeLabel.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = item.status.toLowerCase().includes(searchQuery.toLowerCase())
      const matchReason = item.reason.toLowerCase().includes(searchQuery.toLowerCase())
      return matchType || matchStatus || matchReason
    })
  }, [leaves, searchQuery])

  // Submit Leave Request
  const handleApply = async (e) => {
    e.preventDefault()
    if (!startDate || !endDate || !reason.trim()) {
      const msg = 'Please fill in all required fields.'
      setErrorMsg(msg)
      showWarning(msg)
      return
    }

    try {
      setActionLoading(true)
      const res = await applyLeave({
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      })

      const msg = res.message || 'Leave request submitted successfully!'
      setSuccessMsg(msg)
      showSuccess(msg)
      setStartDate('')
      setEndDate('')
      setReason('')
      setModalOpen(false)
      fetchLeaves()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit leave request'
      setErrorMsg(msg)
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  // Cancel Leave Request
  const handleCancelConfirm = async () => {
    if (!selectedLeave) return

    try {
      setActionLoading(true)
      const res = await cancelLeave(selectedLeave._id)
      const msg = res.message || 'Leave request cancelled successfully!'
      setSuccessMsg(msg)
      showSuccess(msg)
      setCancelModalOpen(false)
      setSelectedLeave(null)
      fetchLeaves()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel leave request'
      setErrorMsg(msg)
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  const calculateDays = (start, end) => {
    try {
      const s = new Date(start)
      const e = new Date(end)
      const diffTime = Math.abs(e - s)
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    } catch {
      return 1
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>

      {/* Notifications */}
      {successMsg && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
          color: '#166534', fontSize: 13, fontWeight: 500,
        }}>
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
          color: '#991b1b', fontSize: 13, fontWeight: 500,
        }}>
          <AlertCircle size={18} color="#dc2626" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Statistics Summary Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
      }}>
        {/* Total Leaves */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#c0392b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700 }}>
            {totalCount}
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Total</p>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>Applications</h4>
          </div>
        </div>

        {/* Approved Leaves */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700 }}>
            {approvedCount}
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Approved</p>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>Leaves</h4>
          </div>
        </div>

        {/* Pending Leaves */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700 }}>
            {pendingCount}
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Pending</p>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>Requests</h4>
          </div>
        </div>

        {/* Rejected Leaves */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700 }}>
            {rejectedCount}
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Rejected</p>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>Leaves</h4>
          </div>
        </div>
      </div>

      {/* 2. Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 8, padding: '8px 12px', width: 240,
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}>
          <Search size={14} color="#94a3b8" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reason, type, status..."
            style={{
              border: 'none', background: 'none', outline: 'none',
              fontSize: 13, color: '#334155', width: '100%',
            }}
          />
        </div>

        <button
          onClick={() => setModalOpen(true)}
          style={{
            background: '#c0392b', color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 18px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'background 0.2s ease',
          }}
        >
          Apply Leave
        </button>
      </div>

      {/* 3. Leave Logs Table */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
        padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#c0392b' }} />
            <p style={{ fontSize: 14 }}>Loading your leave history...</p>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <CalendarDays size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No leave applications found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              {searchQuery ? 'Try adjusting your search query.' : 'Click "Apply Leave" above to submit a new leave request.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }} className="hide-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#c0392b', color: '#fff', borderBottom: '2px solid #922b21' }}>
                  {['Leave Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status', 'Remarks & Actions'].map((h) => (
                    <th key={h} style={{ padding: '14px 12px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((row, index) => {
                  const days = calculateDays(row.startDate, row.endDate)
                  const statusColors = {
                    approved: { bg: '#f0fdf4', text: '#16a34a' },
                    pending: { bg: '#fefce8', text: '#d97706' },
                    rejected: { bg: '#fef2f2', text: '#dc2626' },
                    cancelled: { bg: '#f1f5f9', text: '#64748b' },
                  }
                  const sc = statusColors[row.status] || { bg: '#f8fafc', text: '#334155' }

                  return (
                    <tr key={row._id} style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: index % 2 === 1 ? '#fff5f5' : '#fff',
                    }}>
                      <td style={{ padding: '14px 12px', fontWeight: 600, color: '#1e293b' }}>
                        {LEAVE_TYPE_MAP[row.leaveType] || row.leaveType}
                      </td>
                      <td style={{ padding: '14px 12px', color: '#475569' }}>
                        {row.startDate ? new Date(row.startDate).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '14px 12px', color: '#475569' }}>
                        {row.endDate ? new Date(row.endDate).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '14px 12px', color: '#1e293b', fontWeight: 600 }}>
                        {days} {days === 1 ? 'day' : 'days'}
                      </td>
                      <td style={{ padding: '14px 12px', color: '#475569', maxWidth: 220 }}>
                        {row.reason}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{
                          background: sc.bg,
                          color: sc.text,
                          padding: '3px 10px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'capitalize',
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {row.status === 'pending' ? (
                            <button
                              onClick={() => {
                                setSelectedLeave(row)
                                setCancelModalOpen(true)
                              }}
                              style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: 6,
                                padding: '4px 10px',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Cancel Request
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: '#64748b' }}>
                              {row.adminRemarks ? `Remarks: ${row.adminRemarks}` : '-'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Apply Leave Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
            padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#c0392b', margin: 0 }}>New Leave Request</h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0 0' }}>Fill in required details to submit for manager approval.</p>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Leave Type Select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#922b21' }}>Leave Type *</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8,
                      border: '1px solid #c0392b', fontSize: 13, outline: 'none',
                      appearance: 'none', background: '#fff', color: '#1e293b',
                    }}
                  >
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="annual">Annual Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                    <option value="other">Other Leave</option>
                  </select>
                  <ChevronDown size={14} color="#c0392b" style={{ position: 'absolute', right: 12, top: 13, pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Dates grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#922b21' }}>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 10px', borderRadius: 8,
                      border: '1px solid #c0392b', fontSize: 12, outline: 'none', color: '#334155',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#922b21' }}>End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 10px', borderRadius: 8,
                      border: '1px solid #c0392b', fontSize: 12, outline: 'none', color: '#334155',
                    }}
                  />
                </div>
              </div>

              {/* Reason Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#922b21' }}>Reason for Absence *</label>
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Medical appointment or personal emergency"
                  rows={3}
                  style={{
                    width: '100%', padding: 10, borderRadius: 8,
                    border: '1px solid #c0392b', fontSize: 13, outline: 'none',
                    resize: 'none', color: '#334155',
                  }}
                />
              </div>

              {/* Buttons Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    background: '#a8a29e', color: '#fff', border: 'none',
                    borderRadius: 8, padding: '10px 18px', fontSize: 13,
                    fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    background: '#c0392b', color: '#fff', border: 'none',
                    borderRadius: 8, padding: '10px 18px', fontSize: 13,
                    fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Cancel Leave Confirmation Modal */}
      {cancelModalOpen && selectedLeave && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400,
            padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', textAlign: 'center',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: '#fef2f2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <Ban size={24} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Cancel Leave Request</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
              Are you sure you want to cancel your leave request from{' '}
              <strong>{new Date(selectedLeave.startDate).toLocaleDateString()}</strong> to{' '}
              <strong>{new Date(selectedLeave.endDate).toLocaleDateString()}</strong>?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
              <button
                disabled={actionLoading}
                onClick={() => setCancelModalOpen(false)}
                style={{ background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Keep Request
              </button>
              <button
                disabled={actionLoading}
                onClick={handleCancelConfirm}
                style={{
                  background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8,
                  padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>Confirm Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
