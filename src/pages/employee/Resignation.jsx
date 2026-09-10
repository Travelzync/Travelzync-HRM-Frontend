import { useState, useEffect } from 'react'
import {
  LogOut, Calendar, Clock, CheckCircle2, AlertTriangle,
  XCircle, FileText, ArrowRight, X, Loader2, Undo2, ShieldAlert
} from 'lucide-react'
import {
  getMyResignation, submitResignation, withdrawResignation
} from '../../services/resignationService'
import { getCurrentUser } from '../../services/authService'
import { showSuccess, showError, showWarning } from '../../utils/toast'

const STEPS = [
  { id: 'submitted', label: 'Submitted' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'approved', label: 'Approved' },
  { id: 'exit_clearance', label: 'Exit Clearance' },
  { id: 'completed', label: 'Relieved' },
]

export default function Resignation() {
  const [resignation, setResignation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [submitModalOpen, setSubmitModalOpen] = useState(false)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)

  const [form, setForm] = useState({
    reason: '',
    feedback: '',
    noticePeriodDays: 30,
  })

  const user = getCurrentUser()

  const fetchResignation = async () => {
    try {
      setLoading(true)
      const res = await getMyResignation()
      if (res?.resignation) {
        setResignation(res.resignation)
      } else {
        setResignation(null)
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load resignation details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResignation()
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Calculate live expected last working date
  const calculatedLastDay = () => {
    const d = new Date()
    d.setDate(d.getDate() + Number(form.noticePeriodDays || 30))
    return d.toLocaleDateString(undefined, {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  // Handle Submit Resignation
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.reason.trim()) {
      showWarning('Reason for resignation is required')
      return
    }

    try {
      setActionLoading(true)
      const res = await submitResignation(form)
      showSuccess(res.message || 'Resignation request submitted')
      setSubmitModalOpen(false)
      fetchResignation()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit resignation')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Withdraw Resignation
  const handleWithdraw = async () => {
    try {
      setActionLoading(true)
      const res = await withdrawResignation()
      showSuccess(res.message || 'Resignation withdrawn')
      setWithdrawModalOpen(false)
      fetchResignation()
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to withdraw resignation')
    } finally {
      setActionLoading(false)
    }
  }

  // Current active step index
  const getCurrentStepIndex = () => {
    if (!resignation) return 0
    if (resignation.status === 'pending') return 1
    if (resignation.status === 'under_review') return 2
    if (resignation.status === 'approved') {
      const clr = resignation.exitClearance
      const allCleared = clr && clr.departmentClearance && clr.assetsReturned && clr.accountsClearance && clr.hrClearance
      return allCleared ? 4 : 3
    }
    return 1
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
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Resignation & Exit Management</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0' }}>
            Submit separation notice, view your handover timeline, and track clearance milestones.
          </p>
        </div>

        {!resignation || resignation.status === 'withdrawn' || resignation.status === 'rejected' ? (
          <button
            onClick={() => setSubmitModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#fff', color: '#c0392b', border: 'none',
              borderRadius: 10, padding: '10px 18px', fontSize: 13,
              fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            <LogOut size={16} />
            <span>Submit Resignation</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
          <Loader2 size={26} className="animate-spin" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13 }}>Loading resignation record...</p>
        </div>
      ) : !resignation || resignation.status === 'withdrawn' ? (
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
          padding: 48, textAlign: 'center', color: '#64748b',
        }}>
          <LogOut size={36} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
            No Active Resignation Notice
          </h3>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
            You are in good standing with TravelZync. If you are planning career changes, click 'Submit Resignation' to serve your 30-day notice period.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Visual Step Progress Tracker */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
            padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 20px 0' }}>
              Exit Lifecycle Status
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              {STEPS.map((step, idx) => {
                const activeIdx = getCurrentStepIndex()
                const isPassed = idx <= activeIdx
                const isCurrent = idx === activeIdx

                return (
                  <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2, flex: 1 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: isPassed ? '#16a34a' : '#e2e8f0',
                      color: isPassed ? '#fff' : '#64748b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                      boxShadow: isCurrent ? '0 0 0 4px rgba(22, 163, 74, 0.2)' : 'none',
                    }}>
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? '#0f172a' : isPassed ? '#16a34a' : '#94a3b8',
                      marginTop: 8, textAlign: 'center',
                    }}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Details Card */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
            padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <div>
                <span style={{
                  padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                  background:
                    resignation.status === 'approved' ? '#dcfce7' :
                    resignation.status === 'under_review' ? '#e0e7ff' :
                    resignation.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                  color:
                    resignation.status === 'approved' ? '#15803d' :
                    resignation.status === 'under_review' ? '#4338ca' :
                    resignation.status === 'rejected' ? '#b91c1c' : '#b45309',
                }}>
                  {resignation.status?.replace('_', ' ')}
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '8px 0 2px 0' }}>
                  Resignation Notice
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                  Submitted on {formatDate(resignation.resignationDate)}
                </p>
              </div>

              {(resignation.status === 'pending' || resignation.status === 'under_review') && (
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
                    background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Undo2 size={14} />
                  <span>Withdraw Resignation</span>
                </button>
              )}
            </div>

            {/* Quick Metrics */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12,
              background: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 18,
            }}>
              <div>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Notice Period</span>
                <strong style={{ fontSize: 14, color: '#0f172a' }}>{resignation.noticePeriodDays} Days</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Expected Last Day</span>
                <strong style={{ fontSize: 14, color: '#c0392b' }}>{formatDate(resignation.expectedLastWorkingDate)}</strong>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Confirmed Final Day</span>
                <strong style={{ fontSize: 14, color: resignation.actualLastWorkingDate ? '#16a34a' : '#64748b' }}>
                  {formatDate(resignation.actualLastWorkingDate)}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div>
                <strong style={{ color: '#334155' }}>Reason for Leaving:</strong>
                <p style={{ color: '#475569', margin: '4px 0 0 0', background: '#fff', padding: '10px 12px', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                  {resignation.reason}
                </p>
              </div>

              {resignation.adminRemarks && (
                <div>
                  <strong style={{ color: '#334155' }}>Management Remarks:</strong>
                  <p style={{ color: '#1e293b', margin: '4px 0 0 0', background: '#fef2f2', padding: '10px 12px', borderRadius: 8, border: '1px solid #fecaca' }}>
                    {resignation.adminRemarks}
                  </p>
                </div>
              )}
            </div>

            {/* 4-Point Exit Clearance Checklist */}
            <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid #f1f5f9' }}>
              <h5 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
                4-Point Exit Clearance Checklist
              </h5>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                {[
                  { label: 'Department Handover', done: resignation.exitClearance?.departmentClearance },
                  { label: 'Company Assets Returned', done: resignation.exitClearance?.assetsReturned },
                  { label: 'Accounts / Final Settlement', done: resignation.exitClearance?.accountsClearance },
                  { label: 'HR Exit Formalities', done: resignation.exitClearance?.hrClearance },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 12px', borderRadius: 8,
                      background: item.done ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${item.done ? '#bbf7d0' : '#e2e8f0'}`,
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: item.done ? '#16a34a' : '#cbd5e1',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {item.done ? '✓' : '•'}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: item.done ? '#15803d' : '#64748b' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Resignation Modal */}
      {submitModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 480, width: '100%', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>Submit Resignation Notice</h3>
              <button onClick={() => setSubmitModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Notice Period (Days)</label>
                <input
                  type="number"
                  min="15"
                  max="90"
                  value={form.noticePeriodDays}
                  onChange={(e) => setForm({ ...form, noticePeriodDays: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none' }}
                />
                <span style={{ fontSize: 11, color: '#64748b', marginTop: 3, display: 'block' }}>
                  Projected Last Working Date: <strong>{calculatedLastDay()}</strong>
                </span>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Reason for Resignation *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Pursuing higher studies, career growth opportunity, personal reasons..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>Handover Plan / Comments</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Prepared documentation and handover plan for ongoing projects..."
                  value={form.feedback}
                  onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12.5, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setSubmitModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #c0392b, #922b21)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                  {actionLoading ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {withdrawModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 380, width: '100%', padding: 24, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Undo2 size={22} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>Withdraw Resignation?</h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Are you sure you want to cancel your resignation request and continue your tenure at TravelZync?
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setWithdrawModalOpen(false)} style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleWithdraw} disabled={actionLoading} style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer' }}>
                {actionLoading ? 'Processing...' : 'Yes, Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
