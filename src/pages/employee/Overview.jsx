import { useState, useEffect } from 'react'
import { CheckSquare, Workflow, FileText, BarChart2, CalendarDays, ClipboardList, Plus, Circle } from 'lucide-react'

const statCards = [
  { label: 'Total Working Days', value: '22', sub: 'This Month', color: '#ef4444', bg: '#fef2f2', icon: '📅' },
  { label: 'Present Days', value: '18', sub: 'This Month', color: '#f97316', bg: '#fff7ed', icon: '⏰' },
  { label: 'Overtime Hours', value: '14h 30m', sub: 'This Month', color: '#eab308', bg: '#fefce8', icon: '⏱' },
  { label: 'Leave Balance', value: '17', sub: 'Days Left', color: '#22c55e', bg: '#f0fdf4', icon: '✅' },
]

const tasks = [
  { title: 'Design HR Dashboard', date: '25 Aug', priority: 'High', color: '#ef4444' },
  { title: 'Fix Attendance Bug', date: '26 Aug', priority: 'Medium', color: '#f97316' },
  { title: 'API Integration', date: '28 Aug', priority: 'Low', color: '#22c55e' },
  { title: 'Code Review', date: '30 Aug', priority: 'Medium', color: '#f97316' },
]

const notifications = [
  { icon: '✅', title: 'Leave Approved', time: '2h ago', color: '#22c55e', bg: '#f0fdf4' },
  { icon: '📄', title: 'Payslip Available', time: '5h ago', color: '#8b5cf6', bg: '#f5f3ff' },
  { icon: '📅', title: 'Upcoming Holiday', time: '1d ago', color: '#f97316', bg: '#fff7ed' },
  { icon: '👥', title: 'Team Meeting', time: '1d ago', color: '#3b82f6', bg: '#eff6ff' },
]

const quickActions = [
  { label: 'Apply Leave', icon: CalendarDays, color: '#ef4444', bg: '#fef2f2' },
  { label: 'Attendance Req', icon: ClipboardList, color: '#f97316', bg: '#fff7ed' },
  { label: 'My Payslips', icon: FileText, color: '#8b5cf6', bg: '#f5f3ff' },
  { label: 'TaskFlow', icon: Workflow, color: '#3b82f6', bg: '#eff6ff' },
  { label: 'Meeting Hub', icon: CheckSquare, color: '#22c55e', bg: '#f0fdf4' },
  { label: 'Reports', icon: BarChart2, color: '#ec4899', bg: '#fdf2f8' },
]

const workHistory = [
  { day: 'Sun', work: 30, ot: 10 },
  { day: 'Mon', work: 75, ot: 20 },
  { day: 'Tue', work: 85, ot: 30 },
  { day: 'Wed', work: 80, ot: 25 },
  { day: 'Thu', work: 82, ot: 28 },
  { day: 'Fri', work: 78, ot: 22 },
  { day: 'Sat', work: 60, ot: 15 },
]

