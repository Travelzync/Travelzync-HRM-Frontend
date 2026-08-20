import { Users, Clock, CalendarDays, DollarSign, TrendingUp, TrendingDown, MoreHorizontal, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

const statCards = [
  { label: 'Total Employees', value: '248', change: '+12', up: true, icon: '👥', color: '#3b82f6', bg: '#eff6ff' },
  { label: 'Present Today', value: '214', change: '+5', up: true, icon: '✅', color: '#22c55e', bg: '#f0fdf4' },
  { label: 'On Leave', value: '18', change: '-3', up: false, icon: '🏖️', color: '#f97316', bg: '#fff7ed' },
  { label: 'Monthly Payroll', value: '₹18.4L', change: '+2.1%', up: true, icon: '💰', color: '#8b5cf6', bg: '#f5f3ff' },
  { label: 'New Joinings', value: '7', change: 'This Month', up: true, icon: '🎉', color: '#ec4899', bg: '#fdf2f8' },
  { label: 'Pending Leaves', value: '12', change: 'Approval', up: false, icon: '⏳', color: '#eab308', bg: '#fefce8' },
]

const recentEmployees = [
  { name: 'Aswin C', role: 'MERN Developer', dept: 'Engineering', status: 'Active', joined: '01 Jan 2024', avatar: 'AC' },
  { name: 'Priya R', role: 'UI Designer', dept: 'Design', status: 'Active', joined: '15 Feb 2024', avatar: 'PR' },
  { name: 'Rahul M', role: 'HR Manager', dept: 'HR', status: 'Active', joined: '10 Mar 2024', avatar: 'RM' },
  { name: 'Sneha K', role: 'QA Engineer', dept: 'Testing', status: 'On Leave', joined: '20 Apr 2024', avatar: 'SK' },
  { name: 'Arjun T', role: 'DevOps', dept: 'Engineering', status: 'Active', joined: '05 May 2024', avatar: 'AT' },
]

const leaveRequests = [
  { name: 'Priya R', type: 'Sick Leave', days: '2 days', date: '25–26 Aug', status: 'Pending' },
  { name: 'Rahul M', type: 'Casual Leave', days: '1 day', date: '28 Aug', status: 'Approved' },
  { name: 'Sneha K', type: 'Annual Leave', days: '5 days', date: '1–5 Sep', status: 'Pending' },
  { name: 'Arjun T', type: 'WFH', days: '3 days', date: '2–4 Sep', status: 'Rejected' },
]

const deptData = [
  { name: 'Engineering', count: 85, pct: 85 },
  { name: 'Design', count: 32, pct: 32 },
  { name: 'HR', count: 18, pct: 18 },
  { name: 'Sales', count: 54, pct: 54 },
  { name: 'Testing', count: 29, pct: 29 },
]

const activity = [
  { icon: '✅', text: 'Leave approved for Rahul M', time: '10 min ago', color: '#22c55e', bg: '#f0fdf4' },
  { icon: '👤', text: 'New employee Arjun T onboarded', time: '1h ago', color: '#3b82f6', bg: '#eff6ff' },
  { icon: '💰', text: 'Payroll processed for August', time: '3h ago', color: '#8b5cf6', bg: '#f5f3ff' },
  { icon: '⚠️', text: 'Attendance anomaly: 5 employees', time: '5h ago', color: '#f97316', bg: '#fff7ed' },
  { icon: '📄', text: 'Payslips generated for 248 employees', time: '1d ago', color: '#ec4899', bg: '#fdf2f8' },
]

const statusStyle = {
  Active: { color: '#22c55e', bg: '#f0fdf4' },
  'On Leave': { color: '#f97316', bg: '#fff7ed' },
  Pending: { color: '#eab308', bg: '#fefce8' },
  Approved: { color: '#22c55e', bg: '#f0fdf4' },
  Rejected: { color: '#ef4444', bg: '#fef2f2' },
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: '1px solid #f1f5f9',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      ...style,
    }}>{children}</div>
  )
}

