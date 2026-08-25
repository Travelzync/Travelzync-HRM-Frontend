import { useState, useMemo } from 'react'
import { 
  Clock, Calendar, Activity, Zap, Search, Download, 
  User, Mail, CheckCircle2, AlertCircle, XCircle, 
  Award, Sparkles, TrendingUp 
} from 'lucide-react'

// Mock attendance logs with unique formats (DD/MM/YYYY dates, simple check-in/out hours, and minutes breaks)
const ATTENDANCE_HISTORY = [
  { date: '22/08/2026', checkIn: '08:55 AM', status: 'Present', checkOut: '05:30 PM', breakTime: '39 mins', actualBreak: '40 mins', exceeded: '0 mins', late: '-', overtime: '30 mins', productive: '8h 35m', totalOwn: '8h 20m' },
  { date: '21/08/2026', checkIn: '08:58 AM', status: 'Present', checkOut: '05:15 PM', breakTime: '35 mins', actualBreak: '40 mins', exceeded: '0 mins', late: '-', overtime: '0 mins', productive: '8h 45m', totalOwn: '8h 20m' },
  { date: '20/08/2026', checkIn: '09:15 AM', status: 'Late', checkOut: '05:32 PM', breakTime: '29 mins', actualBreak: '40 mins', exceeded: '0 mins', late: '5 mins', overtime: '0 mins', productive: '8h 17m', totalOwn: '8h 20m' },
  { date: '19/08/2026', checkIn: '09:05 AM', status: 'Present', checkOut: '06:05 PM', breakTime: '18 mins', actualBreak: '40 mins', exceeded: '0 mins', late: '-', overtime: '0 mins', productive: '8h 47m', totalOwn: '8h 20m' },
  { date: '18/08/2026', checkIn: '09:01 AM', status: 'Present', checkOut: '07:05 PM', breakTime: '25 mins', actualBreak: '40 mins', exceeded: '0 mins', late: '-', overtime: '0 mins', productive: '8h 35m', totalOwn: '8h 20m' },
  { date: '17/08/2026', checkIn: '09:06 AM', status: 'Present', checkOut: '07:12 PM', breakTime: '35 mins', actualBreak: '40 mins', exceeded: '0 mins', late: '-', overtime: '0 mins', productive: '8h 05m', totalOwn: '8h 20m' },
  { date: '16/08/2026', checkIn: '08:59 AM', status: 'Present', checkOut: '05:22 PM', breakTime: '29 mins', actualBreak: '40 mins', exceeded: '0 mins', late: '-', overtime: '0 mins', productive: '8h 38m', totalOwn: '8h 20m' }
]