function Card({ children, className = '', style = {} }) {
  return (
    <div 
      className={`bg-white rounded-2xl border border-[#f1f5f9] shadow-sm ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

function ClockTimer() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const h = String(time.getHours()).padStart(2, '0')
  const m = String(time.getMinutes()).padStart(2, '0')
  const s = String(time.getSeconds()).padStart(2, '0')
  const pct = ((time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds()) / 86400) * 100
  const r = 54, circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
      <svg width={140} height={140} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={70} cy={70} r={r} fill="none" stroke="#f1f5f9" strokeWidth={10} />
        <circle cx={70} cy={70} r={r} fill="none" stroke="#ef4444" strokeWidth={10}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ marginTop: -100, textAlign: 'center', zIndex: 1, position: 'relative' }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: 1 }}>{h}:{m}:{s}</p>
        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Working Hours</p>
      </div>
      <div style={{ height: 60 }} />
    </div>
  )
}

function MiniChart() {
  const maxH = 80
  const points = workHistory.map((d, i) => {
    const x = 30 + i * 60
    const y = 120 - (d.work / 100) * maxH
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `30,120 ${points} ${30 + 6 * 60},120`

  return (
    <svg width="100%" height="130" viewBox="0 0 450 130" preserveAspectRatio="none">
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#wg)" />
      <polyline points={points} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round" />
      {workHistory.map((d, i) => (
        <circle key={i} cx={30 + i * 60} cy={120 - (d.work / 100) * maxH} r={4} fill="#ef4444" />
      ))}
      {workHistory.map((d, i) => (
        <text key={i} x={30 + i * 60} y={128} textAnchor="middle" fontSize={10} fill="#94a3b8">{d.day}</text>
      ))}
    </svg>
  )
}

function DonutChart() {
  const present = 81, absent = 14, leave = 5
  const r = 52, circ = 2 * Math.PI * r
  const p1 = (present / 100) * circ
  const p2 = (absent / 100) * circ
  const p3 = (leave / 100) * circ
  const off1 = 0
  const off2 = circ - p1
  const off3 = circ - p1 - p2

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={65} cy={65} r={r} fill="none" stroke="#f1f5f9" strokeWidth={14} />
          <circle cx={65} cy={65} r={r} fill="none" stroke="#22c55e" strokeWidth={14}
            strokeDasharray={`${p1} ${circ}`} strokeDashoffset={-off1} />
          <circle cx={65} cy={65} r={r} fill="none" stroke="#ef4444" strokeWidth={14}
            strokeDasharray={`${p2} ${circ}`} strokeDashoffset={-off2} />
          <circle cx={65} cy={65} r={r} fill="none" stroke="#eab308" strokeWidth={14}
            strokeDasharray={`${p3} ${circ}`} strokeDashoffset={-off3} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>81%</p>
          <p style={{ fontSize: 10, color: '#94a3b8' }}>Attendance</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: 'Present', val: 18, pct: '81%', color: '#22c55e' },
          { label: 'Absent', val: 3, pct: '14%', color: '#ef4444' },
          { label: 'Leave', val: 1, pct: '5%', color: '#eab308' },
        ].map(({ label, val, pct, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#374151', minWidth: 50 }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{val}</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>({pct})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Overview() {
  return (
    <div className="flex flex-col xl:flex-row gap-5 items-start w-full">

      {/* ── Main Column ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 w-full">

        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-[#c0392b] to-[#922b21] rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden w-full">
          <div style={{
            position: 'absolute', right: -30, top: -30,
            width: 180, height: 180, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: '3px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: 28, fontWeight: 700, color: '#fff',
            position: 'relative',
          }}>
            A
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 12, height: 12, borderRadius: '50%',
              background: '#22c55e', border: '2px solid #fff',
            }} />
          </div>
          <div className="flex-1 text-center sm:text-left z-10">
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 4 }}>Good Evening 🔥</p>
            <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>JOHN DOE</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>MERN STACK DEVELOPER · ID: TZ-2458</p>
          </div>
          <div className="flex flex-wrap gap-2.5 w-full sm:w-auto justify-center sm:justify-end z-10">
            <button style={{
              padding: '8px 16px', borderRadius: 8,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Checked In
            </button>
            <button style={{
              padding: '8px 16px', borderRadius: 8,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
              Profile 72% ↻
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
          {statCards.map(({ label, value, sub, color, bg, icon }) => (
            <Card key={label} className="p-4 sm:p-5">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{sub}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Clock + Work History */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-4 w-full">
          <Card className="p-5">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Clock In / Out</p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>📅 Fri, 25 Aug 2026</p>
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8', background: '#f8fafc', padding: '3px 8px', borderRadius: 6 }}>● Inactive</span>
            </div>
            <ClockTimer />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
              <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px' }}>
                <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 3 }}>CLOCK IN</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>09:07 AM</p>
              </div>
              <div style={{ background: '#fef2f2', borderRadius: 8, padding: '10px 12px' }}>
                <p style={{ fontSize: 10, color: '#94a3b8', marginBottom: 3 }}>CLOCK OUT</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>06:13 PM</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Work History</p>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>Weekly Overview</p>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />Work</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fca5a5', display: 'inline-block' }} />OT</span>
              </div>
            </div>
            <MiniChart />
          </Card>
        </div>

        {/* Tasks + Attendance Summary + Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {/* My Tasks */}
          <Card className="p-5">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>My Tasks</p>
              <span style={{ fontSize: 12, color: '#ef4444', cursor: 'pointer' }}>View All</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.map(({ title, date, priority, color }) => (
                <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Circle size={15} color="#d1d5db" style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{title}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{date}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color, background: color + '18', padding: '2px 7px', borderRadius: 5 }}>● {priority}</span>
                </div>
              ))}
            </div>
            <button style={{
              marginTop: 14, width: '100%', padding: '9px',
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Plus size={14} /> New Task
            </button>
          </Card>

          {/* Attendance Summary */}
          <Card className="p-5">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Attendance Summary</p>
              <span style={{ fontSize: 12, color: '#94a3b8', background: '#f8fafc', padding: '3px 8px', borderRadius: 6, cursor: 'pointer' }}>This Month ▾</span>
            </div>
            <DonutChart />
          </Card>

          {/* Quick Actions */}
          <Card className="p-5">
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Quick Actions</p>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map(({ label, icon: Icon, color, bg }) => (
                <button key={label} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '12px 6px', borderRadius: 10, border: '1px solid #f1f5f9',
                  background: '#fff', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color={color} />
                  </div>
                  <span style={{ fontSize: 10, color: '#374151', fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Right Column ── */}
      <div className="w-full xl:w-[260px] shrink-0 flex flex-col gap-4">

        {/* Upcoming Holiday */}
        <Card className="p-5">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>🎉</span>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Upcoming Holiday</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>ONAM</p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>25 Aug 2026</p>
            </div>
            <span style={{ fontSize: 32 }}>🪔</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Days Remaining</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>17 Days</span>
          </div>
          <button style={{
            width: '100%', padding: '10px',
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            View Holiday Calendar →
          </button>
        </Card>

        {/* Recent Notifications */}
        <Card className="p-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Recent Notifications</p>
            <span style={{ fontSize: 12, color: '#ef4444', cursor: 'pointer' }}>View All</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifications.map(({ icon, title, time, color, bg }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                  {icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', lineHeight: 1 }}>{title}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
