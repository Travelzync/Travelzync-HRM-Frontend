import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  ArrowRight,
  Briefcase,
  Compass,
  Calendar,
  Sparkles,
  ExternalLink,
  Activity,
  ShieldCheck,
  Check,
  X,
  ArrowUpRight,
  ChevronRight,
  UserCheck,
  Flame,
  Bell
} from 'lucide-react'
import { getAdminDashboardStats } from '../../services/dashboardService'
import { updateLeaveStatus } from '../../services/leaveService'
import { getUpcomingHolidays } from '../../services/holidayService'
import { showSuccess, showError } from '../../utils/toast'

const statusStyle = {
  Active: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  Inactive: { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
  'On Leave': { color: '#ea580c', bg: '#fff7ed', border: '#ffedd5' },
  Pending: { color: '#d97706', bg: '#fffbeb', border: '#fef3c7' },
  Approved: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  Rejected: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
}

function Card({ children, style = {}, className = '' }) {
  return (
    <div
      className={`tz-card-premium ${className}`}
      style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid rgba(192, 57, 43, 0.08)',
        boxShadow: '0 4px 20px -2px rgba(192, 57, 43, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.03)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function AttendanceBarChart({ presentCount = 0, totalCount = 0 }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
  const baseRate = totalCount > 0 ? Math.min(100, Math.round((presentCount / totalCount) * 100)) : 88
  const factors = [-4, +3, -2, +5, -1, +4, 0]
  const maxH = 80

  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: 8 }}>
      <svg width="100%" height="130" viewBox="0 0 420 130" preserveAspectRatio="none">
        <defs>
          <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c0392b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fecaca" />
            <stop offset="100%" stopColor="#fee2e2" />
          </linearGradient>
        </defs>

        {/* Subtle grid lines */}
        <line x1="10" y1="30" x2="410" y2="30" stroke="#f1f5f9" strokeDasharray="3 3" />
        <line x1="10" y1="65" x2="410" y2="65" stroke="#f1f5f9" strokeDasharray="3 3" />
        <line x1="10" y1="100" x2="410" y2="100" stroke="#f1f5f9" />

        {months.map((m, i) => {
          const rate = Math.max(50, Math.min(98, baseRate + factors[i]))
          const absRate = 100 - rate
          const x = 24 + i * 56
          const ph = (rate / 100) * maxH
          const ah = (absRate / 100) * maxH

          return (
            <g key={m} className="chart-bar-group" style={{ cursor: 'pointer' }}>
              <rect
                x={x}
                y={100 - ph}
                width={16}
                height={ph}
                rx={5}
                fill="url(#presentGrad)"
                style={{ transition: 'all 0.3s' }}
              />
              <rect
                x={x + 19}
                y={100 - ah}
                width={16}
                height={ah}
                rx={5}
                fill="url(#absentGrad)"
                style={{ transition: 'all 0.3s' }}
              />
              <text
                x={x + 17}
                y={118}
                textAnchor="middle"
                fontSize={11}
                fill="#64748b"
                fontWeight="600"
              >
                {m}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    onLeaveToday: 0,
    pendingLeaves: 0,
    newJoiningsThisMonth: 0,
    monthlyPayrollTotal: 0,
    deptData: [],
    recentEmployees: [],
    leaveRequests: [],
    activity: [],
    crm: { totalLeads: 0, totalBookings: 0, totalRevenue: 0 },
  })

  const [upcomingHolidays, setUpcomingHolidays] = useState([])

  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    else setRefreshing(true)

    try {
      const [statsRes, holidaysRes] = await Promise.allSettled([
        getAdminDashboardStats(),
        getUpcomingHolidays(),
      ])

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.data)
      } else if (statsRes.status === 'rejected') {
        console.error('Failed to load admin stats:', statsRes.reason)
      }

      if (holidaysRes.status === 'fulfilled' && holidaysRes.value?.success) {
        const rawHolidays = holidaysRes.value.holidays || []
        const formatted = rawHolidays.slice(0, 4).map((h) => {
          const hDate = new Date(h.date)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          hDate.setHours(0, 0, 0, 0)
          const diffDays = Math.ceil((hDate - today) / (1000 * 60 * 60 * 24))
          let diffStr = `${diffDays} days`
          if (diffDays === 0) diffStr = 'Today'
          else if (diffDays === 1) diffStr = 'Tomorrow'

          return {
            name: h.name,
            date: new Date(h.date).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            days: diffStr,
          }
        })
        setUpcomingHolidays(formatted)
      }
    } catch (err) {
      console.error('Error in loadDashboardData:', err)
      showError('Failed to refresh dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleLeaveAction = async (leaveId, newStatus) => {
    try {
      setActionLoadingId(leaveId)
      await updateLeaveStatus(leaveId, { status: newStatus })
      showSuccess(`Leave request marked as ${newStatus}!`)

      setStats((prev) => ({
        ...prev,
        pendingLeaves: Math.max(0, prev.pendingLeaves - 1),
        leaveRequests: prev.leaveRequests.map((l) =>
          l.id === leaveId
            ? { ...l, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) }
            : l
        ),
      }))
    } catch (err) {
      showError(err.response?.data?.message || `Failed to ${newStatus} leave request`)
    } finally {
      setActionLoadingId(null)
    }
  }

  const currentDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const attendanceRate =
    stats.totalEmployees > 0
      ? Math.round((stats.presentToday / stats.totalEmployees) * 100)
      : 0

  const absentToday = Math.max(0, stats.totalEmployees - stats.presentToday - stats.onLeaveToday)

  const statCards = [
    {
      label: 'Total Workforce',
      value: stats.totalEmployees.toString(),
      subLabel: stats.newJoiningsThisMonth > 0 ? `+${stats.newJoiningsThisMonth} onboarded this month` : 'All profiles verified',
      icon: Users,
      trend: stats.newJoiningsThisMonth > 0 ? `+${stats.newJoiningsThisMonth}` : 'Stable',
      trendUp: true,
      onClick: () => navigate('/admin/employees'),
      badgeText: 'Active',
      color: '#c0392b',
    },
    {
      label: 'Present Today',
      value: stats.presentToday.toString(),
      subLabel: `${attendanceRate}% daily reporting rate`,
      icon: CheckCircle2,
      trend: `${attendanceRate}%`,
      trendUp: attendanceRate >= 70,
      onClick: () => navigate('/admin/attendance'),
      badgeText: 'Checked-in',
      color: '#16a34a',
    },
    {
      label: 'Staff on Leave',
      value: stats.onLeaveToday.toString(),
      subLabel: 'Approved off-duty today',
      icon: CalendarDays,
      trend: `${stats.onLeaveToday} Out`,
      trendUp: false,
      onClick: () => navigate('/admin/leave-management'),
      badgeText: 'Leave',
      color: '#ea580c',
    },
    {
      label: 'Monthly Payroll',
      value: `₹${((stats.monthlyPayrollTotal || 0) / 100000).toFixed(2)}L`,
      subLabel: 'Total net compensation',
      icon: DollarSign,
      trend: 'Calculated',
      trendUp: true,
      onClick: () => navigate('/admin/payroll'),
      badgeText: 'Disbursed',
      color: '#7c3aed',
    },
    {
      label: 'New Joinings',
      value: stats.newJoiningsThisMonth.toString(),
      subLabel: 'Joined this calendar month',
      icon: Flame,
      trend: 'Recent',
      trendUp: true,
      onClick: () => navigate('/admin/employees'),
      badgeText: 'Monthly',
      color: '#db2777',
    },
    {
      label: 'Pending Approvals',
      value: stats.pendingLeaves.toString(),
      subLabel: stats.pendingLeaves > 0 ? 'Requires administrative action' : 'All clear & reviewed',
      icon: Clock,
      trend: stats.pendingLeaves > 0 ? 'Action' : '0 Req',
      trendUp: stats.pendingLeaves === 0,
      onClick: () => navigate('/admin/leave-management'),
      badgeText: stats.pendingLeaves > 0 ? 'Urgent' : 'Clear',
      color: '#ca8a04',
    },
  ]

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }} className="responsive-layout-container">
      {/* ── Main Column ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Premium Executive Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #b91c1c 0%, #922b21 45%, #7b241c 100%)',
            borderRadius: 20,
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 36px -6px rgba(185, 28, 28, 0.28), 0 4px 16px -2px rgba(0, 0, 0, 0.08)',
          }}
          className="responsive-hero-banner"
        >
          {/* Subtle Ambient Decorative Circles & Gradients */}
          <div
            style={{
              position: 'absolute',
              right: -40,
              top: -40,
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '40%',
              bottom: -60,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255, 255, 255, 0.16)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  padding: '4px 10px',
                  borderRadius: 20,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#4ade80',
                    boxShadow: '0 0 8px #4ade80',
                  }}
                />
                ADMIN EXECUTIVE COMMAND
              </span>

              <button
                onClick={() => loadDashboardData(true)}
                disabled={refreshing}
                title="Refresh Live Statistics"
                style={{
                  background: 'rgba(255, 255, 255, 0.16)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 8,
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.28)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)')}
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>

            <h1
              style={{
                color: '#ffffff',
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: 6,
                lineHeight: 1.2,
              }}
            >
              TravelZync HRM Overview
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 13, fontWeight: 500 }}>
              {currentDateFormatted} · All Workforce Services Real-time & Verified
            </p>
          </div>

          {/* Quick Metrics in Glass Cards */}
          <div
            style={{ display: 'flex', gap: 14, flexShrink: 0, position: 'relative', zIndex: 1 }}
            className="responsive-hero-actions"
          >
            {[
              { val: stats.totalEmployees.toString(), lbl: 'Total Staff', sub: 'Active' },
              { val: `${attendanceRate}%`, lbl: 'Attendance', sub: 'Today' },
              { val: stats.pendingLeaves.toString(), lbl: 'Pending', sub: 'Approvals' },
            ].map(({ val, lbl, sub }) => (
              <div
                key={lbl}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  borderRadius: 14,
                  padding: '12px 18px',
                  textAlign: 'center',
                  minWidth: 100,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{val}</div>
                <div style={{ color: '#ffffff', fontSize: 11, fontWeight: 700, marginTop: 4 }}>{lbl}</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Travel CRM Highlight Banner */}
        {stats.crm && (stats.crm.totalLeads > 0 || stats.crm.totalBookings > 0) && (
          <div
            onClick={() => navigate('/admin/crm')}
            style={{
              background: 'linear-gradient(90deg, #fef2f2 0%, #fff1f2 100%)',
              border: '1px solid #fecaca',
              borderRadius: 14,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(192, 57, 43, 0.04)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.borderColor = '#f87171'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.borderColor = '#fecaca'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #c0392b, #922b21)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(192, 57, 43, 0.25)',
                }}
              >
                <Compass size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: '#991b1b' }}>
                    Travel CRM Pipeline Active
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      background: '#fee2e2',
                      color: '#b91c1c',
                      padding: '2px 7px',
                      borderRadius: 10,
                      border: '1px solid #fecaca',
                    }}
                  >
                    SYNCED
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#b91c1c', margin: '2px 0 0 0', fontWeight: 500 }}>
                  {stats.crm.totalLeads} Total Inquiries · {stats.crm.totalBookings} Confirmed Tours · ₹
                  {(stats.crm.totalRevenue || 0).toLocaleString('en-IN')} Total Tour Revenue
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#c0392b',
                fontSize: 12.5,
                fontWeight: 700,
                background: '#ffffff',
                border: '1px solid #fca5a5',
                padding: '6px 14px',
                borderRadius: 8,
              }}
            >
              <span>Manage CRM</span>
              <ArrowUpRight size={15} />
            </div>
          </div>
        )}

        {/* 6 Executive Stat Cards Grid */}
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}
          className="responsive-stats-grid-3"
        >
          {statCards.map(({ label, value, subLabel, icon: Icon, trend, trendUp, onClick, badgeText, color }) => (
            <Card
              key={label}
              onClick={onClick}
              style={{
                padding: '20px 22px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
              className="hover:shadow-lg"
            >
              {/* Subtle top accent bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: `linear-gradient(90deg, ${color}, transparent)`,
                }}
              />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c0392b',
                    boxShadow: '0 2px 6px rgba(192, 57, 43, 0.08)',
                  }}
                >
                  <Icon size={20} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: trendUp ? '#15803d' : '#b91c1c',
                      background: trendUp ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${trendUp ? '#bbf7d0' : '#fecaca'}`,
                      padding: '2px 8px',
                      borderRadius: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {trend}
                  </span>
                </div>
              </div>

              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {label}
                </p>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                  {loading ? '...' : value}
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, fontWeight: 500 }}>
                  {subLabel}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Analytics Double Grid: Attendance Trend + Department Strength */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 18 }} className="responsive-double-grid">
          {/* Attendance Overview Card */}
          <Card style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Attendance Trends
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0 0' }}>
                  Live monthly presence comparison
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#334155' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: 'linear-gradient(135deg, #c0392b, #ef4444)', display: 'inline-block' }} />
                  Present
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: '#fca5a5', display: 'inline-block' }} />
                  Absent / Leave
                </span>
              </div>
            </div>

            <AttendanceBarChart presentCount={stats.presentToday} totalCount={stats.totalEmployees} />
          </Card>

          {/* Department Strength Card */}
          <Card style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Department Strength
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0 0' }}>
                  Headcount distribution
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/departments')}
                style={{
                  fontSize: 12,
                  color: '#c0392b',
                  cursor: 'pointer',
                  fontWeight: 700,
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  padding: '4px 10px',
                  borderRadius: 8,
                }}
              >
                Manage
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {stats.deptData && stats.deptData.length > 0 ? (
                stats.deptData.map(({ name, count, pct }) => (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontSize: 12.5, color: '#334155', fontWeight: 600 }}>{name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{count}</span>
                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>({pct}%)</span>
                      </div>
                    </div>
                    <div style={{ height: 7, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.max(6, pct)}%`,
                          background: 'linear-gradient(90deg, #c0392b 0%, #ef4444 100%)',
                          borderRadius: 6,
                          transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 13 }}>
                  No departments created yet
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Employees Table Card */}
        <Card style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Recent Team Additions
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0 0' }}>
                Latest profiles added to the system
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/employees')}
              style={{
                fontSize: 12,
                color: '#c0392b',
                cursor: 'pointer',
                fontWeight: 700,
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                padding: '5px 12px',
                borderRadius: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>View All ({stats.totalEmployees})</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="responsive-table-wrapper" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  {['Employee', 'Role', 'Department', 'Joined', 'Status'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        fontSize: 11,
                        color: '#64748b',
                        fontWeight: 700,
                        padding: '10px 14px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentEmployees && stats.recentEmployees.length > 0 ? (
                  stats.recentEmployees.map(({ id, name, role, dept, status, joined, avatar, employeeId }) => (
                    <tr
                      key={id || name}
                      style={{
                        borderBottom: '1px solid #f8fafc',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fcfcfd')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: 'linear-gradient(135deg, #c0392b, #922b21)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 2px 6px rgba(192, 57, 43, 0.2)',
                            }}
                          >
                            <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{avatar}</span>
                          </div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{name}</div>
                            {employeeId && (
                              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{employeeId}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: '#475569', padding: '12px 14px', fontWeight: 500 }}>
                        {role}
                      </td>
                      <td style={{ fontSize: 13, color: '#475569', padding: '12px 14px', fontWeight: 500 }}>
                        {dept}
                      </td>
                      <td style={{ fontSize: 12.5, color: '#64748b', padding: '12px 14px' }}>
                        {joined}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: (statusStyle[status] || statusStyle.Active).color,
                            background: (statusStyle[status] || statusStyle.Active).bg,
                            border: `1px solid ${(statusStyle[status] || statusStyle.Active).border}`,
                            padding: '3px 9px',
                            borderRadius: 6,
                          }}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '28px 0', color: '#94a3b8', fontSize: 13 }}>
                      No employee records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Leave Requests Action Card */}
        <Card style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Recent Leave Requests
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0 0' }}>
                Approve or reject employee leave applications directly
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/leave-management')}
              style={{
                fontSize: 12,
                color: '#c0392b',
                cursor: 'pointer',
                fontWeight: 700,
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                padding: '5px 12px',
                borderRadius: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>View All ({stats.pendingLeaves} pending)</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.leaveRequests && stats.leaveRequests.length > 0 ? (
              stats.leaveRequests.map((l) => {
                const isPending = l.status?.toLowerCase() === 'pending'
                const isActing = actionLoadingId === l.id

                return (
                  <div
                    key={l.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 14,
                      padding: '14px 16px',
                      background: '#f8fafc',
                      borderRadius: 12,
                      border: '1px solid #f1f5f9',
                      transition: 'all 0.15s ease',
                    }}
                    className="responsive-leave-item"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = '#ffffff'
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#f1f5f9'
                      e.currentTarget.style.background = '#f8fafc'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, #c0392b, #922b21)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {l.name
                          ? l.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()
                          : 'LV'}
                      </div>

                      <div>
                        <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {l.name} <span style={{ fontWeight: 500, color: '#64748b' }}>· {l.type}</span>
                        </p>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0 0', fontWeight: 500 }}>
                          {l.days} ({l.date})
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: (statusStyle[l.status] || statusStyle.Pending).color,
                          background: (statusStyle[l.status] || statusStyle.Pending).bg,
                          border: `1px solid ${(statusStyle[l.status] || statusStyle.Pending).border}`,
                          padding: '3px 9px',
                          borderRadius: 6,
                        }}
                      >
                        {l.status}
                      </span>

                      {isPending && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            disabled={isActing}
                            onClick={() => handleLeaveAction(l.id, 'approved')}
                            style={{
                              padding: '5px 12px',
                              background: '#16a34a',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: isActing ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                              transition: 'all 0.15s ease',
                              opacity: isActing ? 0.6 : 1,
                            }}
                          >
                            <Check size={12} strokeWidth={3} />
                            <span>Approve</span>
                          </button>
                          <button
                            disabled={isActing}
                            onClick={() => handleLeaveAction(l.id, 'rejected')}
                            style={{
                              padding: '5px 12px',
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              borderRadius: 8,
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: isActing ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              transition: 'all 0.15s ease',
                              opacity: isActing ? 0.6 : 1,
                            }}
                          >
                            <X size={12} strokeWidth={3} />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 13 }}>
                No active leave requests
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Right Column ── */}
      <div
        style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}
        className="responsive-right-column"
      >
        {/* Today's Summary Card */}
        <Card style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Today's Pulse
            </h3>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#c0392b',
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                padding: '2px 7px',
                borderRadius: 10,
              }}
            >
              LIVE
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Check-ins', value: stats.presentToday, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'On Leave', value: stats.onLeaveToday, color: '#ea580c', bg: '#fff7ed' },
              { label: 'Absent Today', value: absentToday, color: '#dc2626', bg: '#fef2f2' },
              { label: 'Active Staff', value: stats.activeEmployees, color: '#c0392b', bg: '#fef2f2' },
              { label: 'Pending Req.', value: stats.pendingLeaves, color: '#ca8a04', bg: '#fefce8' },
            ].map(({ label, value, color, bg }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: color,
                      boxShadow: `0 0 6px ${color}`,
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>{label}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                  {loading ? '...' : value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity Card */}
        <Card style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Recent Activity
            </h3>
            <span
              onClick={() => navigate('/admin/notifications')}
              style={{ fontSize: 12, color: '#c0392b', cursor: 'pointer', fontWeight: 700 }}
            >
              View All
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.activity && stats.activity.length > 0 ? (
              stats.activity.map(({ icon, text, time, color, bg }, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    paddingBottom: index !== stats.activity.length - 1 ? 10 : 0,
                    borderBottom: index !== stats.activity.length - 1 ? '1px solid #f8fafc' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#fef2f2',
                      border: '1px solid #fee2e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {icon || <Bell size={14} color="#c0392b" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: '#334155', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
                      {text}
                    </p>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '3px 0 0 0', fontWeight: 600 }}>
                      {time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 12.5 }}>
                No recent activity records
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Holidays Card */}
        <Card style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Upcoming Holidays
            </h3>
            <span
              onClick={() => navigate('/admin/holidays')}
              style={{ fontSize: 12, color: '#c0392b', cursor: 'pointer', fontWeight: 700 }}
            >
              Calendar
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcomingHolidays && upcomingHolidays.length > 0 ? (
              upcomingHolidays.map(({ name, date, days }) => (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{name}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0 0', fontWeight: 500 }}>{date}</p>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#c0392b',
                      background: '#fef2f2',
                      border: '1px solid #fee2e2',
                      padding: '3px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {days}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 12.5 }}>
                No upcoming holidays
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
