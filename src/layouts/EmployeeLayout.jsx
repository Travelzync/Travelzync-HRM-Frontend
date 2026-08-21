import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import EmployeeSidebar from '../components/EmployeeSidebar'
import EmployeeHeader from '../components/EmployeeHeader'
import ProjectsSidebar from '../components/ProjectsSidebar'

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState('crm-app')
  const location = useLocation()
  const isTaskFlow = location.pathname === '/employee/taskflow'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }} className="responsive-layout-wrapper">
      {isTaskFlow ? (
        <ProjectsSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
        />
      ) : (
        <EmployeeSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {!isTaskFlow && <EmployeeHeader onMenuClick={() => setSidebarOpen(true)} />}
        <main style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: isTaskFlow ? 0 : 24, 
          display: 'flex', 
          flexDirection: 'column' 
        }} className={isTaskFlow ? "" : "responsive-layout-main"}>
          <Outlet context={{ selectedProjectId, setSelectedProjectId, setSidebarOpen }} />
        </main>
        {!isTaskFlow && (
          <footer style={{
            padding: '12px 24px', borderTop: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#fff', fontSize: 12, color: '#94a3b8',
          }} className="responsive-footer">
            <span>© 2026 TravelZync HRM. All rights reserved.</span>
            <span>Made with ❤️ by TravelZync Team</span>
          </footer>
        )}
      </div>
    </div>
  )
}
