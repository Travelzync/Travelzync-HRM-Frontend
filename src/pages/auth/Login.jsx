import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, Users, TrendingUp, Globe } from 'lucide-react'

const features = [
  { icon: Users, text: 'Manage your entire workforce' },
  { icon: TrendingUp, text: 'Track performance & growth' },
  { icon: Shield, text: 'Enterprise-grade security' },
  { icon: Globe, text: 'Access from anywhere' },
]

const stats = [
  { value: '500+', label: 'Companies' },
  { value: '50K+', label: 'Employees' },
  { value: '99.9%', label: 'Uptime' },
]

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.')
      return
    }
    setError('')
    navigate('/employee/overview')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

      {/* ── Left Branding Panel ── */}
      <div
        style={{
          width: '50%',
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #7f1d1d 100%)',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="hidden lg:flex"
      >
        {/* Glow blobs */}
        <div style={{
          position: 'absolute', top: 80, left: 80,
          width: 288, height: 288, borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)', filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: 80, right: 40,
          width: 384, height: 384, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)', filter: 'blur(80px)',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>TZ</span>
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, lineHeight: 1 }}>TravelZync</p>
              <p style={{ color: '#fca5a5', fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 3 }}>HRM Platform</p>
            </div>
          </div>

          <h2 style={{ color: '#fff', fontSize: 40, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
            Streamline your<br />
            <span style={{ color: '#fca5a5' }}>HR operations</span><br />
            effortlessly.
          </h2>
          <p style={{ color: '#fecaca', fontSize: 15, lineHeight: 1.7, maxWidth: 340 }}>
            A unified platform for attendance, payroll, leave management, and employee engagement.
          </p>
        </div>

        {/* Features + Stats */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
            {features.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={15} color="#fff" />
                </div>
                <span style={{ color: '#fecaca', fontSize: 14 }}>{text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 22, lineHeight: 1 }}>{value}</p>
                <p style={{ color: '#fca5a5', fontSize: 12, marginTop: 4 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Login Panel ── */}
      <div style={{
        flex: 1,
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden" style={{ alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>TZ</span>
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#111827', lineHeight: 1 }}>TravelZync</p>
              <p style={{ color: '#ef4444', fontSize: 10, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 3 }}>HRM Platform</p>
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Welcome back</h1>
            <p style={{ color: '#6b7280', fontSize: 14 }}>Sign in to your TravelZync HRM account to continue.</p>
          </div>

          {/* Card */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #f1f5f9',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
            padding: 32,
          }}>

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: '1px solid #e2e8f0', fontSize: 14, color: '#111827',
                  outline: 'none', background: '#fff',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#ef4444'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Password
                </label>
                <a href="#" style={{ fontSize: 12, color: '#ef4444', fontWeight: 500, textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{
                    width: '100%', padding: '11px 42px 11px 14px', borderRadius: 10,
                    border: '1px solid #e2e8f0', fontSize: 14, color: '#111827',
                    outline: 'none', background: '#fff',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#ef4444'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#9ca3af', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <input
                id="remember"
                type="checkbox"
                style={{ width: 16, height: 16, accentColor: '#ef4444', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: 14, color: '#4b5563', cursor: 'pointer', userSelect: 'none' }}>
                Remember me for 30 days
              </label>
            </div>

            {/* Error */}
            {error && (
              <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 12, textAlign: 'center' }}>{error}</p>
            )}

            {/* Login Button */}
            <button
              type="button"
              onClick={handleLogin}
              style={{
                width: '100%', padding: '12px',
                background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                color: '#fff', fontWeight: 600, fontSize: 14,
                border: 'none', borderRadius: 10, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
                transition: 'opacity 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => e.target.style.opacity = '0.92'}
              onMouseLeave={e => e.target.style.opacity = '1'}
              onMouseDown={e => e.target.style.transform = 'scale(0.99)'}
              onMouseUp={e => e.target.style.transform = 'scale(1)'}
            >
              Sign In to HRM
            </button>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 20 }}>
            Protected by enterprise-grade security.{' '}
            <a href="#" style={{ color: '#ef4444', textDecoration: 'none' }}>Privacy Policy</a>
          </p>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
            © 2025 TravelZync HRM. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
