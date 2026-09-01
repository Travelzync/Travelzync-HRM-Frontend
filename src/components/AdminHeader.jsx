import { Search, Sun, Moon, Bell, Menu } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function AdminHeader({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <header style={{
      height: 64, background: '#fff',
      borderBottom: '1px solid #f1f5f9',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16, flexShrink: 0,
    }} className="responsive-header">
      <button onClick={onMenuClick} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
        <Menu size={20} />
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1.2 }} className="responsive-header-greeting truncate">
          {greeting}, Admin! 👋
        </p>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }} className="responsive-header-greeting-sub">Welcome to TravelZync HRM Admin Panel.</p>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#f8fafc', border: '1px solid #e2e8f0',
        borderRadius: 8, padding: '7px 12px', width: 220,
      }} className="responsive-header-search">
        <Search size={14} color="#94a3b8" />
        <input placeholder="Search anything..." style={{
          border: 'none', background: 'none', outline: 'none',
          fontSize: 13, color: '#374151', flex: 1,
        }} />
        <span style={{ fontSize: 10, color: '#94a3b8', background: '#e2e8f0', borderRadius: 4, padding: '2px 5px' }}>Ctrl+K</span>
      </div>

      <button 
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
      >
        {theme === 'dark' ? <Moon size={18} color="#f59e0b" /> : <Sun size={18} />}
      </button>

      <div style={{ position: 'relative' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 6 }}>
          <Bell size={18} />
        </button>
        <span style={{
          position: 'absolute', top: 2, right: 2,
          width: 16, height: 16, borderRadius: '50%',
          background: '#ef4444', color: '#fff',
          fontSize: 9, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>3</span>
      </div>

      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'linear-gradient(135deg, #c0392b, #922b21)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', border: '2px solid #e2e8f0',
      }}>
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>AD</span>
      </div>
    </header>
  )
}
