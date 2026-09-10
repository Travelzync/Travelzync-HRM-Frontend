import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import EmployeeSidebar from '../components/EmployeeSidebar'
import EmployeeHeader from '../components/EmployeeHeader'
import ProjectsSidebar from '../components/ProjectsSidebar'
import ChatSidebar from '../components/ChatSidebar'

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState('crm-app')
  const [selectedChat, setSelectedChat] = useState({
    type: 'public',
    id: 'general',
    name: 'general',
    label: 'General Hub',
  })
  const location = useLocation()
  const isTaskFlow = location.pathname === '/employee/taskflow'
  const isChat = location.pathname === '/employee/chat'
  const isCustomLayout = isTaskFlow || isChat

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--tz-bg-app)' }} className="responsive-layout-wrapper">
      {isTaskFlow ? (
        <ProjectsSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
        />
      ) : isChat ? (
        <ChatSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          backPath="/employee/overview"
        />
      ) : (
        <EmployeeSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {!isCustomLayout && <EmployeeHeader onMenuClick={() => setSidebarOpen(true)} />}
        <main style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: isCustomLayout ? 0 : 24, 
          display: 'flex', 
          flexDirection: 'column' 
        }} className={isCustomLayout ? "" : "responsive-layout-main"}>
          <Outlet context={{ selectedProjectId, setSelectedProjectId, selectedChat, setSelectedChat, setSidebarOpen }} />
        </main>
        {!isCustomLayout && (
          <footer style={{
            padding: '12px 24px', borderTop: '1px solid var(--tz-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--tz-bg-card)', fontSize: 12, color: 'var(--tz-text-secondary)',
          }} className="responsive-footer">
            <span>© 2026 TravelZync HRM. All rights reserved.</span>
            <span>Made with ❤️ by TravelZync Team</span>
          </footer>
        )}
      </div>
    </div>
  )
}
