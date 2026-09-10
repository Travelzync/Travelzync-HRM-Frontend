import { NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { EMPLOYEE_NAV } from '../constants/nav'
import { useTheme } from '../hooks/useTheme'

export default function EmployeeSidebar({ isOpen, onClose }) {
  const { isDark } = useTheme()

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside 
        style={{
          background: isDark
            ? '#0b101d'
            : 'linear-gradient(180deg, #c0392b 0%, #922b21 60%, #7b241c 100%)',
          borderRight: isDark ? '1px solid #1e293b' : 'none',
        }}
        className={`fixed lg:static top-0 left-0 z-30 w-[220px] h-screen flex flex-col shrink-0 transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: isDark ? '1px solid #1e293b' : '1px solid rgba(255,255,255,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: isDark ? 'linear-gradient(135deg, #c0392b, #922b21)' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: isDark ? '0 2px 8px rgba(192, 57, 43, 0.3)' : 'none',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 7v10l8 5 8-5V7L12 2z" fill={isDark ? '#fff' : '#c0392b'} />
                <path d="M12 2v20M4 7l8 5 8-5" stroke={isDark ? '#c0392b' : '#fff'} strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1 }}>TravelZync</p>
              <p style={{
                color: isDark ? '#f87171' : 'rgba(255,255,255,0.65)',
                fontSize: 10, marginTop: 3, letterSpacing: '0.05em', fontWeight: 700,
              }}>HRM</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 10px', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="hide-scroll">
          {EMPLOYEE_NAV.map(({ label, path, icon: Icon, badge }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                fontSize: 13, fontWeight: isActive ? 600 : 500, textDecoration: 'none',
                transition: 'all 0.15s',
                background: isActive 
                  ? (isDark ? 'linear-gradient(135deg, #c0392b 0%, #922b21 100%)' : '#fff')
                  : 'transparent',
                color: isActive 
                  ? (isDark ? '#ffffff' : '#c0392b')
                  : (isDark ? '#94a3b8' : 'rgba(255,255,255,0.85)'),
                boxShadow: isActive && isDark ? '0 2px 8px rgba(192, 57, 43, 0.35)' : 'none',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge && (
                    <span style={{
                      background: isActive
                        ? (isDark ? 'rgba(255,255,255,0.25)' : '#c0392b')
                        : (isDark ? '#1e293b' : '#fff'),
                      color: isActive
                        ? '#fff'
                        : (isDark ? '#ef4444' : '#c0392b'),
                      fontSize: 10, fontWeight: 700,
                      borderRadius: 10, padding: '1px 6px',
                      minWidth: 18, textAlign: 'center',
                    }}>{badge}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom profile */}
        <div style={{
          padding: '14px 16px',
          borderTop: isDark ? '1px solid #1e293b' : '1px solid rgba(255,255,255,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: isDark ? '#1a233a' : 'rgba(255,255,255,0.2)',
              border: isDark ? '1px solid #334155' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ color: isDark ? '#f87171' : '#fff', fontSize: 12, fontWeight: 700 }}>TZ</span>
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, lineHeight: 1 }}>TravelZync HRM</p>
              <p style={{ color: isDark ? '#64748b' : 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 3 }}>Empowering People.</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
