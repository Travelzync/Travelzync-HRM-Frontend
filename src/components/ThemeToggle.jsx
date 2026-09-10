import { Sun, Moon } from 'lucide-react'
import useTheme from '../hooks/useTheme'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        background: isDark ? '#1e293b' : '#f1f5f9',
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        borderRadius: 20,
        padding: '5px 10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: isDark ? '#f8fafc' : '#475569',
        fontSize: 12,
        fontWeight: 600,
        transition: 'all 0.2s ease',
      }}
    >
      {isDark ? (
        <>
          <Moon size={15} color="#38bdf8" />
          <span>Dark</span>
        </>
      ) : (
        <>
          <Sun size={15} color="#eab308" />
          <span>Light</span>
        </>
      )}
    </button>
  )
}
