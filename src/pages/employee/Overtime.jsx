import { useState, useEffect, useMemo } from 'react'
import {
  Clock, Plus, Search, CheckCircle2, AlertCircle, X,
  Loader2, Check, Ban, FileText
} from 'lucide-react'
import {
  createExtraTimeRequest, getMyExtraTimeRequests
} from '../../services/overtimeService'
import { getTasks } from '../../services/taskService'
import { showSuccess, showError, showWarning } from '../../utils/toast'

export default function Overtime() {
  const [requests, setRequests] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)

  // Form State
  const [form, setForm] = useState({
    taskId: '',
    requestedHours: 1,
    reason: '',
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [reqRes, taskRes] = await Promise.all([
        getMyExtraTimeRequests(),
        getTasks().catch(() => ({ tasks: [] })),
      ])

      if (reqRes?.requests) {
        setRequests(reqRes.requests)
      }
      if (taskRes?.tasks) {
        setTasks(taskRes.tasks)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load overtime requests'
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  // Filter list
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const taskTitle = r.taskId?.title || ''
      const reason = r.reason || ''
      const matchesSearch =
        taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reason.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [requests, searchQuery, statusFilter])

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.taskId || !form.requestedHours || !form.reason.trim()) {
      showWarning('Please fill in all required fields.')
      return
    }

    try {
      setActionLoading(true)
      const payload = {
        taskId: form.taskId,
        requestedHours: Number(form.requestedHours),
        reason: form.reason.trim(),
      }

      const res = await createExtraTimeRequest(payload)
      showSuccess(res.message || 'Overtime request submitted successfully!')
      setModalOpen(false)
      setForm({
        taskId: '',
        requestedHours: 1,
        reason: '',
      })
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit overtime request'
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
            <Clock size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>Overtime & Extra Time</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3, margin: 0 }}>
              Request additional working hours for critical project tasks and client deliveries.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #c0392b, #922b21)',
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 18px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(192, 57, 43, 0.25)',
          }}
        >
          <Plus size={16} />
          <span>Request Overtime</span>
        </button>
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
            borderRadius: 8, padding: '7px 12px', width: 260,
          }}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search task or reason..."
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
            <option value="ALL">All Status</option>
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
              <p style={{ fontSize: 13 }}>Loading overtime requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <Clock size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>No overtime requests found</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>
                Click "Request Overtime" to submit extra time on your assigned tasks.
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Date Submitted</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Associated Task</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Requested Hours</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Reason</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Admin Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((row) => (
                  <tr
                    key={row._id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 500 }}>
                      {formatDate(row.createdAt)}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1e293b' }}>
                      {row.taskId?.title || 'Project Task'}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#c0392b', fontWeight: 700 }}>
                      +{row.requestedHours} hrs
                    </td>
                    <td style={{ padding: '14px 18px', color: '#475569' }}>
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
                    <td style={{ padding: '14px 18px', color: '#94a3b8', fontSize: 12 }}>
                      {row.adminRemarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, maxWidth: 440, width: '100%',
            padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Request Overtime / Extra Hours
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Select Task *
                </label>
                {tasks.length > 0 ? (
                  <select
                    required
                    value={form.taskId}
                    onChange={(e) => setForm((prev) => ({ ...prev, taskId: e.target.value }))}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 8,
                      border: '1px solid #cbd5e1', fontSize: 13, outline: 'none',
                    }}
                  >
                    <option value="">-- Choose Assigned Task --</option>
                    {tasks.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Enter Task ID or Reference"
                    value={form.taskId}
                    onChange={(e) => setForm((prev) => ({ ...prev, taskId: e.target.value }))}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8,
                      border: '1px solid #cbd5e1', fontSize: 13, outline: 'none',
                    }}
                  />
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Requested Extra Hours (Hours) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  required
                  value={form.requestedHours}
                  onChange={(e) => setForm((prev) => ({ ...prev, requestedHours: e.target.value }))}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid #cbd5e1', fontSize: 13, outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Reason / Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why extra time is needed to complete this task"
                  value={form.reason}
                  onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
                    background: 'linear-gradient(135deg, #c0392b, #922b21)',
                    color: '#fff', fontSize: 13, fontWeight: 600,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Request</span>
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
