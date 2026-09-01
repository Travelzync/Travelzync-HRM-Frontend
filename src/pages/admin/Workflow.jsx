import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Play, 
  Check, 
  Clock, 
  MessageSquare, 
  Trash2, 
  Users, 
  CheckCircle2, 
  Building2, 
  DollarSign, 
  Umbrella, 
  FileText,
  Beaker,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  Send,
  X,
  CheckSquare,
  Folder,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react'

// Seed database for Admin Tasks
const INITIAL_TASKS = [
  {
    id: '01',
    title: 'API Routing Setup',
    project: 'TravelZync System',
    assignee: { name: 'Ashfak', avatar: 'AS' },
    status: 'Completed',
    priority: 'High',
    dueDate: '12 Sep 2026',
    loggedTime: '08:00:00'
  },
  {
    id: '02',
    title: 'Sidebar Layout Revisions',
    project: 'TravelZync System',
    assignee: { name: 'Ansar', avatar: 'AN' },
    status: 'In Progress',
    priority: 'Medium',
    dueDate: '18 Sep 2026',
    loggedTime: '04:30:00'
  },
  {
    id: '03',
    title: 'Profile Forms Validation',
    project: 'TravelZync System',
    assignee: { name: 'Rabah', avatar: 'RA' },
    status: 'To Do',
    priority: 'Low',
    dueDate: '24 Sep 2026',
    loggedTime: '00:00:00'
  }
]

// Mock time requests
const INITIAL_TIME_REQUESTS = [
  { id: 1, employee: 'Ansar', task: 'Sidebar Layout Revisions', requestedHours: '3h 0m', reason: 'Mobile browser layout alignment tweaks', status: 'Pending' }
]

// Mock Bugs dataset
const INITIAL_BUGS = [
  { id: 'BUG-101', title: 'Header logo alignment shifts on mobile resolutions', project: 'TravelZync System', severity: 'Medium', status: 'Open', reportedBy: 'Rabah' }
]

