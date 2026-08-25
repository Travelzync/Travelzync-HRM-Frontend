import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import EmployeeSidebar from '../components/EmployeeSidebar'
import EmployeeHeader from '../components/EmployeeHeader'
import ProjectsSidebar from '../components/ProjectsSidebar'
import ChatSidebar from '../components/ChatSidebar'

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState('crm-app')
  const [selectedChatId, setSelectedChatId] = useState('channel-test2')
  const location = useLocation()
  const isTaskFlow = location.pathname === '/employee/taskflow'
  const isChat = location.pathname === '/employee/chat'
  const isCustomLayout = isTaskFlow || isChat

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }} className="responsive-layout-wrapper">
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
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
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
          <Outlet context={{ selectedProjectId, setSelectedProjectId, selectedChatId, setSelectedChatId, setSidebarOpen }} />
        </main>
        {!isCustomLayout && (
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
