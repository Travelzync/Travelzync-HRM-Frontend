import { Clock } from 'lucide-react'
export default function Attendance() {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', padding: '28px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Clock size={22} color="#ef4444" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Attendance</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>Track and manage employee attendance records</p>
        </div>
      </div>
    </div>
  )
}
