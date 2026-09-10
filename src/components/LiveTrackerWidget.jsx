import { useState, useEffect, useCallback } from 'react'
import {
  Clock, Play, Square, AlertTriangle, CheckCircle2,
  Coffee, Sparkles, Loader2, X, ChevronDown, ChevronUp,
  Utensils, Compass, Sun, Moon
} from 'lucide-react'
import {
  getTodayAttendance, checkIn, checkOut, toggleBreak
} from '../services/attendanceService'
import useActivityTracker from '../hooks/useActivityTracker'
import { showSuccess, showError, showWarning, showInfo } from '../utils/toast'

const BREAK_PRESETS = [
  { id: 'lunch', label: 'Lunch Break', icon: '🍱', note: 'Lunch Break' },
  { id: 'coffee', label: 'Coffee / Tea', icon: '☕', note: 'Coffee / Tea Break' },
  { id: 'stepout', label: 'Quick Step Out', icon: '🚶', note: 'Quick Step Out' },
  { id: 'prayer', label: 'Prayer Time', icon: '🕌', note: 'Prayer Break' },
]

export default function LiveTrackerWidget() {
  const [todayAttendance, setTodayAttendance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [morningModalOpen, setMorningModalOpen] = useState(false)
  const [checkOutModalOpen, setCheckOutModalOpen] = useState(false)
  const [breakModalOpen, setBreakModalOpen] = useState(false)
  const [breakNote, setBreakNote] = useState('Lunch Break')
  const [customBreakReason, setCustomBreakReason] = useState('')
  const [timelineDropdownOpen, setTimelineDropdownOpen] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [breakSeconds, setBreakSeconds] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Keep live time clock ticking
  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(clockInterval)
  }, [])

  // Fetch today's attendance record
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getTodayAttendance()
      if (res?.attendance) {
        setTodayAttendance(res.attendance)
        setMorningModalOpen(false)
      } else {
        setTodayAttendance(null)
        setMorningModalOpen(true)
      }
    } catch (err) {
      console.error('Failed to load today attendance status:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Hook for 5-minute idle detection
  const isTrackingActive = Boolean(
    todayAttendance?.isCurrentlyPunchedIn && !todayAttendance?.isOnBreak
  )

  const { status, isIdle } = useActivityTracker({
    attendanceId: todayAttendance?._id,
    enabled: isTrackingActive,
  })

  // Timer calculation for both work time and break time
  useEffect(() => {
    if (!todayAttendance?.checkIn) {
      setElapsedSeconds(0)
      setBreakSeconds(0)
      return
    }

    const updateTimers = () => {
      let accumulatedSecs = (todayAttendance.totalSessionMinutes || 0) * 60

      // If currently active in an open work punch, add live elapsed time
      if (todayAttendance.isCurrentlyPunchedIn && !todayAttendance.isOnBreak) {
        const lastPunch = todayAttendance.punches?.slice().reverse().find((p) => p.type === 'work' && !p.punchOut)
        if (lastPunch) {
          const currentPunchSecs = Math.max(0, Math.floor((Date.now() - new Date(lastPunch.punchIn).getTime()) / 1000))
          accumulatedSecs += currentPunchSecs
        }
      }
      setElapsedSeconds(accumulatedSecs)

      // If currently on break, calculate live break duration
      if (todayAttendance.isOnBreak) {
        const activeBreak = todayAttendance.punches?.slice().reverse().find((p) => p.type === 'break' && !p.punchOut)
        if (activeBreak) {
          const liveBreakSecs = Math.max(0, Math.floor((Date.now() - new Date(activeBreak.punchIn).getTime()) / 1000))
          setBreakSeconds(liveBreakSecs)
        }
      } else {
        setBreakSeconds(0)
      }
    }

    updateTimers()
    const timer = setInterval(updateTimers, 1000)
    return () => clearInterval(timer)
  }, [todayAttendance])

  // Format seconds to HH:MM:SS
  const formatTimer = (totalSecs) => {
    const hours = Math.floor(totalSecs / 3600).toString().padStart(2, '0')
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0')
    const secs = (totalSecs % 60).toString().padStart(2, '0')
    return `${hours}:${mins}:${secs}`
  }

  // Format time HH:MM AM/PM
  const formatTime = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Handle Punch In / Resume
  const handleCheckIn = async () => {
    try {
      setActionLoading(true)
      const res = await checkIn()
      showSuccess(res.message || 'Punched in! Work session started.')
      setMorningModalOpen(false)
      fetchStatus()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to punch in'
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Punch Out / End Shift
  const handleCheckOut = async () => {
    try {
      setActionLoading(true)
      const res = await checkOut()
      showSuccess(res.message || 'Checked out successfully!')
      setCheckOutModalOpen(false)
      fetchStatus()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to check out'
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Start Break (from Modal)
  const handleStartBreak = async () => {
    try {
      setActionLoading(true)
      const selectedNote = customBreakReason.trim() || breakNote || 'Break / Step out'
      const res = await toggleBreak(selectedNote)
      showSuccess(res.message || 'Break started. Enjoy your break!')
      setBreakModalOpen(false)
      setCustomBreakReason('')
      fetchStatus()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to start break'
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Resume From Break
  const handleResumeFromBreak = async () => {
    try {
      setActionLoading(true)
      const res = await toggleBreak()
      showSuccess(res.message || 'Welcome back! Work session resumed.')
      fetchStatus()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resume work'
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return null

  const punches = todayAttendance?.punches || []
  const activeBreakPunch = todayAttendance?.isOnBreak
    ? punches.slice().reverse().find((p) => p.type === 'break' && !p.punchOut)
    : null

  const totalBreakMinutes = todayAttendance?.totalBreakMinutes || 0

  return (
    <div style={{ position: 'relative' }}>
      {/* Header Bar Widget */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 24,
        padding: '3px 10px',
        fontSize: 12,
        fontWeight: 600,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}>
        {/* State 1: Not checked in today */}
        {!todayAttendance?.checkIn ? (
          <button
            onClick={() => setMorningModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#c0392b', color: '#fff', border: 'none',
              borderRadius: 16, padding: '5px 12px', fontSize: 12,
              fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(192, 57, 43, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <Play size={13} fill="#fff" />
            <span>Check In</span>
          </button>
        ) : !todayAttendance.isCurrentlyPunchedIn ? (
          /* State 2: Checked out / Shift Paused, allows re-punching anytime */
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              color: '#64748b', fontSize: 12,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#94a3b8' }} />
              <span>Shift Paused ({formatTimer(elapsedSeconds)})</span>
            </span>

            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              title="Resume work session (Punch In again)"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: '#16a34a', color: '#fff', border: 'none',
                borderRadius: 14, padding: '4px 10px', fontSize: 11,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Play size={11} fill="#fff" />
              <span>Resume</span>
            </button>
          </div>
        ) : todayAttendance.isOnBreak ? (
          /* State 3: Currently on Break */
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: '#92400e', background: '#fef3c7', borderRadius: 14,
              padding: '3px 9px', fontSize: 11, fontWeight: 700,
              border: '1px solid #fde68a',
            }}>
              <Coffee size={13} color="#d97706" />
              <span>{activeBreakPunch?.note || 'On Break'}</span>
              <span style={{
                fontFamily: 'monospace',
                background: '#fef08a',
                padding: '1px 5px',
                borderRadius: 4,
                color: '#78350f',
                fontWeight: 700,
              }}>
                {formatTimer(breakSeconds)}
              </span>
            </span>

            <button
              onClick={handleResumeFromBreak}
              disabled={actionLoading}
              title="End break & resume work session"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: '#16a34a', color: '#fff', border: 'none',
                borderRadius: 14, padding: '4px 10px', fontSize: 11,
                fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(22, 163, 74, 0.25)',
              }}
            >
              <Play size={11} fill="#fff" />
              <span>Resume Work</span>
            </button>
          </div>
        ) : (
          /* State 4: Currently Punched In & Working */
          <>
            {/* Active session indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              color: '#15803d',
              background: '#dcfce7',
              borderRadius: 14, padding: '3px 8px', fontSize: 11,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 6px #22c55e',
              }} />
              <span>Active</span>
            </div>

            {/* Live Clock Timer */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              color: '#1e293b', fontFamily: 'monospace', fontSize: 13,
            }}>
              <Clock size={13} color="#64748b" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>

            {/* Take Break button */}
            <button
              onClick={() => setBreakModalOpen(true)}
              disabled={actionLoading}
              title="Step out / take lunch or tea break"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: '#fffbeb', color: '#b45309', border: '1px solid #fef3c7',
                borderRadius: 14, padding: '4px 9px', fontSize: 11,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Coffee size={12} />
              <span>Break</span>
            </button>

            {/* Check Out button */}
            <button
              onClick={() => setCheckOutModalOpen(true)}
              disabled={actionLoading}
              title="Check out session"
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                borderRadius: 14, padding: '4px 9px', fontSize: 11,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Square size={10} fill="#dc2626" />
              <span>Check Out</span>
            </button>
          </>
        )}

        {/* Punch History Dropdown Toggle */}
        {punches.length > 0 && (
          <button
            onClick={() => setTimelineDropdownOpen(!timelineDropdownOpen)}
            title="View today's punch sessions timeline"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '2px 4px', color: '#64748b', display: 'flex', alignItems: 'center',
            }}
          >
            {timelineDropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* Punch Sessions Timeline Dropdown */}
      {timelineDropdownOpen && punches.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
          padding: 14, width: 310, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12)',
          zIndex: 100, fontSize: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>Today's Timeline</span>
            <span style={{ fontSize: 10, color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: 6 }}>
              {punches.length} {punches.length > 1 ? 'Punches' : 'Punch'}
            </span>
          </div>

          {/* Quick Summary row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
            background: '#f8fafc', padding: '8px 10px', borderRadius: 8,
            marginBottom: 10, fontSize: 11,
          }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: 10 }}>Work Logged</span>
              <strong style={{ color: '#16a34a' }}>{formatTimer(elapsedSeconds)}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: 10 }}>Total Break</span>
              <strong style={{ color: '#d97706' }}>
                {totalBreakMinutes > 0 ? `${totalBreakMinutes}m` : todayAttendance?.isOnBreak ? `${Math.floor(breakSeconds / 60)}m` : '0m'}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
            {punches.map((p, idx) => (
              <div
                key={p._id || idx}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 9px', borderRadius: 8,
                  background: p.type === 'break' ? '#fffbeb' : '#f0fdf4',
                  border: `1px solid ${p.type === 'break' ? '#fde68a' : '#dcfce7'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  {p.type === 'break' ? (
                    <Coffee size={14} color="#d97706" />
                  ) : (
                    <Clock size={14} color="#16a34a" />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, color: p.type === 'break' ? '#92400e' : '#166534', fontSize: 11.5 }}>
                      {p.note || (p.type === 'break' ? 'Break' : 'Work Session')}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>
                      {formatTime(p.punchIn)} → {p.punchOut ? formatTime(p.punchOut) : 'Active Now'}
                    </div>
                  </div>
                </div>

                <span style={{
                  fontWeight: 700,
                  color: p.type === 'break' ? '#b45309' : '#15803d',
                  fontSize: 11,
                  background: p.type === 'break' ? '#fef3c7' : '#dcfce7',
                  padding: '2px 6px',
                  borderRadius: 6,
                }}>
                  {p.punchOut ? `${p.durationMinutes || 0}m` : 'Live'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Break Selection Modal */}
      {breakModalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, maxWidth: 420, width: '100%',
            padding: 26, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
          }}>
            <button
              onClick={() => setBreakModalOpen(false)}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#94a3b8', padding: 4,
              }}
            >
              <X size={18} />
            </button>

            <div style={{
              width: 54, height: 54, borderRadius: 16,
              background: '#fef3c7', color: '#d97706',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <Coffee size={26} />
            </div>

            <h3 style={{ fontSize: 19, fontWeight: 700, color: '#0f172a', textAlign: 'center', margin: 0 }}>
              Take a Break / Step Out
            </h3>
            <p style={{ fontSize: 12.5, color: '#64748b', textAlign: 'center', marginTop: 4, marginBottom: 18 }}>
              Select your break category. Your work session will be paused and break time recorded.
            </p>

            {/* Presets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {BREAK_PRESETS.map((preset) => {
                const isSelected = breakNote === preset.note && !customBreakReason
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setBreakNote(preset.note)
                      setCustomBreakReason('')
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 12px', borderRadius: 10,
                      border: isSelected ? '2px solid #d97706' : '1px solid #e2e8f0',
                      background: isSelected ? '#fffbeb' : '#fff',
                      color: isSelected ? '#92400e' : '#334155',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer', fontSize: 12, textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{preset.icon}</span>
                    <span>{preset.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Optional Custom Reason */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                Or Custom Reason (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Doctor appointment, errands..."
                value={customBreakReason}
                onChange={(e) => setCustomBreakReason(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: '1px solid #cbd5e1', fontSize: 12, outline: 'none',
                  background: '#f8fafc',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setBreakModalOpen(false)}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 10,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStartBreak}
                disabled={actionLoading}
                style={{
                  flex: 2, padding: '10px 18px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)',
                }}
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Starting Break...</span>
                  </>
                ) : (
                  <>
                    <Coffee size={14} />
                    <span>Start Break</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Morning Work Session Modal */}
      {morningModalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, maxWidth: 440, width: '100%',
            padding: 32, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center', position: 'relative',
          }}>
            <button
              onClick={() => setMorningModalOpen(false)}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#94a3b8', padding: 4,
              }}
            >
              <X size={18} />
            </button>

            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'linear-gradient(135deg, #c0392b, #922b21)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px', boxShadow: '0 10px 20px rgba(192, 57, 43, 0.3)',
            }}>
              <Sparkles size={30} color="#fff" />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>
              Good Morning! ☀️
            </h2>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
              Ready to begin your work day at TravelZync? Punch in now to start your work session with real-time multi-session & break tracking.
            </p>

            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 14, padding: '16px 20px', margin: '20px 0',
            }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setMorningModalOpen(false)}
                style={{
                  flex: 1, padding: '11px 16px', borderRadius: 10,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Later
              </button>
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={actionLoading}
                style={{
                  flex: 2, padding: '11px 20px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #c0392b, #922b21)', color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Punching In...</span>
                  </>
                ) : (
                  <>
                    <Play size={15} fill="#fff" />
                    <span>Check In Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check Out Modal */}
      {checkOutModalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 18, maxWidth: 380, width: '100%',
            padding: 26, textAlign: 'center',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: '#fef2f2', color: '#dc2626', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
            }}>
              <Square size={22} fill="#dc2626" />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>
              End Current Work Session?
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
              You have logged <strong>{formatTimer(elapsedSeconds)}</strong> so far today. You can resume anytime if you need to continue work later.
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                type="button"
                onClick={() => setCheckOutModalOpen(false)}
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: 8,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCheckOut}
                disabled={actionLoading}
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: 8, border: 'none',
                  background: '#dc2626', color: '#fff', fontSize: 13,
                  fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Checking Out...</span>
                  </>
                ) : (
                  <span>Yes, Check Out</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
