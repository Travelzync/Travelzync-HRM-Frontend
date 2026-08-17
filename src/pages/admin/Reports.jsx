import { BarChart2 } from 'lucide-react'
export default function Reports() {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9', padding: '28px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart2 size={22} color="#3b82f6" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Reports</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>Generate and export HR reports and analytics</p>
        </div>
      </div>
    </div>
  )
}