export default function Attendance() {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter history rows by date or status search query
  const filteredHistory = useMemo(() => {
    return ATTENDANCE_HISTORY.filter(row => 
      row.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.status.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* 1. Header Profile Banner */}
      <div style={{
        background: 'linear-gradient(180deg, #c0392b 0%, #922b21 60%, #7b241c 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: '#fff',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
      }}>
        {/* User profile details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Avatar frame */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              {/* Profile Image placeholder matching avatar layout */}
              <span style={{ color: '#c0392b', fontWeight: 800, fontSize: '24px' }}>AN</span>
            </div>
            {/* Active status dot */}
            <span style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#22c55e',
              border: '2px solid #c0392b'
            }} />
          </div>

          {/* Texts */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Ashfak Nasar</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '2px 0 8px 0' }}>MERN Stack Developer</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <User size={12} /> ID-CW-GA7
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Mail size={12} /> ashfaknasar@travelzync.com
              </span>
            </div>
          </div>
        </div>

        {/* Right side banner statistics */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Today Status */}
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 16px', textAlign: 'center', minWidth: '95px' }}>
            <p style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: 700 }}>Today Status</p>
            <p style={{ fontSize: '14px', fontWeight: 700, margin: '4px 0 0 0', color: '#de4a4f' }}> Not Active</p>
          </div>
          {/* Working Hours */}
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 16px', textAlign: 'center', minWidth: '95px' }}>
            <p style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: 700 }}>Working Hours</p>
            <p style={{ fontSize: '14px', fontWeight: 700, margin: '4px 0 0 0' }}>8h 18m</p>
          </div>
          {/* Productivity */}
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 16px', minWidth: '130px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Productivity</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#4ade80' }}>100%</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: '#4ade80' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Stats Cards Row (5 Metrics) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {/* Hours Today */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <Clock size={16} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '6px' }}>+8h</span>
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>8h 05m</h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>Hours Today</p>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: '#ef4444' }} />
        </div>

        {/* Hours This Week */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
              <Calendar size={16} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '6px' }}>+40h</span>
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>44h 30m</h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>Hours This Week</p>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: '#f97316' }} />
        </div>

        {/* Hours This Month */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
              <Activity size={16} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '6px' }}>+170h</span>
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>176h 20m</h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>Hours This Month</p>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: '#8b5cf6' }} />
        </div>

        {/* Total Hours */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
              <TrendingUp size={16} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '6px' }}>+500h</span>
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>528h 40m</h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>Total Hours</p>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: '#22c55e' }} />
        </div>

        {/* Overtime */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Zap size={16} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '6px' }}>+3h</span>
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>3h 5m</h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>Overtime</p>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: '#d97706' }} />
        </div>
      </div>

      {/* 3. Lower Split Section (Table on Left, Sidebar on Right) */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '24px',
        alignItems: 'flex-start'
      }}>
        {/* Left Side: Table Container */}
        <div style={{
          flex: '1 1 65%',
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minWidth: '320px'
        }}>
          {/* Header Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Attendance History</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Search Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '6px 12px',
                width: '180px'
              }}>
                <Search size={14} color="#94a3b8" />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search attendance..." 
                  style={{
                    border: 'none',
                    background: 'none',
                    outline: 'none',
                    fontSize: '12px',
                    color: '#334155',
                    width: '100%'
                  }}
                />
              </div>
              
              {/* Download Button */}
              <button style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#c0392b',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                <Download size={14} /> Download
              </button>
            </div>
          </div>

          {/* Table Element Scroller */}
          <div style={{ overflowX: 'auto', width: '100%' }} className="hide-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#c0392b', color: '#fff' }}>
                  {['DATE', 'CHECK IN', 'STATUS', 'CHECK OUT', 'BREAK', 'ACTUAL BREAK', 'EXCEEDED BREAK', 'LATE', 'OVERTIME', 'PRODUCTIVE HRS', 'TOTAL OWN HRS'].map(heading => (
                    <th key={heading} style={{ padding: '12px 10px', fontWeight: 700, fontSize: '10px', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((row, i) => (
                  <tr key={i} style={{ 
                    borderBottom: '1px solid #f1f5f9', 
                    background: i % 2 === 0 ? '#fff' : '#fff5f5' // Alternating rows soft layout
                  }}>
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{row.date}</td>
                    <td style={{ padding: '12px 10px', color: '#475569', whiteSpace: 'nowrap' }}>{row.checkIn}</td>
                    <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        background: row.status === 'Late' ? '#fff7ed' : '#ecfdf5',
                        color: row.status === 'Late' ? '#c2410c' : '#15803d',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        {row.status === 'Late' ? <AlertCircle size={10} /> : <CheckCircle2 size={10} />}
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', color: '#475569', whiteSpace: 'nowrap' }}>{row.checkOut}</td>
                    <td style={{ padding: '12px 10px', color: '#475569', whiteSpace: 'nowrap' }}>{row.breakTime}</td>
                    <td style={{ padding: '12px 10px', color: '#475569', whiteSpace: 'nowrap' }}>{row.actualBreak}</td>
                    <td style={{ padding: '12px 10px', color: '#475569', whiteSpace: 'nowrap' }}>{row.exceeded}</td>
                    <td style={{ padding: '12px 10px', color: '#475569', whiteSpace: 'nowrap' }}>{row.late}</td>
                    <td style={{ padding: '12px 10px', color: '#475569', whiteSpace: 'nowrap' }}>{row.overtime}</td>
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap' }}>{row.productive}</td>
                    <td style={{ padding: '12px 10px', color: '#475569', whiteSpace: 'nowrap' }}>{row.totalOwn}</td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Sidebar Cards */}
        <div style={{
          flex: '1 1 30%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minWidth: '260px'
        }}>
          {/* Card 1: Quick Stats */}
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Quick Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Stat Item */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                  <CheckCircle2 size={14} color="#22c55e" /> Attendance %
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>96.5%</span>
              </div>
              {/* Stat Item */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                  <CheckCircle2 size={14} color="#22c55e" /> Present Days
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>14</span>
              </div>
              {/* Stat Item */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                  <AlertCircle size={14} color="#f97316" /> Late Arrivals
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>2</span>
              </div>
              {/* Stat Item */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                  <XCircle size={14} color="#ef4444" /> Absent Days
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>1</span>
              </div>
              {/* Stat Item */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                  <Clock size={14} color="#3b82f6" /> Days w/ Overtime
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>4</span>
              </div>
            </div>
          </div>

          {/* Card 2: Attendance Score */}
          <div style={{
            background: 'linear-gradient(180deg, #c0392b 0%, #922b21 60%, #7b241c 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: '#fff',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', margin: 0, fontWeight: 700, letterSpacing: '0.05em' }}>Attendance Score</h3>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>96</span>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>/ 100</span>
            </div>

            {/* Score Progress Bar */}
            <div style={{ marginTop: '4px' }}>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '96%', height: '100%', background: '#fbbf24' }} /> {/* Golden progress bar */}
              </div>
            </div>
            
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0' }}>Based on current page data</p>
          </div>
        </div>
      </div>

    </div>
  )
}
