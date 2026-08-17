import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import EmployeeSidebar from '../components/EmployeeSidebar'
import EmployeeHeader from '../components/EmployeeHeader'

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
      <EmployeeSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <EmployeeHeader onMenuClick={() => setSidebarOpen(true)} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <Outlet />
        </main>
        <footer style={{
          padding: '12px 24px', borderTop: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#fff', fontSize: 12, color: '#94a3b8',
        }}>
          <span>© 2026 TravelZync HRM. All rights reserved.</span>
          <span>Made with ❤️ by TravelZync Team</span>
        </footer>
      </div>
    </div>
  )
}