export default function Workflow() {
  const { activeWorkflowTab, setSidebarOpen } = useOutletContext()

  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [timeRequests, setTimeRequests] = useState(INITIAL_TIME_REQUESTS)
  const [bugs, setBugs] = useState(INITIAL_BUGS)
  
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Ashfak', message: 'I completed the API routing setup, please check.', time: '10:05 AM' },
    { id: 2, sender: 'Ansar', message: 'Great, starting the layout tests now.', time: '10:12 AM' }
  ])
  const [newMsgText, setNewMsgText] = useState('')

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New time extension request submitted by Ansar.', time: '2 hours ago' }
  ])

  // Projects state in Workflow portal
  const [projectsList, setProjectsList] = useState([
    { id: '01', name: 'TravelZync Frontend System', code: 'TZ-SYS-001', department: 'Development', start: '12 Sep 2026', due: '15 Dec 2026', status: 'Active', priority: 'High', description: 'Complete frontend migrations, layouts, routing, and design integration.', members: ['AS', 'AN'], tasksCount: 3, completedTasks: 1, inProgressTasks: 1, toDoTasks: 1 },
    { id: '02', name: 'HR Guidelines Documentation', code: 'TZ-DOC-002', department: 'HR', start: '18 Sep 2026', due: '30 Nov 2026', status: 'In Progress', priority: 'Medium', description: 'Employee onboarding handbook, validation procedures and policies.', members: ['RA'], tasksCount: 2, completedTasks: 0, inProgressTasks: 1, toDoTasks: 1 },
    { id: '03', name: 'Brand Colors Palette Test', code: 'TZ-DSN-003', department: 'Design', start: '24 Sep 2026', due: '25 Oct 2026', status: 'Completed', priority: 'Low', description: 'Reviewing frontend brand palette and design elements.', members: ['AN', 'AS'], tasksCount: 4, completedTasks: 4, inProgressTasks: 0, toDoTasks: 0 }
  ])
  const [projSearchQuery, setProjSearchQuery] = useState('')
  const [projDeptFilter, setProjDeptFilter] = useState('All Departments')
  const [projStatusFilter, setProjStatusFilter] = useState('All Status')
  const [projPriorityFilter, setProjPriorityFilter] = useState('All Priority')
  const [selectedWorkflowProjectId, setSelectedWorkflowProjectId] = useState(null)
  
  const [isAddProjModalOpen, setIsAddProjModalOpen] = useState(false)
  const [newProjName, setNewProjName] = useState('')
  const [newProjDept, setNewProjDept] = useState('Development')
  const [newProjDesc, setNewProjDesc] = useState('')
  const [newProjPriority, setNewProjPriority] = useState('Medium')
  const [newProjStatus, setNewProjStatus] = useState('In Progress')

  const selectedProject = useMemo(() => {
    return projectsList.find(p => p.id === selectedWorkflowProjectId)
  }, [projectsList, selectedWorkflowProjectId])

  const handleAddWorkflowProject = (e) => {
    e.preventDefault()
    if (!newProjName.trim()) return

    const newId = String(projectsList.length + 1).padStart(2, '0')
    const codeNum = `00${projectsList.length + 1}`.slice(-3)
    const newEntry = {
      id: newId,
      name: newProjName,
      code: `TZ-PRO-${codeNum}`,
      department: newProjDept,
      start: '12 Sep 2026',
      due: '15 Dec 2026',
      status: newProjStatus,
      priority: newProjPriority,
      description: newProjDesc,
      members: ['AS', 'AN'],
      tasksCount: 10,
      completedTasks: 0,
      inProgressTasks: 0,
      toDoTasks: 10
    }

    setProjectsList(prev => [...prev, newEntry])
    setIsAddProjModalOpen(false)
    setNewProjName('')
    setNewProjDesc('')
  }

  const handleDeleteWorkflowProject = (id) => {
    setProjectsList(prev => prev.filter(p => p.id !== id))
  }

  const projectStats = useMemo(() => {
    const total = projectsList.length
    const active = projectsList.filter(p => p.status === 'Active').length
    const inProgress = projectsList.filter(p => p.status === 'In Progress').length
    const onHold = projectsList.filter(p => p.status === 'On Hold').length
    const completed = projectsList.filter(p => p.status === 'Completed').length
    return { total, active, inProgress, onHold, completed }
  }, [projectsList])

  const filteredProjectsList = useMemo(() => {
    return projectsList.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(projSearchQuery.toLowerCase()) || 
                            p.code.toLowerCase().includes(projSearchQuery.toLowerCase())
      const matchesDept = projDeptFilter === 'All Departments' || p.department === projDeptFilter
      const matchesStatus = projStatusFilter === 'All Status' || p.status === projStatusFilter
      const matchesPriority = projPriorityFilter === 'All Priority' || p.priority === projPriorityFilter
      return matchesSearch && matchesDept && matchesStatus && matchesPriority
    })
  }, [projectsList, projSearchQuery, projDeptFilter, projStatusFilter, projPriorityFilter])

  const getProjPriorityStyle = (priority) => {
    switch (priority) {
      case 'Urgent': return { bg: '#fef2f2', text: '#b91c1c' }
      case 'High': return { bg: '#fff7ed', text: '#c2410c' }
      case 'Medium': return { bg: '#fffdeb', text: '#854d0e' }
      default: return { bg: '#f0fdf4', text: '#16a34a' }
    }
  }

  const getProjStatusStyle = (status) => {
    switch (status) {
      case 'Active': return { bg: '#f0fdf4', text: '#15803d' }
      case 'Completed': return { bg: '#f0fdf4', text: '#15803d' }
      case 'In Progress': return { bg: '#fffdeb', text: '#854d0e' }
      default: return { bg: '#eff6ff', text: '#1d4ed8' }
    }
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [priorityFilter, setPriorityFilter] = useState('All Priority')
  const [employeeFilter, setEmployeeFilter] = useState('All Employees')
  const [projectFilter, setProjectFilter] = useState('All Projects')

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskProject, setNewTaskProject] = useState('TravelZync System')
  const [newTaskAssignee, setNewTaskAssignee] = useState('Ashfak')
  const [newTaskStatus, setNewTaskStatus] = useState('To Do')
  const [newTaskPriority, setNewTaskPriority] = useState('Medium')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')

  // Handle new task additions
  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const newId = String(tasks.length + 1).padStart(2, '0')
    const initials = newTaskAssignee.split(' ').map(n => n[0]).join('')
    
    const newTask = {
      id: newId,
      title: newTaskTitle,
      project: newTaskProject,
      assignee: { name: newTaskAssignee, avatar: initials },
      status: newTaskStatus,
      priority: newTaskPriority,
      dueDate: newTaskDueDate || '30 Aug 2026',
      loggedTime: '00:00:00'
    }

    setTasks(prev => [newTask, ...prev])
    setIsAddModalOpen(false)
    setNewTaskTitle('')
    setNewTaskDueDate('')
  }

  // Handle task deletion
  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  // Handle time request approvals
  const handleApproveTime = (id) => {
    setTimeRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'Approved' } : req
    ))
  }

  const handleRejectTime = (id) => {
    setTimeRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'Rejected' } : req
    ))
  }

  // Send group chat message
  const handleSendChatMessage = (e) => {
    e.preventDefault()
    if (!newMsgText.trim()) return
    const newMsg = {
      id: chatMessages.length + 1,
      sender: 'Super Admin',
      message: newMsgText,
      time: 'Just now'
    }
    setChatMessages(prev => [...prev, newMsg])
    setNewMsgText('')
  }

  // Calculate dynamic stats from current tasks array
  const calculatedStats = useMemo(() => {
    const total = tasks.length
    const todo = tasks.filter(t => t.status === 'To Do').length
    const inProgress = tasks.filter(t => t.status === 'In Progress').length
    const testing = tasks.filter(t => t.status === 'Testing').length
    const reopened = tasks.filter(t => t.status === 'Reopened').length
    const completed = tasks.filter(t => t.status === 'Completed').length
    
    // Simple logic: no tasks are overdue by default
    const overdue = tasks.filter(t => t.status !== 'Completed' && t.dueDate.toLowerCase().includes('overdue')).length

    // Parse logged times e.g., "14:30:00" -> sum total hours
    const totalMinutes = tasks.reduce((sum, t) => {
      const parts = t.loggedTime.split(':')
      const hrs = parseInt(parts[0]) || 0
      const mins = parseInt(parts[1]) || 0
      return sum + (hrs * 60) + mins
    }, 0)
    const loggedHours = Math.round(totalMinutes / 60)

    return { total, todo, inProgress, testing, reopened, completed, overdue, loggedHours }
  }, [tasks])

  // Filter tasks list based on active filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.id.includes(searchQuery) ||
                            t.assignee.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'All Status' || t.status === statusFilter
      const matchesPriority = priorityFilter === 'All Priority' || t.priority === priorityFilter
      const matchesEmployee = employeeFilter === 'All Employees' || t.assignee.name === employeeFilter
      const matchesProject = projectFilter === 'All Projects' || t.project === projectFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesEmployee && matchesProject
    })
  }, [tasks, searchQuery, statusFilter, priorityFilter, employeeFilter, projectFilter])

  // Unique lists for filters
  const uniqueProjects = ['All Projects', 'TravelZync System']
  const uniqueEmployees = ['All Employees', 'Ashfak', 'Ansar', 'Rabah']

  // Badge rendering helper
  const getBadgeStyle = (type, val) => {
    if (type === 'status') {
      switch (val) {
        case 'Testing': return { bg: '#faf5ff', text: '#6b21a8' } // purple
        case 'In Progress': return { bg: '#eff6ff', text: '#1d4ed8' } // blue
        case 'To Do': return { bg: '#fefce8', text: '#854d0e' } // yellow
        case 'Reopened': return { bg: '#fff7ed', text: '#c2410c' } // orange
        case 'Completed': return { bg: '#f0fdf4', text: '#15803d' } // green
        default: return { bg: '#f1f5f9', text: '#475569' }
      }
    } else { // priority
      switch (val) {
        case 'High': return { bg: '#fef2f2', text: '#b91c1c' } // red
        case 'Medium': return { bg: '#fff7ed', text: '#c2410c' } // orange
        default: return { bg: '#f0fdf4', text: '#15803d' } // green
      }
    }
  }

  return (
    <div style={{ background: '#f8fafc', flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }} className="admin-workflow-container">
      
      {/* Dynamic Header row */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }} className="admin-workflow-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mobile toggle */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '4px' }}
          >
            ☰
          </button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {activeWorkflowTab === 'Overview' ? 'Task Management' : `${activeWorkflowTab}`}
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '3px', margin: 0 }}>
              {activeWorkflowTab === 'Overview' ? 'Track and manage all your project tasks' : `Manage workflow ${activeWorkflowTab.toLowerCase()} panel`}
            </p>
          </div>
        </div>

        {activeWorkflowTab === 'Overview' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Project Quick filter */}
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              style={{
                background: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {uniqueProjects.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                background: '#c0392b',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(192, 57, 43, 0.15)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#922b21'}
              onMouseOut={(e) => e.currentTarget.style.background = '#c0392b'}
            >
              <Plus size={16} /> New Task
            </button>
          </div>
        )}
      </div>

      {/* RENDER VIEW DEPENDING ON ACTIVE WORKFLOW SIDEBAR TAB */}

      {/* A. OVERVIEW VIEW (Main Tasks List & Stats Row matching Pic 1) */}
      {activeWorkflowTab === 'Overview' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Stats Row (8 items matching mockups) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '16px'
          }}>
            {/* Stat 1: Total Tasks */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyBox: 'center', justifyContent: 'center', color: '#db2777' }}>
                <FileText size={18} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0 }}>Total Tasks</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>{calculatedStats.total}</p>
              </div>
            </div>

            {/* Stat 2: To Do */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                <CheckSquare size={18} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0 }}>To Do</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>{calculatedStats.todo}</p>
              </div>
            </div>

            {/* Stat 3: In Progress */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <Play size={16} fill="#2563eb" />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0 }}>In Progress</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>{calculatedStats.inProgress}</p>
              </div>
            </div>

            {/* Stat 4: Testing */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea' }}>
                <Beaker size={18} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0 }}>Testing</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>{calculatedStats.testing}</p>
              </div>
            </div>

            {/* Stat 5: Reopened */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ecfeff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0891b2' }}>
                <RefreshCw size={16} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0 }}>Reopened</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>{calculatedStats.reopened}</p>
              </div>
            </div>

            {/* Stat 6: Completed */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                <Check size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0 }}>Completed</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>{calculatedStats.completed}</p>
              </div>
            </div>

            {/* Stat 7: Overdue */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0 }}>Overdue</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>{calculatedStats.overdue}</p>
              </div>
            </div>

            {/* Stat 8: Logged Time */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e' }}>
                <Clock size={18} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0 }}>Total Hours</p>
                <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>{calculatedStats.loggedHours}h</p>
              </div>
            </div>
          </div>

          {/* Filtering Line Row */}
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '8px 12px',
              gap: '8px',
              width: '260px'
            }}>
              <Search size={16} color="#94a3b8" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by name, ID or employee..."
                style={{
                  border: 'none',
                  background: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#334155',
                  width: '100%',
                  fontWeight: 500
                }}
              />
            </div>

            {/* Dropdown Filters & Filter button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              
              {/* Status Select */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: '#475569',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All Status">All Status</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Testing">Testing</option>
                <option value="Reopened">Reopened</option>
                <option value="Completed">Completed</option>
              </select>

              {/* Priority Select */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: '#475569',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All Priority">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {/* Assignee Select */}
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: '#475569',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {uniqueEmployees.map(emp => <option key={emp} value={emp}>{emp}</option>)}
              </select>

              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('All Status')
                  setPriorityFilter('All Priority')
                  setEmployeeFilter('All Employees')
                  setProjectFilter('All Projects')
                }}
                style={{
                  background: '#c0392b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Filter size={14} /> Clear Filter
              </button>
            </div>
          </div>

          {/* Tasks Table Card */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            overflowX: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: '#c0392b', color: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>#</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Task Title</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Project</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Assigned To</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Priority</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Due Date</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Logged Time</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, width: '80px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((t) => {
                    const statusBadge = getBadgeStyle('status', t.status)
                    const priorityBadge = getBadgeStyle('priority', t.priority)
                    return (
                      <tr 
                        key={t.id} 
                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                        className="hover:bg-slate-50"
                      >
                        {/* ID */}
                        <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{t.id}</td>
                        
                        {/* Title */}
                        <td style={{ padding: '14px 18px', fontSize: '13px', color: '#1e293b', fontWeight: 700, maxWidth: '280px' }}>{t.title}</td>
                        
                        {/* Project */}
                        <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{t.project}</td>
                        
                        {/* Assigned To Profile */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              fontSize: '10px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {t.assignee.avatar}
                            </div>
                            <span style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>{t.assignee.name}</span>
                          </div>
                        </td>
                        
                        {/* Status Badge */}
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            background: statusBadge.bg,
                            color: statusBadge.text,
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '12px',
                            display: 'inline-block',
                            textTransform: 'capitalize'
                          }}>
                            {t.status}
                          </span>
                        </td>
                        
                        {/* Priority Badge */}
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            background: priorityBadge.bg,
                            color: priorityBadge.text,
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '12px',
                            display: 'inline-block'
                          }}>
                            {t.priority}
                          </span>
                        </td>
                        
                        {/* Due Date */}
                        <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{t.dueDate}</td>
                        
                        {/* Logged Time */}
                        <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>{t.loggedTime}</td>
                        
                        {/* Actions */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => handleDeleteTask(t.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#94a3b8',
                                padding: '4px',
                                borderRadius: '4px'
                              }}
                              title="Delete Task"
                              onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                              onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                            >
                              <Trash2 size={15} />
                            </button>
                            <button
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                            >
                              <MoreVertical size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="9" style={{ padding: '48px 18px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                      No tasks found matching the active search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* B. TASKS KANBAN BOARD VIEW */}
      {activeWorkflowTab === 'Tasks' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Workflow Kanban Board</h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Track task status columns and switch assignments</p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            paddingBottom: '16px',
            alignItems: 'flex-start'
          }} className="hide-scroll">
            {['To Do', 'In Progress', 'Testing', 'Reopened', 'Completed'].map((col) => {
              const colTasks = tasks.filter(t => t.status === col)
              const colColor = col === 'To Do' ? '#64748b' : col === 'In Progress' ? '#2563eb' : col === 'Testing' ? '#9333ea' : col === 'Reopened' ? '#ea580c' : '#16a34a'
              
              return (
                <div 
                  key={col} 
                  className="admin-kanban-col"
                  style={{
                    minWidth: '280px',
                    width: '280px',
                    background: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    maxHeight: '75vh'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: colColor }} />
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col}</span>
                    </div>
                    <span style={{ background: '#fff', color: '#475569', fontSize: '11px', fontWeight: 700, borderRadius: '8px', padding: '2px 8px', border: '1px solid #e2e8f0' }} className="admin-kanban-badge">{colTasks.length}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }} className="hide-scroll">
                    {colTasks.length > 0 ? (
                      colTasks.map((t) => (
                        <div 
                          key={t.id} 
                          className="admin-kanban-card"
                          style={{
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }} className="admin-kanban-id">#{t.id}</span>
                            <span style={{
                              background: t.priority === 'High' ? '#fef2f2' : t.priority === 'Medium' ? '#fff7ed' : '#f0fdf4',
                              color: t.priority === 'High' ? '#b91c1c' : t.priority === 'Medium' ? '#c2410c' : '#15803d',
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>{t.priority}</span>
                          </div>

                          <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: 0, lineHeight: 1.4 }} className="admin-kanban-title">{t.title}</h4>
                          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Project: <span style={{ fontWeight: 600 }}>{t.project}</span></p>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                fontSize: '9px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {t.assignee.avatar}
                              </div>
                              <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>{t.assignee.name}</span>
                            </div>

                            <select
                              value={t.status}
                              onChange={(e) => {
                                const newStatus = e.target.value
                                setTasks(prev => prev.map(item => item.id === t.id ? { ...item, status: newStatus } : item))
                              }}
                              className="admin-kanban-select"
                              style={{
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 700,
                                color: '#475569',
                                background: '#fff',
                                outline: 'none',
                                cursor: 'pointer',
                                padding: '2px 4px'
                              }}
                            >
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Testing">Testing</option>
                              <option value="Reopened">Reopened</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '11px', fontStyle: 'italic' }}>No tasks in this column</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* C. PROJECTS SUB-VIEW */}
      {activeWorkflowTab === 'Projects' && (
        <div style={{ display: 'flex', gap: '24px', flex: 1, padding: '24px', position: 'relative', height: '100%', overflow: 'hidden' }}>
          
          {/* Main Table Content panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }} className="hide-scroll">
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Project Management</h2>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', margin: 0 }}>Track and manage all your active projects</p>
              </div>
              <button
                onClick={() => setIsAddProjModalOpen(true)}
                style={{
                  background: '#c0392b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={16} /> Create Project
              </button>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              
              <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(192, 57, 43, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c0392b' }}>
                  <Folder size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{projectStats.total}</h4>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Total Projects</p>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                  <Folder size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{projectStats.active}</h4>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Active Projects</p>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308' }}>
                  <Folder size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{projectStats.inProgress}</h4>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>In Progress</p>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <Folder size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{projectStats.onHold}</h4>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>On Hold</p>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                  <Folder size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{projectStats.completed}</h4>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>Completed</p>
                </div>
              </div>

            </div>

            {/* Filters Row */}
            <div style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 12px',
                gap: '8px',
                width: '260px'
              }}>
                <Search size={16} color="#94a3b8" />
                <input
                  value={projSearchQuery}
                  onChange={e => setProjSearchQuery(e.target.value)}
                  placeholder="Search by name or code..."
                  style={{
                    border: 'none',
                    background: 'none',
                    outline: 'none',
                    fontSize: '13px',
                    color: '#334155',
                    width: '100%',
                    fontWeight: 500
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <select
                  value={projDeptFilter}
                  onChange={e => setProjDeptFilter(e.target.value)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: '#475569',
                    fontWeight: 500,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                </select>

                <select
                  value={projStatusFilter}
                  onChange={e => setProjStatusFilter(e.target.value)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: '#475569',
                    fontWeight: 500,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>

                <select
                  value={projPriorityFilter}
                  onChange={e => setProjPriorityFilter(e.target.value)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: '#475569',
                    fontWeight: 500,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="All Priority">All Priority</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                <button
                  onClick={() => {
                    setProjSearchQuery('')
                    setProjDeptFilter('All Departments')
                    setProjStatusFilter('All Status')
                    setProjPriorityFilter('All Priority')
                  }}
                  style={{
                    background: '#c0392b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Filter size={14} /> Clear Filter
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
                <thead>
                  <tr style={{ background: '#c0392b', color: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>#</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Project Name</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Project Code</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Department</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Start Date</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Due Date</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Priority</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Members</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, width: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjectsList.length > 0 ? (
                    filteredProjectsList.map((p) => {
                      const statusStyle = getProjStatusStyle(p.status)
                      const priorityStyle = getProjPriorityStyle(p.priority)
                      const isSelected = selectedWorkflowProjectId === p.id
                      return (
                        <tr 
                          key={p.id}
                          onClick={() => setSelectedWorkflowProjectId(isSelected ? null : p.id)}
                          style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: isSelected ? '#f8fafc' : 'transparent' }}
                          className="hover:bg-slate-50"
                        >
                          <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{p.id}</td>
                          <td style={{ padding: '14px 18px', fontSize: '13px', color: '#1e293b', fontWeight: 700, maxWidth: '220px' }}>{p.name}</td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              background: 'rgba(192, 57, 43, 0.05)', color: '#c0392b',
                              fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', whiteSpace: 'nowrap'
                            }}>{p.code}</span>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{p.department}</td>
                          <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>{p.start}</td>
                          <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>{p.due}</td>
                          <td style={{ padding: '14px 18px' }}>
                            <span className="workflow-status-badge" style={{
                              background: statusStyle.bg, color: statusStyle.text,
                              fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', whiteSpace: 'nowrap', display: 'inline-block'
                            }}>{p.status}</span>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span className="workflow-priority-badge" style={{
                              background: priorityStyle.bg, color: priorityStyle.text,
                              fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', whiteSpace: 'nowrap', display: 'inline-block'
                            }}>{p.priority}</span>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {p.members.slice(0, 3).map((m, idx) => (
                                <div key={idx} className="workflow-member-avatar" style={{
                                  width: '24px', height: '24px', borderRadius: '50%',
                                  background: '#eff6ff', color: '#1d4ed8', fontSize: '9px', fontWeight: 700,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  border: '1.5px solid #fff', marginLeft: idx > 0 ? '-6px' : 0
                                }}>{m}</div>
                              ))}
                              {p.members.length > 3 && (
                                <div className="workflow-member-avatar" style={{
                                  width: '24px', height: '24px', borderRadius: '50%',
                                  background: '#f1f5f9', color: '#475569', fontSize: '9px', fontWeight: 700,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  border: '1.5px solid #fff', marginLeft: '-6px'
                                }}>+{p.members.length - 3}</div>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button 
                                onClick={() => setSelectedWorkflowProjectId(p.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                              >
                                <Eye size={15} />
                              </button>
                              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
                                <Edit size={15} />
                              </button>
                              <button 
                                onClick={() => handleDeleteWorkflowProject(p.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="10" style={{ padding: '48px 18px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                        No projects found matching filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Showing 1 to {filteredProjectsList.length} of {projectsList.length} projects</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '6px', padding: '6px', cursor: 'not-allowed', color: '#cbd5e1' }}>
                  <ChevronLeft size={16} />
                </button>
                <button style={{ minWidth: '32px', height: '32px', borderRadius: '6px', border: 'none', background: '#c0392b', color: '#fff', fontWeight: 600, fontSize: '12px' }}>
                  1
                </button>
                <button style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '6px', padding: '6px', cursor: 'not-allowed', color: '#cbd5e1' }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>

          {/* Drawer Panel */}
          {selectedProject && (
            <div style={{
              width: '300px',
              background: '#fff',
              borderLeft: '1px solid #e2e8f0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '-2px 0 12px rgba(0,0,0,0.03)',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Project Details</h3>
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', margin: 0 }}>{selectedProject.code}</p>
                </div>
                <button 
                  onClick={() => setSelectedWorkflowProjectId(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{selectedProject.name}</span>
                </div>
                <span style={{
                  background: getProjStatusStyle(selectedProject.status).bg, color: getProjStatusStyle(selectedProject.status).text,
                  fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px'
                }}>{selectedProject.status}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Department</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{selectedProject.department}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Priority</span>
                  <span style={{ fontWeight: 700, color: getProjPriorityStyle(selectedProject.priority).text }}>{selectedProject.priority}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Start Date</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{selectedProject.start}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Due Date</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{selectedProject.due}</span>
                </div>

                <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

                <div>
                  <p style={{ color: '#64748b', fontWeight: 600, margin: '0 0 4px' }}>Description</p>
                  <p style={{ color: '#334155', lineHeight: 1.4, margin: 0 }}>{selectedProject.description}</p>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>Members (2)</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {selectedProject.members.map((m, idx) => (
                    <div key={idx} style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: '#eff6ff', color: '#1d4ed8', fontSize: '10px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid #cbd5e1'
                    }}>{m}</div>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ color: '#64748b', fontWeight: 700, fontSize: '12px', margin: '0 0 10px', textTransform: 'uppercase' }}>Tasks Status</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                    <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 2px' }}>Total Tasks</p>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{selectedProject.tasksCount}</p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                    <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 2px' }}>Completed</p>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: '#22c55e', margin: 0 }}>{selectedProject.completedTasks}</p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                    <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 2px' }}>In Progress</p>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: '#eab308', margin: 0 }}>{selectedProject.inProgressTasks}</p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                    <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 2px' }}>To Do</p>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb', margin: 0 }}>{selectedProject.toDoTasks}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Project Modal */}
          {isAddProjModalOpen && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '440px', position: 'relative' }}>
                <button onClick={() => setIsAddProjModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>Create Project</h3>
                <form onSubmit={handleAddWorkflowProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Project Name</label>
                    <input required type="text" value={newProjName} onChange={e => setNewProjName(e.target.value)} placeholder="e.g. API Integration" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Department</label>
                    <select value={newProjDept} onChange={e => setNewProjDept(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                      <option value="Development">Development</option>
                      <option value="Design">Design</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Description</label>
                    <input type="text" value={newProjDesc} onChange={e => setNewProjDesc(e.target.value)} placeholder="Short scope summary..." style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Priority</label>
                      <select value={newProjPriority} onChange={e => setNewProjPriority(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                        <option value="Urgent">Urgent</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Status</label>
                      <select value={newProjStatus} onChange={e => setNewProjStatus(e.target.value)} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                        <option value="Active">Active</option>
                        <option value="In Progress">In Progress</option>
                        <option value="On Hold">On Hold</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginTop: '6px' }}>
                    Create Project
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* D. TIME REQUESTS SUB-VIEW */}
      {activeWorkflowTab === 'Time Requests' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#c0392b', color: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Employee</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Task Target</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Requested Extension</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Reason Description</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, width: '180px' }}>Approval Actions</th>
                </tr>
              </thead>
              <tbody>
                {timeRequests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{req.employee}</td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>{req.task}</td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: '#c0392b', fontWeight: 700 }}>+{req.requestedHours}</td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: '#64748b', maxWidth: '300px' }}>{req.reason}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        background: req.status === 'Pending' ? '#fefce8' : req.status === 'Approved' ? '#f0fdf4' : '#fef2f2',
                        color: req.status === 'Pending' ? '#854d0e' : req.status === 'Approved' ? '#15803d' : '#b91c1c',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}>{req.status}</span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {req.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleApproveTime(req.id)}
                            style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectTime(req.id)}
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* E. BUGS SUB-VIEW */}
      {activeWorkflowTab === 'Bugs' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {bugs.map((b) => (
              <div key={b.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldAlert size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      <span style={{ color: '#b91c1c', marginRight: '6px' }}>{b.id}</span>
                      {b.title}
                    </h4>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>Project: {b.project} • Reported by: {b.reportedBy}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    background: b.severity === 'Critical' ? '#fee2e2' : '#fef9c3',
                    color: b.severity === 'Critical' ? '#b91c1c' : '#854d0e',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>{b.severity}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* F. CHAT SUB-VIEW */}
      {activeWorkflowTab === 'Chat' && (
        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '400px' }}>
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }} className="workflow-chat-card">
            {/* Messages box */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {chatMessages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignSelf: msg.sender === 'Super Admin' ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
                    <span style={{ fontWeight: 700 }}>{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div 
                    className={msg.sender === 'Super Admin' ? 'workflow-chat-bubble-admin' : 'workflow-chat-bubble-user'}
                    style={{
                      background: msg.sender === 'Super Admin' ? '#c0392b' : '#f1f5f9',
                      color: msg.sender === 'Super Admin' ? '#fff' : '#1e293b',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '13px',
                      lineHeight: 1.4
                    }}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Input message form */}
            <form onSubmit={handleSendChatMessage} style={{ borderTop: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', gap: '10px' }} className="workflow-chat-form">
              <input
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                placeholder="Type a team broadcast message..."
                className="workflow-chat-input"
                style={{
                  flex: 1,
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '24px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  outline: 'none',
                  color: '#334155'
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#c0392b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Send size={14} fill="#fff" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* G. NOTIFICATIONS SUB-VIEW */}
      {activeWorkflowTab === 'Notifications' && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((n) => (
            <div key={n.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Bell size={16} color="#c0392b" />
                <span style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>{n.text}</span>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{n.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* NEW TASK ADDITION MODAL VIEW */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setIsAddModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>Create New Task</h3>

            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Task Title</label>
                <input 
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement OTP login screens"
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '13px',
                    color: '#334155',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Project</label>
                  <select
                    value={newTaskProject}
                    onChange={(e) => setNewTaskProject(e.target.value)}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '13px',
                      color: '#334155',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="TravelZync HRM">TravelZync HRM</option>
                    <option value="TravelZync Payroll">TravelZync Payroll</option>
                    <option value="TravelZync Core">TravelZync Core</option>
                    <option value="TravelZync Leaves">TravelZync Leaves</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '13px',
                      color: '#334155',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Ashfak">Ashfak</option>
                    <option value="Ansar">Ansar</option>
                    <option value="Rabah">Rabah</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Initial Status</label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value)}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '13px',
                      color: '#334155',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Testing">Testing</option>
                    <option value="Reopened">Reopened</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '13px',
                      color: '#334155',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Due Date</label>
                <input 
                  type="text"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  placeholder="e.g. 30 Aug 2026"
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '13px',
                    color: '#334155',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#c0392b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '6px'
                }}
              >
                Add Task
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