function BarChart() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
  const present = [88, 92, 85, 90, 87, 93, 86]
  const absent = [12, 8, 15, 10, 13, 7, 14]
  const maxH = 80

  return (
    <svg width="100%" height="110" viewBox="0 0 420 110" preserveAspectRatio="none">
      {months.map((m, i) => {
        const x = 20 + i * 56
        const ph = (present[i] / 100) * maxH
        const ah = (absent[i] / 100) * maxH
        return (
          <g key={m}>
            <rect x={x} y={90 - ph} width={18} height={ph} rx={4} fill="#ef4444" opacity="0.85" />
            <rect x={x + 20} y={90 - ah} width={18} height={ah} rx={4} fill="#fca5a5" opacity="0.7" />
            <text x={x + 18} y={106} textAnchor="middle" fontSize={9} fill="#94a3b8">{m}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }} className="responsive-layout-container">

      {/* ── Main Column ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #c0392b 0%, #922b21 100%)',
          borderRadius: 16, padding: '24px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }} className="responsive-hero-banner">
          <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 6 }}>Admin Dashboard 🛡️</p>
            <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 800, marginBottom: 6 }}>TravelZync HRM Overview</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Friday, 25 August 2026 · All systems operational</p>
          </div>
          <div style={{ display: 'flex', gap: 24, flexShrink: 0 }} className="responsive-hero-actions">
            {[{ v: '248', l: 'Employees' }, { v: '86%', l: 'Attendance' }, { v: '12', l: 'Pending' }].map(({ v, l }) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <p style={{ color: '#fff', fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{v}</p>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 4 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="responsive-stats-grid-3">
          {statCards.map(({ label, value, change, up, icon, color, bg }) => (
            <Card key={label} style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</p>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: up ? '#22c55e' : '#ef4444', background: up ? '#f0fdf4' : '#fef2f2', padding: '3px 7px', borderRadius: 6 }}>
                  {up ? '↑' : '↓'} {change}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Attendance Chart + Dept Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }} className="responsive-double-grid">
          <Card style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Attendance Overview</p>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>Monthly comparison</p>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#ef4444', display: 'inline-block' }} />Present</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#fca5a5', display: 'inline-block' }} />Absent</span>
              </div>
            </div>
            <BarChart />
          </Card>

          <Card style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Department Strength</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {deptData.map(({ name, count, pct }) => (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{name}</span>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 4 }}>
                    <div style={{ height: 6, width: `${pct}%`, background: 'linear-gradient(90deg, #ef4444, #c0392b)', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Employees Table */}
        <Card style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Recent Employees</p>
            <span style={{ fontSize: 12, color: '#ef4444', cursor: 'pointer' }}>View All</span>
          </div>
          <div className="responsive-table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {['Employee', 'Role', 'Department', 'Joined', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 11, color: '#94a3b8', fontWeight: 600, padding: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentEmployees.map(({ name, role, dept, status, joined, avatar }) => (
                  <tr key={name} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '12px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #c0392b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{avatar}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: '#6b7280', padding: '12px 0' }}>{role}</td>
                    <td style={{ fontSize: 13, color: '#6b7280', padding: '12px 0' }}>{dept}</td>
                    <td style={{ fontSize: 13, color: '#6b7280', padding: '12px 0' }}>{joined}</td>
                    <td style={{ padding: '12px 0' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: statusStyle[status].color, background: statusStyle[status].bg, padding: '3px 8px', borderRadius: 6 }}>
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Leave Requests */}
        <Card style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Leave Requests</p>
            <span style={{ fontSize: 12, color: '#ef4444', cursor: 'pointer' }}>View All</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leaveRequests.map(({ name, type, days, date, status }) => (
              <div key={name + type} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 10 }} className="responsive-leave-item">
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #c0392b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{name} <span style={{ fontWeight: 400, color: '#6b7280' }}>· {type}</span></p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{days} · {date}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: statusStyle[status].color, background: statusStyle[status].bg, padding: '3px 8px', borderRadius: 6 }}>
                  {status}
                </span>
                {status === 'Pending' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ padding: '4px 10px', background: '#f0fdf4', color: '#22c55e', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Approve</button>
                    <button style={{ padding: '4px 10px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Right Column ── */}
      <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }} className="responsive-right-column">

        {/* Quick Stats */}
        <Card style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Today's Summary</p>
          {[
            { label: 'Check-ins', value: '214', color: '#22c55e' },
            { label: 'Late Arrivals', value: '8', color: '#f97316' },
            { label: 'Absent', value: '26', color: '#ef4444' },
            { label: 'WFH', value: '12', color: '#3b82f6' },
            { label: 'On Leave', value: '18', color: '#8b5cf6' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{value}</span>
            </div>
          ))}
        </Card>

        {/* Recent Activity */}
        <Card style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Recent Activity</p>
            <span style={{ fontSize: 12, color: '#ef4444', cursor: 'pointer' }}>View All</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activity.map(({ icon, text, time, color, bg }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>{text}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Holidays */}
        <Card style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Upcoming Holidays</p>
          {[
            { name: 'ONAM', date: '25 Aug 2026', days: '17 days' },
            { name: 'Gandhi Jayanti', date: '2 Oct 2026', days: '38 days' },
            { name: 'Diwali', date: '20 Oct 2026', days: '56 days' },
          ].map(({ name, date, days }) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f8fafc' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{name}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{date}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#ef4444', background: '#fef2f2', padding: '3px 8px', borderRadius: 6 }}>{days}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
