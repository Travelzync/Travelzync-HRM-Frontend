import { useState, useEffect, useMemo } from 'react'
import {
  Home, Calendar, Search, Download, BookOpen, AlertCircle, X, Plus,
  CheckCircle2, Loader2, Check, Ban
} from 'lucide-react'
import { applyWFH, getMyWFHRequests } from '../../services/wfhService'
import { showSuccess, showError, showWarning } from '../../utils/toast'

export default function WorkFromHome() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [applyModalOpen, setApplyModalOpen] = useState(false)

  // Form input states
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await getMyWFHRequests()
      if (res?.requests) {
        setRequests(res.requests)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load WFH requests'
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  // Dynamic statistics
  const totalRequests = requests.length
  const approvedCount = requests.filter((r) => r.status === 'approved').length
  const pendingCount = requests.filter((r) => r.status === 'pending').length
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length

  // Filter list
  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const reason = item.reason || ''
      const start = formatDate(item.startDate)
      const end = formatDate(item.endDate)

      const matchesSearch =
        reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        start.toLowerCase().includes(searchQuery.toLowerCase()) ||
        end.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [requests, searchQuery, statusFilter])

  // Handle Form Submit
  const handleApply = async (e) => {
    e.preventDefault()
    if (!startDate || !endDate || !reason.trim()) {
      showWarning('Please fill in all required fields.')
      return
    }

    try {
      setActionLoading(true)
      const res = await applyWFH({
        startDate,
        endDate,
        reason: reason.trim(),
      })

      showSuccess(res.message || 'Work from home request submitted successfully!')
      setStartDate('')
      setEndDate('')
      setReason('')
      setApplyModalOpen(false)
      fetchRequests()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit WFH request'
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* 1. Header Banner */}
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
        padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, #c0392b, #922b21)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Home size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Work From Home (WFH)</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
              Submit and track your remote work arrangements with your team lead.
            </p>
          </div>
        </div>

        <button
          onClick={() => setApplyModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #c0392b, #922b21)',
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 18px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(192, 57, 43, 0.25)',
          }}
        >
          <Plus size={16} />
          <span>Apply WFH</span>
        </button>
      </div>

      {/* 2. Stat Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
      }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b', fontSize: 16, fontWeight: 700 }}>
            {totalRequests}
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Total Requests</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '2px 0 0 0' }}>{totalRequests} Days</h3>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', fontSize: 16, fontWeight: 700 }}>
            {approvedCount}
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Approved</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '2px 0 0 0' }}>{approvedCount} Requests</h3>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309', fontSize: 16, fontWeight: 700 }}>
            {pendingCount}
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Pending</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '2px 0 0 0' }}>{pendingCount} Requests</h3>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', fontSize: 16, fontWeight: 700 }}>
            {rejectedCount}
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Rejected</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '2px 0 0 0' }}>{rejectedCount} Requests</h3>
          </div>
        </div>
      </div>

      {/* 3. Table Card */}
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden',
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
              placeholder="Search date, reason..."
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
              <p style={{ fontSize: 13 }}>Loading WFH requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <Home size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>No WFH applications found</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>
                Click "+ Apply WFH" above to submit a new remote work request.
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Start Date</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>End Date</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Days</th>
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
                      {formatDate(row.startDate)}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 500 }}>
                      {formatDate(row.endDate)}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#c0392b' }}>
                      {row.daysCount} Day{row.daysCount > 1 ? 's' : ''}
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

      {/* Apply WFH Modal */}
      {applyModalOpen && (
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
                Apply for Work From Home
              </h3>
              <button
                onClick={() => setApplyModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 10px', borderRadius: 8,
                      border: '1px solid #cbd5e1', fontSize: 13, outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 10px', borderRadius: 8,
                      border: '1px solid #cbd5e1', fontSize: 13, outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Reason for WFH *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why you are working remotely"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
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
                    <span>Submit Application</span>
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
