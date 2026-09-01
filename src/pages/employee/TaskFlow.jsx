import { useState, useMemo, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { 
  Play, Check, Pause, RefreshCw, Clock, MessageSquare, 
  MoreVertical, Search, Menu, Kanban, Table, List, 
  Calendar, Bug, CheckSquare 
} from 'lucide-react'
import { PROJECTS_DATA } from '../../components/ProjectsSidebar'

// Seed initial task list linked by projectId
const INITIAL_TASKS = [
  // CRM APP tasks (matching the image layout with realistic names)
  {
    id: '141',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 'to-do',
    title: 'Email Config Module - Inbox Displays Incorrect Date Labels and Timestamps',
    assignee: { name: 'Adhil', avatar: 'A' },
    progress: 0,
    duration: '1h 0m',
    comments: 0
  },
  {
    id: '154',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 'to-do',
    title: 'Sales Pipeline - Project Overview Displays Only First Custom Service Row',
    assignee: { name: 'Neha', avatar: 'N' },
    progress: 100,
    duration: '1h 0m',
    comments: 0
  },
  {
    id: '84',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 're-opened',
    title: 'Leads Module - Sending Proposal via Email Fails with "Failed to send email" error',
    assignee: { name: 'Rahul', avatar: 'R' },
    progress: 22,
    duration: '2h 0m',
    comments: 0,
    reopenCount: 1
  },
  {
    id: '113',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 're-opened',
    title: 'Wallet Module - Download Invoice Button is Not Functioning',
    assignee: { name: 'Faisal', avatar: 'F' },
    progress: 66,
    duration: '1h 0m',
    comments: 4,
    reopenCount: 4
  },
  {
    id: '162',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 'in-progress',
    title: 'Employee Module - Reporting To Workflow Incorrect in Web View layout',
    assignee: { name: 'Aswin', avatar: 'A' },
    progress: 59,
    duration: '2h 0m',
    comments: 0
  },
  {
    id: '3',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 'in-testing',
    title: 'Forgot Password - OTP Verification Does Not Accept New Configurations',
    assignee: { name: 'Shruthi', avatar: 'S' },
    progress: 62,
    duration: '3h 0m',
    comments: 3
  },
  {
    id: '39',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 'in-testing',
    title: 'Employee Module - Phone Number Field Validation Missing on Signup',
    assignee: { name: 'John', avatar: 'J' },
    progress: 47,
    duration: '2h 0m',
    comments: 0
  },
  {
    id: '16',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 'completed',
    title: 'Dashboard - Role-Based Toppers Order is Inconsistent Between Panels',
    assignee: { name: 'Priya', avatar: 'P' },
    progress: 63,
    duration: '2h 0m',
    comments: 0
  },
  {
    id: '17',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 'completed',
    title: 'Dashboard - Switch Button UI is Inconsistent Between Mobile App and Desktop',
    assignee: { name: 'Kiran', avatar: 'K' },
    progress: 54,
    duration: '2h 0m',
    comments: 0
  },
  // TravelZync Aura tasks
  {
    id: '201',
    projectId: 'travelzync-aura',
    priority: 'HIGH',
    status: 'to-do',
    title: 'Landing Page Redesign - Hero Section Button Click action triggers reload',
    assignee: { name: 'Amit', avatar: 'A' },
    progress: 0,
    duration: '4h 0m',
    comments: 2
  },
  {
    id: '202',
    projectId: 'travelzync-aura',
    priority: 'MEDIUM',
    status: 'in-progress',
    title: 'Bugfix - Mobile Navigation Menu doesn\'t close on dashboard link selection',
    assignee: { name: 'Sneha', avatar: 'S' },
    progress: 45,
    duration: '2h 0m',
    comments: 1
  },
  {
    id: '203',
    projectId: 'travelzync-aura',
    priority: 'LOW',
    status: 'completed',
    title: 'Setup ESLint rules and style guide formatting config in the workspace',
    assignee: { name: 'Deepak', avatar: 'D' },
    progress: 100,
    duration: '1h 30m',
    comments: 0
  }
]

// Project-level static stats base. We will offset these stats dynamically as local tasks are updated
const BASE_STATS = {
  'crm-app': { total: 146, todo: 4, reopened: 7, inProgress: 1, inTesting: 31, completed: 103, overdue: 38, blocked: 0, bugs: 0 },
  'travelzync-aura': { total: 45, todo: 10, reopened: 3, inProgress: 3, inTesting: 8, completed: 21, overdue: 5, blocked: 1, bugs: 2 },
  'travelzync-jobs': { total: 12, todo: 2, reopened: 1, inProgress: 1, inTesting: 2, completed: 6, overdue: 1, blocked: 0, bugs: 0 },
  'travelzync-rooms': { total: 8, todo: 1, reopened: 0, inProgress: 0, inTesting: 1, completed: 6, overdue: 0, blocked: 0, bugs: 0 }
}
const DEFAULT_BASE_STATS = { total: 0, todo: 0, reopened: 0, inProgress: 0, inTesting: 0, completed: 0, overdue: 0, blocked: 0, bugs: 0 }

const getAvatarStyle = (name) => {
  const colors = {
    'Adhil': { bg: '#e0f2fe', text: '#0369a1' }, // sky blue
    'Neha': { bg: '#fef2f2', text: '#b91c1c' }, // red
    'Rahul': { bg: '#f0fdf4', text: '#15803d' }, // green
    'Faisal': { bg: '#fef3c7', text: '#b45309' }, // amber
    'Aswin': { bg: '#faf5ff', text: '#6b21a8' }, // purple
    'Shruthi': { bg: '#fdf2f8', text: '#be185d' }, // pink
    'John': { bg: '#eff6ff', text: '#1d4ed8' }, // blue
    'Priya': { bg: '#ecfdf5', text: '#047857' }, // emerald
    'Kiran': { bg: '#f5f5f4', text: '#44403c' }, // stone
    'Amit': { bg: '#e0e7ff', text: '#3730a3' }, // indigo
    'Sneha': { bg: '#fff7ed', text: '#c2410c' }, // orange
    'Deepak': { bg: '#e0f7fa', text: '#006064' } // cyan
  }
  return colors[name] || { bg: '#f1f5f9', text: '#475569' }
}

export default function TaskFlow() {
  // Grab state from layout context
  const { selectedProjectId, setSidebarOpen } = useOutletContext()

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Interactive state for tasks
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [taskSearchQuery, setTaskSearchQuery] = useState('')
  const [activeSubTab, setActiveSubTab] = useState('Tasks') // e.g. Overview, Tasks, Time Requests, etc.
  const [activeView, setActiveView] = useState('Kanban') // e.g. Kanban, Table, List, etc.
  const [spinningId, setSpinningId] = useState(null) // For reload animation trigger

  // Retrieve current project information
  const project = useMemo(() => {
    return PROJECTS_DATA.find(p => p.id === selectedProjectId) || PROJECTS_DATA[0]
  }, [selectedProjectId])

  // Get initial status of seeded tasks for delta comparison
  const initialTaskStatuses = useMemo(() => {
    const map = {}
    INITIAL_TASKS.forEach(t => {
      map[t.id] = t.status
    })
    return map
  }, [])

  // Calculate stats dynamically using static base stats adjusted by user actions (deltas)
  const dynamicStats = useMemo(() => {
    const base = BASE_STATS[selectedProjectId] || DEFAULT_BASE_STATS
    const projectSeedTasks = INITIAL_TASKS.filter(t => t.projectId === selectedProjectId)
    
    let todoDelta = 0
    let reopenedDelta = 0
    let inProgressDelta = 0
    let inTestingDelta = 0
    let completedDelta = 0

    projectSeedTasks.forEach(seeded => {
      const current = tasks.find(t => t.id === seeded.id)
      if (current && current.status !== seeded.status) {
        // Decrement old status count
        if (seeded.status === 'to-do') todoDelta--
        else if (seeded.status === 're-opened') reopenedDelta--
        else if (seeded.status === 'in-progress') inProgressDelta--
        else if (seeded.status === 'in-testing') inTestingDelta--
        else if (seeded.status === 'completed') completedDelta--

        // Increment new status count
        if (current.status === 'to-do') todoDelta++
        else if (current.status === 're-opened') reopenedDelta++
        else if (current.status === 'in-progress') inProgressDelta++
        else if (current.status === 'in-testing') inTestingDelta++
        else if (current.status === 'completed') completedDelta++
      }
    })

    return {
      total: base.total,
      todo: Math.max(0, base.todo + todoDelta),
      reopened: Math.max(0, base.reopened + reopenedDelta),
      inProgress: Math.max(0, base.inProgress + inProgressDelta),
      inTesting: Math.max(0, base.inTesting + inTestingDelta),
      completed: Math.max(0, base.completed + completedDelta),
      overdue: base.overdue,
      blocked: base.blocked,
      bugs: base.bugs
    }
  }, [selectedProjectId, tasks])

  // Filter tasks shown on the Kanban board
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const isCurrentProject = t.projectId === selectedProjectId
      const matchesSearch = t.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) || 
                            t.id.includes(taskSearchQuery)
      return isCurrentProject && matchesSearch
    })
  }, [selectedProjectId, tasks, taskSearchQuery])

  // Task Actions
  const handleStartTask = (taskId) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'in-progress', progress: 10 } : t
    ))
  }

  const handleCompleteTask = (taskId) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'completed', progress: 100 } : t
    ))
  }

  const handleResumeTask = (taskId) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'in-progress', progress: 50 } : t
    ))
  }

  const handleTriggerSpin = (taskId) => {
    setSpinningId(taskId)
    setTimeout(() => {
      setSpinningId(null)
      // Increment reopenCount visually for details
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, reopenCount: (t.reopenCount || 0) + 1 } : t
      ))
    }, 600)
  }

  // Calculate average progress bar
  const calculatedProgress = useMemo(() => {
    const projectTasks = tasks.filter(t => t.projectId === selectedProjectId)
    if (projectTasks.length === 0) return 0
    const sum = projectTasks.reduce((acc, t) => acc + t.progress, 0)
    return Math.round(sum / projectTasks.length)
  }, [selectedProjectId, tasks])

  // Kanban Columns Mapping
  const COLUMNS = [
    { key: 'to-do', label: 'TO DO', color: '#64748b', count: dynamicStats.todo },
    { key: 're-opened', label: 'RE-OPENED', color: '#ef4444', count: dynamicStats.reopened },
    { key: 'in-progress', label: 'IN PROGRESS', color: '#3b82f6', count: dynamicStats.inProgress },
    { key: 'in-testing', label: 'IN TESTING', color: '#f59e0b', count: dynamicStats.inTesting },
    { key: 'completed', label: 'COMPLETED', color: '#22c55e', count: dynamicStats.completed }
  ]

  return (
    <div style={{ background: '#f8fafc', display: 'flex', flexDirection: 'column', flex: 1, height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '100vh' : 'none' }} className="taskflow-container">
      {/* Project Header Row */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }} className="taskflow-header">
        {/* Title and Badge controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mobile Sidebar open button */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#475569',
              padding: '6px',
              marginRight: '-4px'
            }}
          >
            <Menu size={20} />
          </button>
          
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {project.name}
            </h1>
            {/* Badges info under title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{
                background: '#ecfdf5',
                color: '#047857',
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                Active
              </span>
              <span style={{
                background: '#fef2f2',
                color: '#b91c1c',
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                ⚡ High
              </span>
            </div>
          </div>
        </div>

        {/* Member Overlapping Avatars & Overall progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Avatars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {['M', 'A', 'A', 'A', 'A'].map((initial, i) => (
                <div 
                  key={i} 
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: i % 2 === 0 ? '#3b82f6' : '#10b981',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #fff',
                    marginLeft: i > 0 ? '-8px' : 0,
                    zIndex: 10 - i
                  }}
                >
                  {initial}
                </div>
              ))}
              <div 
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#e2e8f0',
                  color: '#475569',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #fff',
                  marginLeft: '-8px',
                  zIndex: 5
                }}
              >
                +1
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>5 members</span>
          </div>

          {/* Project Progress bar */}
          <div style={{ width: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Progress</span>
              <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 700 }}>{calculatedProgress}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${calculatedProgress}%`, height: '100%', background: '#22c55e', borderRadius: '4px', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Row of Stat Cards (8 items) */}
      <div style={{
        padding: '16px 24px 8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '12px'
      }}>
        {/* TOTAL TASKS */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>Total Tasks</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0', lineHeight: 1 }}>{dynamicStats.total}</p>
        </div>
        {/* TO DO */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>To Do</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0', lineHeight: 1 }}>{dynamicStats.todo}</p>
        </div>
        {/* IN PROGRESS */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>In Progress</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#3b82f6', margin: '4px 0 0 0', lineHeight: 1 }}>{dynamicStats.inProgress}</p>
        </div>
        {/* IN TESTING */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>In Testing</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b', margin: '4px 0 0 0', lineHeight: 1 }}>{dynamicStats.inTesting}</p>
        </div>
        {/* COMPLETED */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>Completed</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#22c55e', margin: '4px 0 0 0', lineHeight: 1 }}>{dynamicStats.completed}</p>
        </div>
        {/* OVERDUE */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>Overdue</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#b91c1c', margin: '4px 0 0 0', lineHeight: 1 }}>{dynamicStats.overdue}</p>
        </div>
        {/* BLOCKED */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>Blocked</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#64748b', margin: '4px 0 0 0', lineHeight: 1 }}>{dynamicStats.blocked}</p>
        </div>
        {/* WITH BUGS */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>With Bugs</p>
          <p style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0', lineHeight: 1 }}>{dynamicStats.bugs}</p>
        </div>
      </div>

      {/* Navigation Sub-tabs & View Toggles & Search Row */}
      <div style={{
        padding: '8px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        borderBottom: '1px solid #e2e8f0'
      }} className="taskflow-subnav">
        {/* Sub-navigation tabs list */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }} className="hide-scroll">
          {['Overview', 'Tasks', 'Time Requests', 'Rejected Tasks', 'Chat'].map((tab) => {
            const isSelected = activeSubTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                style={{
                  background: isSelected ? '#1e293b' : 'transparent',
                  color: isSelected ? '#fff' : '#64748b',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* View Selection & Board Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* View Toggles */}
          <div style={{
            display: 'inline-flex',
            background: '#e2e8f0',
            padding: '2px',
            borderRadius: '6px',
            gap: '2px'
          }} className="taskflow-view-group">
            {[
              { id: 'Kanban', icon: Kanban },
              { id: 'Table', icon: Table },
              { id: 'List', icon: List },
              { id: 'Calendar', icon: Calendar },
              { id: 'Bug', icon: Bug }
            ].map((v) => {
              const isSelected = activeView === v.id
              const Icon = v.icon
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id)}
                  style={{
                    background: isSelected ? '#fff' : 'transparent',
                    color: isSelected ? '#0f172a' : '#64748b',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s'
                  }}
                >
                  <Icon size={12} />
                  {v.id}
                </button>
              )
            })}
          </div>

          {/* Search bar inside board */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '4px 10px',
            width: '180px'
          }} className="taskflow-search-box">
            <Search size={12} color="#94a3b8" />
            <input
              value={taskSearchQuery}
              onChange={(e) => setTaskSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              style={{
                border: 'none',
                background: 'none',
                outline: 'none',
                fontSize: '11px',
                color: '#1e293b',
                width: '100%'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main scrolling content pane */}
      <div style={{ flex: 1, overflowY: isMobile ? 'visible' : 'auto' }} className="hide-scroll">
        {activeSubTab === 'Tasks' && activeView === 'Kanban' ? (
          /* Kanban Board Scroll Container */
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '16px',
            overflowX: isMobile ? 'hidden' : 'auto',
            overflowY: isMobile ? 'auto' : 'hidden',
            padding: isMobile ? '16px 12px 24px' : '16px 24px 24px',
            alignItems: isMobile ? 'stretch' : 'flex-start'
          }} className="hide-scroll">
            {COLUMNS.map((col) => {
              const columnTasks = filteredTasks.filter(t => t.status === col.key)
              return (
                <div 
                  key={col.key} 
                  className="taskflow-column"
                  style={{
                    minWidth: isMobile ? '100%' : '270px',
                    width: isMobile ? '100%' : '270px',
                    background: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: isMobile ? 'none' : '80vh'
                  }}
                >
                  {/* Column Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    padding: '0 4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {/* Column Status Dot */}
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: col.color,
                        display: 'inline-block'
                      }} />
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em' }}>
                        {col.label}
                      </span>
                    </div>
                    {/* Badge count bubble */}
                    <span 
                      className="taskflow-column-badge"
                      style={{
                        background: '#fff',
                        color: '#475569',
                        fontSize: '10px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        padding: '2px 6px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      {col.key === 'completed' && col.count > 0 ? `${columnTasks.length} / ${col.count}` : col.count}
                    </span>
                  </div>

                  {/* Task Cards Column Scroller */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    overflowY: isMobile ? 'visible' : 'auto',
                    flex: isMobile ? 'none' : 1
                  }} className="hide-scroll">
                    {columnTasks.map((task) => (
                      <div
                        key={task.id}
                        className="taskflow-task-card"
                        style={{
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}
                      >
                        {/* Card Top Line */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span 
                              className="taskflow-task-id"
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: '#64748b',
                                background: '#f1f5f9',
                                padding: '2px 5px',
                                borderRadius: '4px'
                              }}
                            >
                              #{task.id}
                            </span>
                            <span style={{
                              fontSize: '9px',
                              fontWeight: 800,
                              color: '#b91c1c',
                              background: '#fef2f2',
                              padding: '2px 5px',
                              borderRadius: '4px'
                            }}>
                              {task.priority}
                            </span>
                            <span style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              color: col.color,
                              background: `${col.color}15`,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              textTransform: 'capitalize'
                            }}>
                              {task.status.replace('-', ' ')}
                            </span>
                          </div>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}>
                            <MoreVertical size={14} />
                          </button>
                        </div>

                        {/* Title text */}
                        <p 
                          className="taskflow-task-title"
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#1e293b',
                            margin: 0,
                            lineHeight: 1.4
                          }}
                        >
                          {task.title}
                        </p>

                        {/* Assignee Details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: getAvatarStyle(task.assignee.name).bg,
                            color: getAvatarStyle(task.assignee.name).text,
                            fontSize: '9px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {task.assignee.avatar}
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                            {task.assignee.name}
                          </span>
                        </div>

                        {/* Card Progress Bar */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>Progress</span>
                            <span style={{ fontSize: '10px', color: '#1e293b', fontWeight: 700 }}>{task.progress}%</span>
                          </div>
                          <div style={{ width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${task.progress}%`,
                              height: '100%',
                              background: col.color,
                              borderRadius: '2px',
                              transition: 'width 0.25s ease'
                            }} />
                          </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', background: '#f1f5f9' }} />

                        {/* Card Footer controls */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px'
                        }}>
                          {/* Duration and Comment stats */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={11} />
                              <span style={{ fontSize: '10px', fontWeight: 600 }}>{task.duration}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <MessageSquare size={11} />
                              <span style={{ fontSize: '10px', fontWeight: 600 }}>{task.comments}</span>
                            </div>
                          </div>

                          {/* Column-specific Card actions */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {col.key === 'to-do' && (
                              <>
                                <button 
                                  onClick={() => handleStartTask(task.id)}
                                  style={{
                                    background: '#ecfdf5',
                                    color: '#059669',
                                    border: '1px solid #10b98140',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px'
                                  }}
                                >
                                  <Play size={8} fill="#059669" /> Start
                                </button>
                                <button 
                                  onClick={() => handleCompleteTask(task.id)}
                                  style={{
                                    background: '#eff6ff',
                                    color: '#2563eb',
                                    border: '1px solid #3b82f640',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px'
                                  }}
                                >
                                  <Check size={9} strokeWidth={2.5} /> Complete
                                </button>
                              </>
                            )}

                            {col.key === 're-opened' && (
                              <button 
                                onClick={() => handleTriggerSpin(task.id)}
                                style={{
                                  background: '#fff',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '4px',
                                  padding: '4px',
                                  cursor: 'pointer',
                                  color: '#475569',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <RefreshCw 
                                  size={10} 
                                  className={spinningId === task.id ? 'animate-spin' : ''} 
                                  style={{ transition: 'transform 0.5s' }}
                                />
                                {task.reopenCount && (
                                  <span style={{ fontSize: '9px', fontWeight: 700, marginLeft: '3px' }}>{task.reopenCount}</span>
                                )}
                              </button>
                            )}

                            {col.key === 'in-progress' && (
                              <>
                                <button 
                                  onClick={() => handleCompleteTask(task.id)}
                                  style={{
                                    background: '#eff6ff',
                                    color: '#2563eb',
                                    border: '1px solid #3b82f640',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px'
                                  }}
                                >
                                  <Check size={9} strokeWidth={2.5} /> Complete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {columnTasks.length === 0 && (
                      <div style={{
                        border: '2px dashed #cbd5e1',
                        borderRadius: '10px',
                        padding: '24px 12px',
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: '11px'
                      }}>
                        No tasks in this column
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Placeholder display when other tabs/views are clicked */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 24px',
            color: '#64748b'
          }}>
            <CheckSquare size={36} strokeWidth={1.5} style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
              {activeSubTab} - {activeView} View
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', textAlign: 'center', maxWidth: '300px' }}>
              You are currently viewing the {activeSubTab} section under {activeView} mode. Switch back to "Tasks" and "Kanban" to see the active Kanban columns!
            </p>
            <button
              onClick={() => {
                setActiveSubTab('Tasks')
                setActiveView('Kanban')
              }}
              style={{
                marginTop: '16px',
                background: '#3b82f6',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer'
              }}
            >
              Reset to Kanban Board
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
