import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminHeader from '../components/AdminHeader'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--tz-bg-app)' }} className="responsive-layout-wrapper">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }} className="responsive-layout-main">
          <Outlet />
        </main>
        <footer style={{
          padding: '12px 24px', borderTop: '1px solid var(--tz-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--tz-bg-card)', fontSize: 12, color: 'var(--tz-text-secondary)',
        }} className="responsive-footer">
          <span>© 2026 TravelZync HRM. All rights reserved.</span>
          <span>Made with ❤️ by TravelZync Team</span>
        </footer>
      </div>
    </div>
  )
}
