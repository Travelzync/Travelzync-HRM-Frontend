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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
        <footer className="px-4 py-3 md:px-6 bg-white border-t border-[#f1f5f9] flex flex-col sm:flex-row gap-2 items-center justify-between text-center text-[12px] text-[#94a3b8]">
          <span>© 2026 TravelZync HRM. All rights reserved.</span>
          <span>Made with ❤️ by TravelZync Team</span>
        </footer>
      </div>
    </div>
  )
}
