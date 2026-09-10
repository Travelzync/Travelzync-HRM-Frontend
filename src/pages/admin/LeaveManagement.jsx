import { useState, useEffect, useMemo } from 'react'
import {
  CalendarDays, Search, CheckCircle2, AlertCircle, X,
  Loader2, Filter, User, Check, Ban, Clock
} from 'lucide-react'
import { getAllLeaves, updateLeaveStatus } from '../../services/leaveService'
import { showSuccess, showError, showWarning, showInfo } from '../../utils/toast'

const LEAVE_TYPE_MAP = {
  casual: 'Casual Leave',
  sick: 'Sick Leave',
  annual: 'Annual Leave',
  unpaid: 'Unpaid Leave',
  other: 'Other Leave',
}

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Notification states
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Process modal state
  const [processModalOpen, setProcessModalOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [processStatus, setProcessStatus] = useState('approved')
  const [adminRemarks, setAdminRemarks] = useState('')

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      const res = await getAllLeaves()
      if (res?.leaves) {
        setLeaves(res.leaves)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load employee leave requests'
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

  // Stat calculations
  const totalCount = leaves.length
  const pendingCount = leaves.filter((l) => l.status === 'pending').length
  const approvedCount = leaves.filter((l) => l.status === 'approved').length
  const rejectedCount = leaves.filter((l) => l.status === 'rejected').length

  // Filter list
  const filteredLeaves = useMemo(() => {
    return leaves.filter((item) => {
      const emp = item.employeeId
      const empName = emp?.userId?.name || ''
      const empId = emp?.userId?.employeeId || ''
      const dept = emp?.departmentId?.name || ''
      const typeLabel = LEAVE_TYPE_MAP[item.leaveType] || item.leaveType
      const reason = item.reason || ''

      const matchesSearch =
        empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        typeLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reason.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [leaves, searchQuery, statusFilter])

  // Open process modal
  const handleOpenProcess = (leave, initialStatus = 'approved') => {
    setSelectedLeave(leave)
    setProcessStatus(initialStatus)
    setAdminRemarks('')
    setProcessModalOpen(true)
  }

  // Submit status update
  const handleProcessSubmit = async (e) => {
    e.preventDefault()
    if (!selectedLeave) return

    try {
      setActionLoading(true)
      const res = await updateLeaveStatus(selectedLeave._id, {
        status: processStatus,
        adminRemarks: adminRemarks.trim(),
      })

      const actionText = processStatus === 'approved' ? 'approved' : 'rejected'
      const msg = res.message || `Leave request ${actionText} successfully!`
      setSuccessMsg(msg)
      showSuccess(msg)
      setProcessModalOpen(false)
      setSelectedLeave(null)
      fetchLeaves()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update leave status'
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>

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

      {/* Header Banner */}
      <div style={{
        background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9',
        padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, #c0392b, #922b21)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CalendarDays size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Leave Management</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>
              Review, approve, and process employee leave applications across departments.
            </p>
          </div>
        </div>

        <div style={{
          background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8,
          padding: '8px 14px', fontSize: 12, color: '#c0392b', fontWeight: 600,
        }}>
          Employees submit their own requests
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16,
      }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#c0392b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700 }}>
            {totalCount}
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Total Requests</p>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>All Applications</h4>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700 }}>
            {pendingCount}
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Needs Action</p>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>Pending Approval</h4>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700 }}>
            {approvedCount}
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Approved</p>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>Granted Leaves</h4>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700 }}>
            {rejectedCount}
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Rejected</p>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>Declined Requests</h4>
          </div>
        </div>
      </div>

      {/* Controls: Search & Status Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 8, padding: '8px 14px', width: 280,
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}>
          <Search size={15} color="#94a3b8" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee, ID, reason..."
            style={{
              border: 'none', background: 'none', outline: 'none',
              fontSize: 13, color: '#334155', width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
              padding: '8px 12px', fontSize: 13, color: '#334155', outline: 'none',
            }}
          >
            <option value="ALL">All Statuses ({leaves.length})</option>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="approved">Approved ({approvedCount})</option>
            <option value="rejected">Rejected ({rejectedCount})</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Leaves Table */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#c0392b' }} />
            <p style={{ fontSize: 14 }}>Loading leave applications...</p>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <CalendarDays size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No leave requests found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria.'
                : 'No employee leave applications have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }} className="hide-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#c0392b', color: '#fff', borderBottom: '2px solid #922b21' }}>
                  {['Employee', 'Department & Role', 'Leave Type', 'Dates & Duration', 'Reason', 'Status', 'Process Info', 'Action'].map((h) => (
                    <th key={h} style={{
                      padding: '12px 14px', fontWeight: 600, fontSize: 11,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave, idx) => {
                  const emp = leave.employeeId
                  const days = calculateDays(leave.startDate, leave.endDate)
                  const statusColors = {
                    approved: { bg: '#f0fdf4', text: '#16a34a' },
                    pending: { bg: '#fefce8', text: '#d97706' },
                    rejected: { bg: '#fef2f2', text: '#dc2626' },
                    cancelled: { bg: '#f1f5f9', text: '#64748b' },
                  }
                  const sc = statusColors[leave.status] || { bg: '#f8fafc', text: '#334155' }

                  return (
                    <tr
                      key={leave._id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 1 ? '#fff5f5' : '#fff',
                      }}
                    >
                      {/* Employee Info */}
                      <td style={{ padding: '14px' }}>
                        <p style={{ fontWeight: 600, color: '#111827', margin: 0 }}>
                          {emp?.userId?.name || 'Unknown Employee'}
                        </p>
                        <p style={{ fontSize: 11, color: '#c0392b', fontWeight: 600, margin: '2px 0 0' }}>
                          {emp?.userId?.employeeId || '-'}
                        </p>
                      </td>

                      {/* Department & Role */}
                      <td style={{ padding: '14px' }}>
                        <p style={{ fontWeight: 500, color: '#334155', margin: 0 }}>
                          {emp?.designationId?.name || '-'}
                        </p>
                        <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>
                          {emp?.departmentId?.name || '-'}
                        </p>
                      </td>

                      {/* Leave Type */}
                      <td style={{ padding: '14px', fontWeight: 600, color: '#1e293b' }}>
                        {LEAVE_TYPE_MAP[leave.leaveType] || leave.leaveType}
                      </td>

                      {/* Dates & Duration */}
                      <td style={{ padding: '14px' }}>
                        <p style={{ color: '#334155', margin: 0, fontSize: 12 }}>
                          {leave.startDate ? new Date(leave.startDate).toLocaleDateString() : '-'} –{' '}
                          {leave.endDate ? new Date(leave.endDate).toLocaleDateString() : '-'}
                        </p>
                        <span style={{ fontSize: 11, color: '#c0392b', fontWeight: 600, marginTop: 2, display: 'inline-block' }}>
                          {days} {days === 1 ? 'day' : 'days'}
                        </span>
                      </td>

                      {/* Reason */}
                      <td style={{ padding: '14px', color: '#475569', maxWidth: 220 }}>
                        <p style={{ margin: 0, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {leave.reason}
                        </p>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          background: sc.bg,
                          color: sc.text,
                          padding: '3px 10px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'capitalize',
                        }}>
                          {leave.status}
                        </span>
                      </td>

                      {/* Process Info */}
                      <td style={{ padding: '14px', fontSize: 11, color: '#64748b', maxWidth: 180 }}>
                        {leave.processedBy ? (
                          <div>
                            <p style={{ margin: 0, fontWeight: 500, color: '#334155' }}>
                              By: {leave.processedBy.name || 'Admin'}
                            </p>
                            {leave.adminRemarks && (
                              <p style={{ margin: '2px 0 0', fontStyle: 'italic' }}>
                                "{leave.adminRemarks}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <span>Awaiting review</span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px' }}>
                        {leave.status === 'pending' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              onClick={() => handleOpenProcess(leave, 'approved')}
                              style={{
                                background: '#f0fdf4',
                                color: '#16a34a',
                                border: '1px solid #bbf7d0',
                                borderRadius: 6,
                                padding: '5px 10px',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <Check size={12} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleOpenProcess(leave, 'rejected')}
                              style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: 6,
                                padding: '5px 10px',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <X size={12} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>Processed</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================
          PROCESS LEAVE MODAL
      ======================================================== */}
      {processModalOpen && selectedLeave && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
            padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>
                  Process Leave Request
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                  {selectedLeave.employeeId?.userId?.name} ({selectedLeave.employeeId?.userId?.employeeId})
                </p>
              </div>
              <button
                onClick={() => setProcessModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Leave Details Card */}
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
              padding: '12px 14px', marginBottom: 16, fontSize: 13,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Leave Type:</span>
                <strong style={{ color: '#111827' }}>
                  {LEAVE_TYPE_MAP[selectedLeave.leaveType] || selectedLeave.leaveType}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Duration:</span>
                <span style={{ color: '#111827' }}>
                  {new Date(selectedLeave.startDate).toLocaleDateString()} – {new Date(selectedLeave.endDate).toLocaleDateString()} ({calculateDays(selectedLeave.startDate, selectedLeave.endDate)} days)
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: 2 }}>Reason:</span>
                <p style={{ color: '#111827', margin: 0, fontStyle: 'italic', background: '#fff', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  "{selectedLeave.reason}"
                </p>
              </div>
            </div>

            <form onSubmit={handleProcessSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Decision Toggle */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 6 }}>
                  Decision *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setProcessStatus('approved')}
                    style={{
                      padding: '10px', borderRadius: 8,
                      border: processStatus === 'approved' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                      background: processStatus === 'approved' ? '#f0fdf4' : '#fff',
                      color: processStatus === 'approved' ? '#16a34a' : '#64748b',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <Check size={16} />
                    <span>Approve Leave</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProcessStatus('rejected')}
                    style={{
                      padding: '10px', borderRadius: 8,
                      border: processStatus === 'rejected' ? '2px solid #dc2626' : '1px solid #e2e8f0',
                      background: processStatus === 'rejected' ? '#fef2f2' : '#fff',
                      color: processStatus === 'rejected' ? '#dc2626' : '#64748b',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <Ban size={16} />
                    <span>Reject Leave</span>
                  </button>
                </div>
              </div>

              {/* Admin Remarks */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', marginBottom: 4 }}>
                  Admin Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Provide feedback or rationale for approval/rejection..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setProcessModalOpen(false)}
                  style={{ background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    background: processStatus === 'approved' ? '#16a34a' : '#dc2626',
                    color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px',
                    fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  <span>Confirm {processStatus === 'approved' ? 'Approval' : 'Rejection'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
