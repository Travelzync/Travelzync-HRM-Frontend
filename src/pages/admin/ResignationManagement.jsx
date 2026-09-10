import { useState, useEffect, useMemo } from 'react'
import {
  LogOut, Search, Filter, CheckCircle2, XCircle, Clock,
  Calendar, UserCheck, Edit2, CheckSquare, X, Loader2, AlertCircle
} from 'lucide-react'
import {
  getAllResignations, updateResignationStatus, updateExitClearance
} from '../../services/resignationService'
import { showSuccess, showError, showWarning } from '../../utils/toast'

export default function ResignationManagement() {
  const [resignations, setResignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modals
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [clearanceModalOpen, setClearanceModalOpen] = useState(false)
  const [selectedResignation, setSelectedResignation] = useState(null)

  const [statusForm, setStatusForm] = useState({
    status: 'approved',
    adminRemarks: '',
    actualLastWorkingDate: '',
  })

  const [clearanceForm, setClearanceForm] = useState({
    departmentClearance: false,
    assetsReturned: false,
    accountsClearance: false,
    hrClearance: false,
  })

  const fetchResignations = async () => {
    try {
      setLoading(true)
      const res = await getAllResignations({ status: statusFilter })
      if (res?.resignations) setResignations(res.resignations)
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load resignations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResignations()
  }, [statusFilter])

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Summary KPIs
  const totalCount = resignations.length
  const pendingCount = resignations.filter((r) => r.status === 'pending' || r.status === 'under_review').length
  const approvedCount = resignations.filter((r) => r.status === 'approved').length
  const rejectedCount = resignations.filter((r) => r.status === 'rejected').length

  // Filtered List
  const filteredResignations = useMemo(() => {
    return resignations.filter((r) => {
      const emp = r.employeeId
      const empName = emp?.userId?.name || ''
      const empId = emp?.userId?.employeeId || ''
      const dept = emp?.departmentId?.name || ''
      const reason = r.reason || ''
      const q = searchQuery.toLowerCase()

      const matchesSearch =
        empName.toLowerCase().includes(q) ||
        empId.toLowerCase().includes(q) ||
        dept.toLowerCase().includes(q) ||
        reason.toLowerCase().includes(q)

      return matchesSearch
    })
  }, [resignations, searchQuery])

  // Open Status Modal
  const handleOpenStatus = (item) => {
    setSelectedResignation(item)
    setStatusForm({
      status: item.status === 'pending' ? 'approved' : item.status,
      adminRemarks: item.adminRemarks || '',
      actualLastWorkingDate: item.actualLastWorkingDate
        ? item.actualLastWorkingDate.split('T')[0]
        : item.expectedLastWorkingDate
          ? item.expectedLastWorkingDate.split('T')[0]
          : '',
    })
    setStatusModalOpen(true)
  }

  // Submit Status
  const handleStatusSubmit = async (e) => {
    e.preventDefault()
    if (!selectedResignation) return

    try {
      setActionLoading(true)
      const res = await updateResignationStatus(selectedResignation._id, statusForm)
      showSuccess(res.message || 'Resignation status updated')
      setStatusModalOpen(false)
      setSelectedResignation(null)
      fetchResignations()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update resignation status')
    } finally {
      setActionLoading(false)
    }
  }

  // Open Clearance Modal
  const handleOpenClearance = (item) => {
    setSelectedResignation(item)
    setClearanceForm({
      departmentClearance: item.exitClearance?.departmentClearance || false,
      assetsReturned: item.exitClearance?.assetsReturned || false,
      accountsClearance: item.exitClearance?.accountsClearance || false,
      hrClearance: item.exitClearance?.hrClearance || false,
    })
    setClearanceModalOpen(true)
  }

  // Submit Clearance
  const handleClearanceSubmit = async (e) => {
    e.preventDefault()
    if (!selectedResignation) return

    try {
      setActionLoading(true)
      const res = await updateExitClearance(selectedResignation._id, clearanceForm)
      showSuccess(res.message || 'Exit clearance updated')
      setClearanceModalOpen(false)
      setSelectedResignation(null)
      fetchResignations()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update clearance')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #c0392b 0%, #922b21 60%, #7b241c 100%)',
        borderRadius: 16, padding: '24px 28px', color: '#fff',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        justifyContent: 'space-between', gap: 20,
        boxShadow: '0 4px 12px rgba(192, 57, 43, 0.25)',
      }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Resignation & Exit Clearance</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0' }}>
            Review employee separation notices, confirm final working days, and conduct 4-point exit clearance.
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.15)', borderRadius: 12,
          padding: '10px 18px', display: 'flex', gap: 16, alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Pending Review</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{pendingCount} Staff</div>
          </div>
          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Approved Exits</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{approvedCount}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
              <LogOut size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#c0392b', background: '#fee2e2', padding: '2px 8px', borderRadius: 10 }}>Total</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>{totalCount}</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Total Resignations</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ca8a04' }}>
              <Clock size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#ca8a04', background: '#fef9c3', padding: '2px 8px', borderRadius: 10 }}>Action</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>{pendingCount}</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Pending / In Review</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <CheckCircle2 size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 10 }}>Approved</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>{approvedCount}</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Notice Active / Relieved</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
              <XCircle size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: 10 }}>Declined</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>{rejectedCount}</h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Rejected Requests</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
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
              placeholder="Search employee, ID, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: 12, color: '#334155', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 12, color: '#334155', outline: 'none', cursor: 'pointer' }}
            >
              <option value="ALL">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13 }}>Loading resignations...</p>
            </div>
          ) : filteredResignations.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <LogOut size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>No resignation requests found</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Employee</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Notice Date</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Notice Days</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Expected Last Day</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Confirmed Last Day</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Reason</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'center' }}>Clearance</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredResignations.map((item) => {
                  const emp = item.employeeId
                  const empName = emp?.userId?.name || 'Staff'
                  const empId = emp?.userId?.employeeId || '-'
                  const clr = item.exitClearance
                  const clearedItemsCount = [
                    clr?.departmentClearance,
                    clr?.assetsReturned,
                    clr?.accountsClearance,
                    clr?.hrClearance,
                  ].filter(Boolean).length

                  return (
                    <tr
                      key={item._id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{empName}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{empId}</div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>
                        {formatDate(item.resignationDate)}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#1e293b', fontWeight: 600 }}>
                        {item.noticePeriodDays} Days
                      </td>
                      <td style={{ padding: '14px 18px', color: '#c0392b', fontWeight: 600 }}>
                        {formatDate(item.expectedLastWorkingDate)}
                      </td>
                      <td style={{ padding: '14px 18px', color: item.actualLastWorkingDate ? '#16a34a' : '#64748b', fontWeight: 600 }}>
                        {formatDate(item.actualLastWorkingDate)}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.reason}>
                        {item.reason}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                          background:
                            item.status === 'approved' ? '#dcfce7' :
                            item.status === 'under_review' ? '#e0e7ff' :
                            item.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                          color:
                            item.status === 'approved' ? '#15803d' :
                            item.status === 'under_review' ? '#4338ca' :
                            item.status === 'rejected' ? '#b91c1c' : '#b45309',
                        }}>
                          {item.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenClearance(item)}
                          title="View / Update 4-Point Exit Clearance"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: clearedItemsCount === 4 ? '#dcfce7' : '#f1f5f9',
                            border: '1px solid #e2e8f0', borderRadius: 8,
                            padding: '4px 8px', fontSize: 11, fontWeight: 600,
                            color: clearedItemsCount === 4 ? '#15803d' : '#475569', cursor: 'pointer',
                          }}
                        >
                          <CheckSquare size={12} />
                          <span>{clearedItemsCount}/4 Cleared</span>
                        </button>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenStatus(item)}
                          title="Review / Update Status"
                          style={{
                            background: '#f1f5f9', border: 'none', borderRadius: 8,
                            padding: '5px 10px', cursor: 'pointer', color: '#0f172a',
                            fontSize: 11.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          <Edit2 size={12} />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Review / Status Modal */}
      {statusModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 460, width: '100%', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>Review Resignation</h3>
              <button onClick={() => setStatusModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, marginBottom: 14, fontSize: 12 }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>Staff:</strong> {selectedResignation?.employeeId?.userId?.name} ({selectedResignation?.employeeId?.userId?.employeeId})</p>
              <p style={{ margin: '0 0 4px 0' }}><strong>Reason:</strong> {selectedResignation?.reason}</p>
              {selectedResignation?.feedback && <p style={{ margin: 0 }}><strong>Handover:</strong> {selectedResignation.feedback}</p>}
            </div>

            <form onSubmit={handleStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Decision Status *</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none' }}
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approve Resignation</option>
                  <option value="rejected">Reject Resignation</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Confirmed Last Working Date</label>
                <input
                  type="date"
                  value={statusForm.actualLastWorkingDate}
                  onChange={(e) => setStatusForm({ ...statusForm, actualLastWorkingDate: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Management Remarks</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Notice accepted, handover assigned to senior developer..."
                  value={statusForm.adminRemarks}
                  onChange={(e) => setStatusForm({ ...statusForm, adminRemarks: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setStatusModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #c0392b, #922b21)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                  {actionLoading ? 'Saving...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exit Clearance Checklist Modal */}
      {clearanceModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 440, width: '100%', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>4-Point Exit Clearance</h3>
              <button onClick={() => setClearanceModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 16px 0' }}>
              Check off handover milestones for <strong>{selectedResignation?.employeeId?.userId?.name}</strong>.
            </p>

            <form onSubmit={handleClearanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'departmentClearance', label: 'Department Handover Completed', desc: 'Project files, code repos, and task handovers signed off' },
                { key: 'assetsReturned', label: 'Company Assets Returned', desc: 'Laptop, ID card, SIM, access keys handed back to IT/Admin' },
                { key: 'accountsClearance', label: 'Accounts & Finance Cleared', desc: 'Final settlement, expense claims, and dues verified' },
                { key: 'hrClearance', label: 'HR Exit Formalities', desc: 'Exit interview conducted, relieving letter generated' },
              ].map((item) => (
                <label
                  key={item.key}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 12px', borderRadius: 8,
                    background: clearanceForm[item.key] ? '#f0fdf4' : '#f8fafc',
                    border: `1px solid ${clearanceForm[item.key] ? '#bbf7d0' : '#e2e8f0'}`,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={clearanceForm[item.key]}
                    onChange={(e) => setClearanceForm({ ...clearanceForm, [item.key]: e.target.checked })}
                    style={{ marginTop: 2, cursor: 'pointer', width: 16, height: 16 }}
                  />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: clearanceForm[item.key] ? '#15803d' : '#1e293b' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {item.desc}
                    </div>
                  </div>
                </label>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setClearanceModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                  {actionLoading ? 'Saving...' : 'Save Clearance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
