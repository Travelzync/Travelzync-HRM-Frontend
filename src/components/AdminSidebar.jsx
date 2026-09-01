import { NavLink } from 'react-router-dom'
import { ADMIN_NAV } from '../constants/nav'
import logoImg from '../assets/logo.jpg'

export default function AdminSidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside
        style={{
          background: 'linear-gradient(180deg, #c0392b 0%, #922b21 60%, #7b241c 100%)'
        }}
        className={`fixed lg:static top-0 left-0 z-30 w-[220px] h-screen flex flex-col shrink-0 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src={logoImg}
              alt="TravelZync Logo"
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                objectFit: 'cover',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
            />
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1 }}>TravelZync</p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 3, letterSpacing: '0.05em' }}>ADMIN</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 10px', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="hide-scroll">
          {ADMIN_NAV.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                fontSize: 13, fontWeight: 500, textDecoration: 'none',
                transition: 'all 0.15s',
                background: isActive ? '#fff' : 'transparent',
                color: isActive ? '#c0392b' : 'rgba(255,255,255,0.85)',
              })}
            >
              <Icon size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>TZ</span>
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, lineHeight: 1 }}>TravelZync HRM</p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 3 }}>Admin Portal</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
