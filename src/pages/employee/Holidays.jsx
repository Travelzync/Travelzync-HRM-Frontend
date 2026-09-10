import { useState, useEffect } from 'react'
import {
  Gift, Calendar, Clock, Sparkles, CheckCircle2,
  ChevronRight, Loader2, PartyPopper
} from 'lucide-react'
import { getAllHolidays, getUpcomingHolidays } from '../../services/holidayService'
import { showError } from '../../utils/toast'

export default function Holidays() {
  const [holidays, setHolidays] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [allRes, upRes] = await Promise.all([
          getAllHolidays({ year: selectedYear }),
          getUpcomingHolidays(),
        ])
        if (allRes?.holidays) setHolidays(allRes.holidays)
        if (upRes?.holidays) setUpcoming(upRes.holidays)
      } catch (err) {
        showError(err.response?.data?.message || 'Failed to load holidays')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedYear])

  const nextHoliday = upcoming[0] || null

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null
    const target = new Date(dateStr)
    target.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today! 🎉'
    if (diffDays === 1) return 'Tomorrow! 🚀'
    if (diffDays > 0) return `In ${diffDays} days`
    return 'Passed'
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Group holidays by month
  const groupedByMonth = holidays.reduce((acc, h) => {
    const d = new Date(h.date)
    const monthName = d.toLocaleDateString(undefined, { month: 'long' })
    if (!acc[monthName]) acc[monthName] = []
    acc[monthName].push(h)
    return acc
  }, {})

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
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Holidays Calendar</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0 0' }}>
            Official company holiday schedule and festive off-days for {selectedYear}.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none',
              background: '#fff', color: '#0f172a', fontSize: 13,
              fontWeight: 700, cursor: 'pointer', outline: 'none',
            }}
          >
            {[2025, 2026, 2027, 2028].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Next Upcoming Holiday Highlight Card */}
      {nextHoliday && (
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          borderRadius: 16, border: '1px solid #fde68a', padding: '22px 24px',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center',
          justifyContent: 'space-between', gap: 16,
          boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: '#fef08a', color: '#b45309',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(180, 83, 9, 0.15)',
            }}>
              <Gift size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e', background: '#fef9c3', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                  Next Upcoming Holiday
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#b45309' }}>
                  {getDaysUntil(nextHoliday.date)}
                </span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#78350f', margin: '4px 0 2px 0' }}>
                {nextHoliday.name}
              </h3>
              <p style={{ fontSize: 12.5, color: '#92400e', margin: 0 }}>
                {formatDate(nextHoliday.date)} ({nextHoliday.dayOfWeek}) • {nextHoliday.description || 'Enjoy your paid off-day!'}
              </p>
            </div>
          </div>

          <div style={{
            background: '#fff', borderRadius: 12, padding: '10px 18px',
            border: '1px solid #fde68a', textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>Status</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>Paid Holiday ✓</div>
          </div>
        </div>
      )}

      {/* Month-by-Month Holiday List */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
          <Loader2 size={26} className="animate-spin" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13 }}>Loading holidays...</p>
        </div>
      ) : Object.keys(groupedByMonth).length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
          padding: 48, textAlign: 'center', color: '#64748b',
        }}>
          <Gift size={36} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
            No Holidays Scheduled for {selectedYear}
          </h3>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            Management has not published off-days for this year yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Object.entries(groupedByMonth).map(([month, list]) => (
            <div
              key={month}
              style={{
                background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
                padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {month} {selectedYear}
                </h4>
                <span style={{ fontSize: 11, color: '#64748b', background: '#f8fafc', padding: '2px 8px', borderRadius: 6 }}>
                  {list.length} {list.length > 1 ? 'Holidays' : 'Holiday'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {list.map((h) => {
                  const daysUntil = getDaysUntil(h.date)
                  return (
                    <div
                      key={h._id}
                      style={{
                        background: '#f8fafc', borderRadius: 10, padding: '14px 16px',
                        border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column',
                        justifyContent: 'space-between', gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{h.name}</div>
                          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                            {formatDate(h.date)} • {h.dayOfWeek}
                          </div>
                        </div>

                        <span style={{
                          fontSize: 10.5, fontWeight: 600, padding: '2px 7px', borderRadius: 6, textTransform: 'capitalize',
                          background: h.type === 'public' || h.type === 'national' ? '#dcfce7' : '#fef3c7',
                          color: h.type === 'public' || h.type === 'national' ? '#15803d' : '#b45309',
                        }}>
                          {h.type?.replace('_', ' ')}
                        </span>
                      </div>

                      {h.description && (
                        <p style={{ fontSize: 11.5, color: '#475569', margin: 0 }}>{h.description}</p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Paid Off</span>
                        <span style={{ color: '#94a3b8', fontWeight: 500 }}>{daysUntil}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
