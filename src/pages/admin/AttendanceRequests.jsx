import { useState, useEffect, useMemo } from 'react'
import {
  CalendarDays, Search, CheckCircle2, AlertCircle, X,
  Loader2, Check, Ban, Clock, Filter
} from 'lucide-react'
import {
  getAllAttendanceRequests, updateAttendanceRequestStatus
} from '../../services/attendanceRequestService'
import { showSuccess, showError, showWarning } from '../../utils/toast'

export default function AttendanceRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [reviewStatus, setReviewStatus] = useState('approved')
  const [adminRemarks, setAdminRemarks] = useState('')

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await getAllAttendanceRequests()
      if (res?.requests) {
        setRequests(res.requests)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load attendance regularization requests'
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // Formatters
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Filter list
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const emp = r.employeeId
      const empName = emp?.userId?.name || ''
      const empId = emp?.userId?.employeeId || ''
      const dept = emp?.departmentId?.name || ''
      const dateStr = formatDate(r.date)
      const reason = r.reason || ''

      const matchesSearch =
        empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dateStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reason.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [requests, searchQuery, statusFilter])

  // Open review modal
  const handleOpenReview = (request, status = 'approved') => {
    setSelectedRequest(request)
    setReviewStatus(status)
    setAdminRemarks('')
    setReviewModalOpen(true)
  }

  // Handle Review Submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRequest) return

    try {
      setActionLoading(true)
      const res = await updateAttendanceRequestStatus(selectedRequest._id, {
        status: reviewStatus,
        adminRemarks: adminRemarks.trim(),
      })

      showSuccess(res.message || `Request ${reviewStatus} successfully!`)
      setReviewModalOpen(false)
      setSelectedRequest(null)
      fetchRequests()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to process regularization request'
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
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
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>
              Attendance Regularization Requests
            </h1>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3, margin: 0 }}>
              Review and approve missed punch-in/out requests from staff.
            </p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div style={{
        background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
        {/* Controls */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 8, padding: '7px 12px', width: 280,
          }}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search employee, ID, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: 12, color: '#334155', width: '100%' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: '#f8fafc', fontSize: 12, color: '#334155', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="ALL">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13 }}>Loading regularization requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <CalendarDays size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>No requests found</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Employee</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Department</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Requested In</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Requested Out</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Reason</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((row) => {
                  const emp = row.employeeId
                  const empName = emp?.userId?.name || 'Staff'
                  const empId = emp?.userId?.employeeId || '-'
                  const dept = emp?.departmentId?.name || '-'

                  return (
                    <tr
                      key={row._id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{empName}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{empId}</div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>
                        {dept}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 500 }}>
                        {formatDate(row.date)}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#10b981', fontWeight: 500 }}>
                        {formatTime(row.requestedCheckIn)}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b', fontWeight: 500 }}>
                        {formatTime(row.requestedCheckOut)}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#334155' }}>
                        {row.reason}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          borderRadius: 12, padding: '3px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                          background:
                            row.status === 'approved' ? '#dcfce7' :
                            row.status === 'pending' ? '#fef3c7' : '#fee2e2',
                          color:
                            row.status === 'approved' ? '#15803d' :
                            row.status === 'pending' ? '#b45309' : '#b91c1c',
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        {row.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button
                              onClick={() => handleOpenReview(row, 'approved')}
                              title="Approve Request"
                              style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                background: '#dcfce7', color: '#15803d', border: 'none',
                                borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <Check size={13} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleOpenReview(row, 'rejected')}
                              title="Reject Request"
                              style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                background: '#fee2e2', color: '#b91c1c', border: 'none',
                                borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <Ban size={13} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>Processed</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, maxWidth: 420, width: '100%',
            padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {reviewStatus === 'approved' ? 'Approve Regularization' : 'Reject Regularization'}
              </h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              {reviewStatus === 'approved'
                ? 'Approving this request will automatically create or update the employee attendance record for the specified date.'
                : 'Please specify the reason for rejecting this regularization request.'}
            </p>

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Admin Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Verified with department lead"
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  style={{
                    padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1',
                    background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    padding: '9px 18px', borderRadius: 8, border: 'none',
                    background: reviewStatus === 'approved' ? '#16a34a' : '#dc2626',
                    color: '#fff', fontSize: 13, fontWeight: 600,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Confirm {reviewStatus === 'approved' ? 'Approval' : 'Rejection'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
