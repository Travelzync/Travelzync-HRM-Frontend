import { useState, useEffect, useMemo } from 'react'
import {
  Clock, Search, Calendar, User, Building2, CheckCircle2,
  AlertCircle, Edit2, X, Loader2, Filter, Activity, TrendingUp,
  Coffee, Eye
} from 'lucide-react'
import { getAllAttendance, updateAttendance } from '../../services/attendanceService'
import { showSuccess, showError, showWarning } from '../../utils/toast'

export default function Attendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedRecordForTimeline, setSelectedRecordForTimeline] = useState(null)

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [editForm, setEditForm] = useState({
    status: 'present',
    checkIn: '',
    checkOut: '',
    activeMinutes: 0,
    idleMinutes: 0,
    totalBreakMinutes: 0,
    totalSessionMinutes: 0,
    remarks: '',
  })

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const res = await getAllAttendance()
      if (res?.attendance) {
        setAttendanceRecords(res.attendance)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load attendance records'
      showError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  // Date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Time formatter
  const formatTime = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Minutes to Xh Ym
  const formatMinutes = (mins) => {
    if (!mins || mins <= 0) return '0m'
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  // Summary Metrics
  const totalCount = attendanceRecords.length
  const todayStr = new Date().toISOString().split('T')[0]
  const todayRecords = attendanceRecords.filter((r) => {
    return r.date && r.date.split('T')[0] === todayStr
  })
  const presentTodayCount = todayRecords.filter((r) => r.status === 'present').length
  const totalActiveMins = attendanceRecords.reduce((acc, r) => acc + (r.activeMinutes || 0), 0)
  const totalIdleMins = attendanceRecords.reduce((acc, r) => acc + (r.idleMinutes || 0), 0)
  const totalBreakMins = attendanceRecords.reduce((acc, r) => acc + (r.totalBreakMinutes || 0), 0)
  const avgActiveMins = totalCount > 0 ? Math.round(totalActiveMins / totalCount) : 0

  // Filter list
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((row) => {
      const emp = row.employeeId
      const empName = emp?.userId?.name || ''
      const empId = emp?.userId?.employeeId || ''
      const dept = emp?.departmentId?.name || ''
      const dateStr = formatDate(row.date)
      const dateIso = row.date ? row.date.split('T')[0] : ''

      const matchesSearch =
        empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dateStr.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || row.status === statusFilter
      const matchesDate = !selectedDate || dateIso === selectedDate

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [attendanceRecords, searchQuery, statusFilter, selectedDate])

  // Open Edit Modal
  const handleOpenEdit = (record) => {
    setSelectedRecord(record)
    setEditForm({
      status: record.status || 'present',
      checkIn: record.checkIn ? new Date(record.checkIn).toISOString().slice(0, 16) : '',
      checkOut: record.checkOut ? new Date(record.checkOut).toISOString().slice(0, 16) : '',
      activeMinutes: record.activeMinutes || record.totalSessionMinutes || 0,
      idleMinutes: record.idleMinutes || 0,
      totalBreakMinutes: record.totalBreakMinutes || 0,
      totalSessionMinutes: record.totalSessionMinutes || 0,
      remarks: record.remarks || '',
    })
    setEditModalOpen(true)
  }

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRecord) return

    try {
      setActionLoading(true)
      const payload = {
        status: editForm.status,
        remarks: editForm.remarks,
        activeMinutes: Number(editForm.activeMinutes),
        idleMinutes: Number(editForm.idleMinutes),
        totalBreakMinutes: Number(editForm.totalBreakMinutes),
        totalSessionMinutes: Number(editForm.totalSessionMinutes),
      }
      if (editForm.checkIn) payload.checkIn = new Date(editForm.checkIn).toISOString()
      if (editForm.checkOut) payload.checkOut = new Date(editForm.checkOut).toISOString()

      const res = await updateAttendance(selectedRecord._id, payload)
      showSuccess(res.message || 'Attendance record updated successfully!')
      setEditModalOpen(false)
      setSelectedRecord(null)
      fetchAttendance()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update attendance record'
      showError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      {/* Header Banner */}
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
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
            Attendance & Multi-Session Management
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0' }}>
            Monitor real-time employee check-ins, multi-session punches, and breaks across departments.
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 12,
          padding: '10px 18px',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Present Today</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{presentTodayCount} Staff</div>
          </div>
          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Total Logs</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{totalCount}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
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
            <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 10 }}>Productive</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>
            {formatMinutes(totalActiveMins)}
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Total Active Hours</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              <Activity size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: 10 }}>Inactive</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>
            {formatMinutes(totalIdleMins)}
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Total Inactive / Idle</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Coffee size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: 10 }}>Breaks</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>
            {formatMinutes(totalBreakMins)}
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Total Breaks Logged</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
              <TrendingUp size={17} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#c0392b', background: '#fee2e2', padding: '2px 8px', borderRadius: 10 }}>Avg</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '12px 0 2px 0' }}>
            {formatMinutes(avgActiveMins)}
          </h3>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Avg Daily Productive Time</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        overflow: 'hidden',
      }}>
        {/* Controls */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 8, padding: '7px 12px', width: 260,
          }}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search employee, ID, dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: 12, color: '#334155', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {/* Date picker */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '6px 12px', borderRadius: 8,
                border: '1px solid #e2e8f0', background: '#f8fafc',
                fontSize: 12, color: '#334155', outline: 'none',
              }}
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '6px 12px', borderRadius: 8,
                border: '1px solid #e2e8f0', background: '#f8fafc',
                fontSize: 12, color: '#334155', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="ALL">All Status</option>
              <option value="present">Present</option>
              <option value="half-day">Half-Day</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
              <option value="holiday">Holiday</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13 }}>Loading attendance logs...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <Clock size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>No attendance logs found</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Employee</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Department</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Punch In</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Punch Out</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Active Time</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Idle Time</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Break Time</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Total Work</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'center' }}>Sessions</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((row) => {
                  const emp = row.employeeId
                  const empName = emp?.userId?.name || 'Unknown Staff'
                  const empId = emp?.userId?.employeeId || '-'
                  const dept = emp?.departmentId?.name || '-'
                  const punchCount = row.punches?.length || 1

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
                      <td style={{ padding: '14px 18px', color: '#1e293b', fontWeight: 500 }}>
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
                          title="Audit employee punch & break sessions"
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
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenEdit(row)}
                          title="Edit Attendance"
                          style={{
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: 8,
                            padding: 6,
                            cursor: 'pointer',
                            color: '#475569',
                          }}
                        >
                          <Edit2 size={14} />
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

      {/* Punch & Break Audit Modal */}
      {selectedRecordForTimeline && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 18, maxWidth: 500, width: '100%',
            padding: 24, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Employee Punch & Break Audit
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0 0' }}>
                  {selectedRecordForTimeline.employeeId?.userId?.name} ({selectedRecordForTimeline.employeeId?.userId?.employeeId}) • {formatDate(selectedRecordForTimeline.date)}
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

      {/* Edit Record Modal */}
      {editModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            maxWidth: 500,
            width: '100%',
            padding: 24,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Edit Attendance Record
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    border: '1px solid #cbd5e1', fontSize: 13, outline: 'none',
                  }}
                >
                  <option value="present">Present</option>
                  <option value="half-day">Half-Day</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Punch In Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.checkIn}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, checkIn: e.target.value }))}
                    style={{
                      width: '100%', padding: '8px 10px', borderRadius: 8,
                      border: '1px solid #cbd5e1', fontSize: 12, outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Punch Out Time
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.checkOut}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, checkOut: e.target.value }))}
                    style={{
                      width: '100%', padding: '8px 10px', borderRadius: 8,
                      border: '1px solid #cbd5e1', fontSize: 12, outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Active Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.activeMinutes}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, activeMinutes: e.target.value }))}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8,
                      border: '1px solid #cbd5e1', fontSize: 13, outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Idle Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.idleMinutes}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, idleMinutes: e.target.value }))}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8,
                      border: '1px solid #cbd5e1', fontSize: 13, outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Break Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.totalBreakMinutes}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, totalBreakMinutes: e.target.value }))}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8,
                      border: '1px solid #cbd5e1', fontSize: 13, outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Total Session Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.totalSessionMinutes}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, totalSessionMinutes: e.target.value }))}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8,
                      border: '1px solid #cbd5e1', fontSize: 13, outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Remarks
                </label>
                <textarea
                  rows="2"
                  value={editForm.remarks}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Optional admin adjustment notes..."
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid #cbd5e1', fontSize: 13, outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                    background: '#fff', fontSize: 13, fontWeight: 500, color: '#64748b', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    padding: '8px 18px', borderRadius: 8, border: 'none',
                    background: 'linear-gradient(135deg, #c0392b, #922b21)',
                    fontSize: 13, fontWeight: 600, color: '#fff', cursor: actionLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {actionLoading ? 'Saving...' : 'Save Adjustments'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
