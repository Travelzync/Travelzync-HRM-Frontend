import { useState, useEffect, useMemo } from 'react'
import {
  Clock, Calendar, Activity, Zap, Search, Download,
  User, Mail, CheckCircle2, AlertCircle, XCircle,
  Award, Sparkles, TrendingUp, Loader2, Coffee, Eye, X
} from 'lucide-react'
import { getMyAttendance, getTodayAttendance } from '../../services/attendanceService'
import { getCurrentUser } from '../../services/authService'
import { showError } from '../../utils/toast'

export default function Attendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [todayRecord, setTodayRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedRecordForTimeline, setSelectedRecordForTimeline] = useState(null)

  const user = getCurrentUser()

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const [historyRes, todayRes] = await Promise.all([
        getMyAttendance(),
        getTodayAttendance(),
      ])

      if (historyRes?.attendance) {
        setAttendanceRecords(historyRes.attendance)
      }
      if (todayRes?.attendance) {
        setTodayRecord(todayRes.attendance)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load attendance history'
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Format time helper
  const formatTime = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Format minutes into Xh Ym
  const formatMinutes = (mins) => {
    if (!mins || mins <= 0) return '0m'
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  // Metric computations
  const totalDays = attendanceRecords.length
  const presentDays = attendanceRecords.filter((r) => r.status === 'present').length
  const totalActiveMinutes = attendanceRecords.reduce((acc, r) => acc + (r.activeMinutes || 0), 0)
  const totalIdleMinutes = attendanceRecords.reduce((acc, r) => acc + (r.idleMinutes || 0), 0)
  const totalBreakMinutes = attendanceRecords.reduce((acc, r) => acc + (r.totalBreakMinutes || 0), 0)
  const avgActiveMinutes = totalDays > 0 ? Math.round(totalActiveMinutes / totalDays) : 0

  // Filtered rows
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((row) => {
      const dateStr = formatDate(row.date)
      const statusStr = row.status || ''
      const remarks = row.remarks || ''

      const matchesSearch =
        dateStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        statusStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        remarks.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || row.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [attendanceRecords, searchQuery, statusFilter])

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'EM'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* 1. Header Profile Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #c0392b 0%, #922b21 60%, #7b241c 100%)',
        borderRadius: 16,
        padding: '24px 28px',
        color: '#fff',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        boxShadow: '0 4px 12px rgba(192, 57, 43, 0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              <span style={{ color: '#c0392b', fontWeight: 800, fontSize: 22 }}>
                {userInitials}
              </span>
            </div>
            <span style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 14, height: 14, borderRadius: '50%',
              background: todayRecord?.isCurrentlyPunchedIn
                ? (todayRecord.isOnBreak ? '#d97706' : '#22c55e')
                : '#94a3b8',
              border: '2px solid #fff',
            }} />
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{user?.name || 'Employee'}</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '2px 0 8px 0' }}>
              {user?.role === 'admin' ? 'Administrator' : 'TravelZync Staff'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {user?.employeeId && (
                <span style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 6, padding: '3px 8px', fontSize: 11,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  <User size={12} /> {user.employeeId}
                </span>
              )}
              <span style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 6, padding: '3px 8px', fontSize: 11,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <Mail size={12} /> {user?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Current Punch State Pill */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: 12,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {todayRecord?.isOnBreak ? (
              <Coffee size={20} color="#fde68a" />
            ) : (
              <Zap size={20} color="#fff" />
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Current Status
            </div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {todayRecord?.isCurrentlyPunchedIn
                ? (todayRecord.isOnBreak ? 'On Break' : 'Punched In (Active)')
                : todayRecord?.checkIn
                  ? 'Shift Paused'
                  : 'Not Punched In'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI Summary Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
      }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
              <Clock size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 10 }}>Live</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>
            {formatMinutes(todayRecord?.activeMinutes || todayRecord?.totalSessionMinutes || 0)}
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Active Hours Today</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
              <Activity size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#c0392b', background: '#fef2f2', padding: '2px 8px', borderRadius: 10 }}>Sessions</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>
            {todayRecord?.punches?.length || (todayRecord?.checkIn ? 1 : 0)}
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Total Punches Today</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Coffee size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: 10 }}>Breaks</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>
            {formatMinutes(todayRecord?.totalBreakMinutes || 0)}
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Break Time Today</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <CheckCircle2 size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: 10 }}>
              {totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100}%
            </span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>
            {presentDays} Days
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Total Days Present</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
              <TrendingUp size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#c0392b', background: '#fee2e2', padding: '2px 8px', borderRadius: 10 }}>Avg</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>
            {formatMinutes(avgActiveMinutes)}
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Average Productive Time</p>
        </div>
      </div>

      {/* 3. History Table Section */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        overflow: 'hidden',
      }}>
        {/* Filter Controls */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Attendance History & Multi-Sessions
            </h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0 0' }}>
              Review your daily check-in, check-out, multi-session punches, and break records.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '6px 12px',
              width: 220,
            }}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search date or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none', background: 'none', outline: 'none',
                  fontSize: 12, color: '#334155', width: '100%',
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: 12,
                color: '#334155',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Status</option>
              <option value="present">Present</option>
              <option value="half-day">Half-Day</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13 }}>Loading your attendance records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <Calendar size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>No attendance records found</p>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>
                Use the Check In button in the top bar to log today's attendance.
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Check In</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Check Out</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Active Time</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Idle Time</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Break Time</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Total Work</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'center' }}>Sessions</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((row) => {
                  const punchCount = row.punches?.length || 1
                  return (
                    <tr
                      key={row._id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1e293b' }}>
                        {formatDate(row.date)}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#10b981', fontWeight: 500 }}>
                        {formatTime(row.checkIn)}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b', fontWeight: 500 }}>
                        {formatTime(row.checkOut)}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#16a34a', fontWeight: 600 }}>
                        {formatMinutes(row.activeMinutes || row.totalSessionMinutes || 0)}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#b45309', fontWeight: 500 }}>
                        {formatMinutes(row.idleMinutes || 0)}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#d97706', fontWeight: 500 }}>
                        {row.totalBreakMinutes > 0 ? (
                          <span style={{
                            background: '#fef3c7', color: '#92400e',
                            padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                          }}>
                            ☕ {formatMinutes(row.totalBreakMinutes)}
                          </span>
                        ) : (
                          '0m'
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 600 }}>
                        {formatMinutes(row.totalSessionMinutes || 0)}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedRecordForTimeline(row)}
                          title="Inspect punch & break sessions timeline"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: '#f1f5f9', border: '1px solid #e2e8f0',
                            borderRadius: 12, padding: '3px 9px', fontSize: 11,
                            fontWeight: 600, color: '#334155', cursor: 'pointer',
                          }}
                        >
                          <Eye size={12} color="#64748b" />
                          <span>{punchCount} {punchCount > 1 ? 'Punches' : 'Punch'}</span>
                        </button>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          borderRadius: 12,
                          padding: '3px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          background:
                            row.status === 'present' ? '#dcfce7' :
                            row.status === 'half-day' ? '#fef3c7' :
                            row.status === 'leave' ? '#e0e7ff' : '#fee2e2',
                          color:
                            row.status === 'present' ? '#15803d' :
                            row.status === 'half-day' ? '#b45309' :
                            row.status === 'leave' ? '#4338ca' : '#b91c1c',
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#94a3b8', fontSize: 12 }}>
                        {row.remarks || '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 4. Punch & Break Timeline Inspection Modal */}
      {selectedRecordForTimeline && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 18, maxWidth: 480, width: '100%',
            padding: 24, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Punch & Break Timeline
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0 0' }}>
                  {formatDate(selectedRecordForTimeline.date)}
                </p>
              </div>

              <button
                onClick={() => setSelectedRecordForTimeline(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
              background: '#f8fafc', padding: '12px 14px', borderRadius: 12,
              marginBottom: 16, border: '1px solid #e2e8f0',
            }}>
              <div>
                <span style={{ fontSize: 10.5, color: '#64748b', display: 'block' }}>Total Work</span>
                <strong style={{ fontSize: 13, color: '#0f172a' }}>
                  {formatMinutes(selectedRecordForTimeline.totalSessionMinutes || 0)}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: 10.5, color: '#64748b', display: 'block' }}>Total Break</span>
                <strong style={{ fontSize: 13, color: '#d97706' }}>
                  {formatMinutes(selectedRecordForTimeline.totalBreakMinutes || 0)}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: 10.5, color: '#64748b', display: 'block' }}>Active Time</span>
                <strong style={{ fontSize: 13, color: '#16a34a' }}>
                  {formatMinutes(selectedRecordForTimeline.activeMinutes || 0)}
                </strong>
              </div>
            </div>

            {/* Timeline List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
              {(selectedRecordForTimeline.punches && selectedRecordForTimeline.punches.length > 0) ? (
                selectedRecordForTimeline.punches.map((punch, idx) => (
                  <div
                    key={punch._id || idx}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', borderRadius: 10,
                      background: punch.type === 'break' ? '#fffbeb' : '#f0fdf4',
                      border: `1px solid ${punch.type === 'break' ? '#fde68a' : '#dcfce7'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: punch.type === 'break' ? '#fef3c7' : '#dcfce7',
                        color: punch.type === 'break' ? '#d97706' : '#16a34a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {punch.type === 'break' ? <Coffee size={16} /> : <Clock size={16} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12.5, color: punch.type === 'break' ? '#92400e' : '#166534' }}>
                          {punch.note || (punch.type === 'break' ? 'Break / Step out' : `Session Punch #${idx + 1}`)}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                          {formatTime(punch.punchIn)} → {punch.punchOut ? formatTime(punch.punchOut) : 'Active Now'}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      fontSize: 11.5, fontWeight: 700,
                      color: punch.type === 'break' ? '#b45309' : '#15803d',
                      background: punch.type === 'break' ? '#fef3c7' : '#dcfce7',
                      padding: '3px 8px', borderRadius: 6,
                    }}>
                      {punch.punchOut ? `${punch.durationMinutes || 0}m` : 'Ongoing'}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{
                  padding: '12px 14px', borderRadius: 10, background: '#f8fafc',
                  border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12, color: '#1e293b' }}>Single Work Session</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {formatTime(selectedRecordForTimeline.checkIn)} → {formatTime(selectedRecordForTimeline.checkOut)}
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 12, color: '#16a34a' }}>
                    {formatMinutes(selectedRecordForTimeline.totalSessionMinutes)}
                  </span>
                </div>
              )}
            </div>

            <div style={{ marginTop: 18, textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setSelectedRecordForTimeline(null)}
                style={{
                  padding: '8px 16px', borderRadius: 8,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
