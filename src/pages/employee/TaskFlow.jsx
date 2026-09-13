import { useState, useMemo, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { 
  Play, Check, RefreshCw, Clock, MessageSquare, 
  MoreVertical, Search, Menu, Kanban, Table, List, 
  Calendar, Bug, CheckSquare, Plus, Trash2, X, Loader2,
  AlertCircle, Sparkles, User, ArrowRight
} from 'lucide-react'
import { PROJECTS_DATA } from '../../components/ProjectsSidebar'
import { getCurrentUser, getUserRole } from '../../services/authService'
import { getTasks, createTask, deleteTask, updateTaskStatus, getProjects } from '../../services/taskService'
import { getEmployees } from '../../services/employeeService'
import { showSuccess, showError, showWarning } from '../../utils/toast'

// Seed initial fallback task list linked by projectId
const INITIAL_TASKS = [
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

// Base stats
const BASE_STATS = {
  'crm-app': { total: 146, todo: 4, reopened: 7, inProgress: 1, inTesting: 31, completed: 103, overdue: 38, blocked: 0, bugs: 0 },
  'travelzync-aura': { total: 45, todo: 10, reopened: 3, inProgress: 3, inTesting: 8, completed: 21, overdue: 5, blocked: 1, bugs: 2 },
  'travelzync-jobs': { total: 12, todo: 2, reopened: 1, inProgress: 1, inTesting: 2, completed: 6, overdue: 1, blocked: 0, bugs: 0 },
  'travelzync-rooms': { total: 8, todo: 1, reopened: 0, inProgress: 0, inTesting: 1, completed: 6, overdue: 0, blocked: 0, bugs: 0 }
}
const DEFAULT_BASE_STATS = { total: 0, todo: 0, reopened: 0, inProgress: 0, inTesting: 0, completed: 0, overdue: 0, blocked: 0, bugs: 0 }

const getAvatarStyle = (name = 'U') => {
  const colors = {
    'Adhil': { bg: '#e0f2fe', text: '#0369a1' },
    'Neha': { bg: '#fef2f2', text: '#b91c1c' },
    'Rahul': { bg: '#f0fdf4', text: '#15803d' },
    'Faisal': { bg: '#fef3c7', text: '#b45309' },
    'Aswin': { bg: '#faf5ff', text: '#6b21a8' },
    'Shruthi': { bg: '#fdf2f8', text: '#be185d' },
    'John': { bg: '#eff6ff', text: '#1d4ed8' },
    'Priya': { bg: '#ecfdf5', text: '#047857' },
    'Kiran': { bg: '#f5f5f4', text: '#44403c' },
    'Amit': { bg: '#e0e7ff', text: '#3730a3' },
    'Sneha': { bg: '#fff7ed', text: '#c2410c' },
    'Deepak': { bg: '#e0f7fa', text: '#006064' }
  }
  return colors[name] || { bg: '#f1f5f9', text: '#475569' }
}

// Convert backend task format to frontend Kanban card format
const normalizeBackendTask = (task) => {
  let assigneeName = 'Unassigned'
  let assigneeAvatar = 'U'

  if (task.assignedEmployees && task.assignedEmployees.length > 0) {
    const firstEmp = task.assignedEmployees[0]?.employeeId
    if (firstEmp) {
      assigneeName = firstEmp.userId?.name || firstEmp.name || (firstEmp.firstName ? `${firstEmp.firstName} ${firstEmp.lastName || ''}`.trim() : 'Employee')
      assigneeAvatar = assigneeName.charAt(0).toUpperCase()
    }
  }

  // Map backend status to column key
  let mappedStatus = 'to-do'
  if (task.status === 'todo') mappedStatus = 'to-do'
  else if (task.status === 'in_progress') mappedStatus = 'in-progress'
  else if (task.status === 'in_testing') mappedStatus = 'in-testing'
  else if (task.status === 'reopened' || task.status === 'on_hold') mappedStatus = 're-opened'
  else if (task.status === 'completed') mappedStatus = 'completed'
  else mappedStatus = task.status || 'to-do'

  const progressMap = {
    'to-do': 0,
    're-opened': 25,
    'in-progress': 60,
    'in-testing': 80,
    'completed': 100
  }

  const projId = task.projectId?._id || task.projectId || 'crm-app'

  return {
    id: task._id || task.id || String(Math.floor(Math.random() * 900 + 100)),
    rawId: task._id,
    taskNumber: task.taskNumber || `#${task._id ? task._id.slice(-4) : 'TASK'}`,
    projectId: typeof projId === 'string' ? projId : 'crm-app',
    priority: (task.priority || 'medium').toUpperCase(),
    status: mappedStatus,
    title: task.title,
    description: task.description || '',
    assignee: { name: assigneeName, avatar: assigneeAvatar },
    progress: progressMap[mappedStatus] || 0,
    duration: `${task.estimatedHours || 1}h 0m`,
    comments: 0,
    isBackend: Boolean(task._id)
  }
}

export default function TaskFlow() {
  // Context from layout
  const context = useOutletContext() || {}
  const { selectedProjectId = 'crm-app', setSidebarOpen = () => {} } = context

  // Identify Role
  const currentUser = getCurrentUser()
  const role = getUserRole() || currentUser?.role
  const isAdmin = role === 'admin' || window.location.pathname.startsWith('/admin')

  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Tasks and UI state
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [loading, setLoading] = useState(false)
  const [taskSearchQuery, setTaskSearchQuery] = useState('')
  const [activeSubTab, setActiveSubTab] = useState('Tasks')
  const [activeView, setActiveView] = useState('Kanban')
  const [spinningId, setSpinningId] = useState(null)
  const [actionMenuTaskId, setActionMenuTaskId] = useState(null)

  // Admin Create Task Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [submittingTask, setSubmittingTask] = useState(false)
  const [employeesList, setEmployeesList] = useState([])
  const [dbProjects, setDbProjects] = useState([])
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    priority: 'high',
    status: 'todo',
    estimatedHours: 2,
    dueDate: '',
    employeeId: '',
    role: 'Developer'
  })

  // Retrieve current project information
  const project = useMemo(() => {
    return PROJECTS_DATA.find(p => p.id === selectedProjectId) || PROJECTS_DATA[0]
  }, [selectedProjectId])

  // Fetch tasks from backend API
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getTasks({ projectId: selectedProjectId })
      if (res && res.success && Array.isArray(res.tasks) && res.tasks.length > 0) {
        const normalized = res.tasks.map(normalizeBackendTask)
        // Combine with initial seed tasks for the project if needed so the board is always populated
        const seedForProject = INITIAL_TASKS.filter(t => t.projectId === selectedProjectId)
        const combined = [...normalized, ...seedForProject.filter(s => !normalized.some(n => n.title === s.title))]
        setTasks(combined)
      } else {
        // Fallback to seed tasks
        setTasks(INITIAL_TASKS)
      }
    } catch (err) {
      console.warn('Could not fetch backend tasks, using local fallback:', err)
      setTasks(INITIAL_TASKS)
    } finally {
      setLoading(false)
    }
  }, [selectedProjectId])

  // Fetch employees list if Admin (for task assignment)
  useEffect(() => {
    if (isAdmin) {
      getEmployees()
        .then(res => {
          if (res?.employees) {
            setEmployeesList(res.employees)
            if (res.employees.length > 0) {
              setCreateForm(prev => ({ ...prev, employeeId: res.employees[0]._id }))
            }
          }
        })
        .catch(err => console.warn('Could not load employees for assignment:', err))

      getProjects()
        .then(res => {
          if (res?.projects) {
            setDbProjects(res.projects)
          }
        })
        .catch(err => console.warn('Could not load DB projects:', err))
    }
  }, [isAdmin])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Close menus on outside click
  useEffect(() => {
    const handleDocumentClick = () => setActionMenuTaskId(null)
    window.addEventListener('click', handleDocumentClick)
    return () => window.removeEventListener('click', handleDocumentClick)
  }, [])

  // Calculate stats dynamically using static base stats adjusted by tasks
  const dynamicStats = useMemo(() => {
    const base = BASE_STATS[selectedProjectId] || DEFAULT_BASE_STATS
    const projectTasks = tasks.filter(t => t.projectId === selectedProjectId)

    const todoCount = projectTasks.filter(t => t.status === 'to-do').length
    const reopenedCount = projectTasks.filter(t => t.status === 're-opened').length
    const inProgressCount = projectTasks.filter(t => t.status === 'in-progress').length
    const inTestingCount = projectTasks.filter(t => t.status === 'in-testing').length
    const completedCount = projectTasks.filter(t => t.status === 'completed').length

    return {
      total: Math.max(base.total, projectTasks.length),
      todo: Math.max(base.todo, todoCount),
      reopened: Math.max(base.reopened, reopenedCount),
      inProgress: Math.max(base.inProgress, inProgressCount),
      inTesting: Math.max(base.inTesting, inTestingCount),
      completed: Math.max(base.completed, completedCount),
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
                            String(t.id).includes(taskSearchQuery)
      return isCurrentProject && matchesSearch
    })
  }, [selectedProjectId, tasks, taskSearchQuery])

  // Status mapping for backend
  const statusToBackendMap = {
    'to-do': 'todo',
    'in-progress': 'in_progress',
    'in-testing': 'in_testing',
    're-opened': 'reopened',
    'completed': 'completed'
  }

  // Update Status Action (Available to both Admin and Employee)
  const handleUpdateStatus = async (taskId, newFrontendStatus) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Optimistic UI update
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const progressMap = {
          'to-do': 0,
          're-opened': 25,
          'in-progress': 60,
          'in-testing': 80,
          'completed': 100
        }
        return { ...t, status: newFrontendStatus, progress: progressMap[newFrontendStatus] || t.progress }
      }
      return t
    }))

    // If task exists on backend, sync to server
    if (task.rawId) {
      try {
        const backendStatus = statusToBackendMap[newFrontendStatus] || 'todo'
        await updateTaskStatus(task.rawId, backendStatus, `Moved to ${newFrontendStatus}`)
        showSuccess(`Task status moved to ${newFrontendStatus.replace('-', ' ')}`)
      } catch (err) {
        console.warn('Backend update task status failed:', err)
      }
    } else {
      showSuccess(`Task moved to ${newFrontendStatus.replace('-', ' ')}`)
    }
  }

  // Start Task
  const handleStartTask = (taskId) => handleUpdateStatus(taskId, 'in-progress')

  // Complete Task
  const handleCompleteTask = (taskId) => handleUpdateStatus(taskId, 'completed')

  // Send to testing
  const handleSendToTesting = (taskId) => handleUpdateStatus(taskId, 'in-testing')

  // Reopen spin animation
  const handleTriggerSpin = (taskId) => {
    setSpinningId(taskId)
    setTimeout(() => {
      setSpinningId(null)
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, reopenCount: (t.reopenCount || 0) + 1 } : t
      ))
    }, 600)
  }

  // ADMIN: Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!isAdmin) {
      showWarning('Only administrators can delete tasks.')
      return
    }

    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    if (!window.confirm(`Are you sure you want to delete task #${task.id || taskId}?`)) {
      return
    }

    try {
      if (task.rawId) {
        await deleteTask(task.rawId)
      }
      setTasks(prev => prev.filter(t => t.id !== taskId))
      showSuccess('Task deleted successfully!')
    } catch (err) {
      console.warn('Backend delete task failed, removing locally:', err)
      setTasks(prev => prev.filter(t => t.id !== taskId))
      showSuccess('Task removed!')
    }
  }

  // ADMIN: Create Task
  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault()
    if (!isAdmin) {
      showWarning('Only administrators can create tasks.')
      return
    }

    if (!createForm.title.trim()) {
      showWarning('Task title is required!')
      return
    }

    try {
      setSubmittingTask(true)

      // Find an actual DB project id if available, else use selectedProjectId
      let targetProjectId = selectedProjectId
      if (dbProjects.length > 0) {
        const found = dbProjects.find(p => p.name.toLowerCase().includes(project.name.toLowerCase()) || p._id === selectedProjectId)
        if (found) targetProjectId = found._id
        else targetProjectId = dbProjects[0]._id
      }

      const assignedEmployees = []
      let selectedEmpName = 'Aswin'
      if (createForm.employeeId) {
        assignedEmployees.push({
          employeeId: createForm.employeeId,
          role: createForm.role || 'Developer'
        })
        const emp = employeesList.find(e => e._id === createForm.employeeId)
        if (emp) {
          selectedEmpName = emp.name || emp.userId?.name || (emp.firstName ? `${emp.firstName} ${emp.lastName || ''}`.trim() : 'Employee')
        }
      }

      const payload = {
        projectId: targetProjectId,
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        assignedEmployees,
        estimatedHours: Number(createForm.estimatedHours) || 1,
        status: createForm.status || 'todo',
        priority: createForm.priority || 'medium',
        dueDate: createForm.dueDate || null
      }

      let createdTaskObj = null

      try {
        const res = await createTask(payload)
        if (res && res.success && res.task) {
          createdTaskObj = normalizeBackendTask(res.task)
        }
      } catch (err) {
        console.warn('Backend task create failed or offline, adding locally:', err)
      }

      // Fallback local task if backend was unable to persist
      if (!createdTaskObj) {
        const newId = String(Math.floor(Math.random() * 800 + 200))
        createdTaskObj = {
          id: newId,
          rawId: null,
          taskNumber: `#${newId}`,
          projectId: selectedProjectId,
          priority: (createForm.priority || 'high').toUpperCase(),
          status: createForm.status === 'todo' ? 'to-do' : createForm.status,
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          assignee: { name: selectedEmpName, avatar: selectedEmpName.charAt(0).toUpperCase() },
          progress: 0,
          duration: `${createForm.estimatedHours || 1}h 0m`,
          comments: 0
        }
      }

      setTasks(prev => [createdTaskObj, ...prev])
      showSuccess('New task created successfully!')
      setIsCreateModalOpen(false)
      setCreateForm({
        title: '',
        description: '',
        priority: 'high',
        status: 'todo',
        estimatedHours: 2,
        dueDate: '',
        employeeId: employeesList[0]?._id || '',
        role: 'Developer'
      })
    } catch (error) {
      showError(error.message || 'Failed to create task')
    } finally {
      setSubmittingTask(false)
    }
  }

  // Calculate average progress bar
  const calculatedProgress = useMemo(() => {
    const projectTasks = tasks.filter(t => t.projectId === selectedProjectId)
    if (projectTasks.length === 0) return 0
    const sum = projectTasks.reduce((acc, t) => acc + (t.progress || 0), 0)
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
    <div style={{ background: '#f8fafc', display: 'flex', flexDirection: 'column', flex: 1, height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '100vh' : 'none', position: 'relative' }}>
      
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
      }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {project.name}
              </h1>
              {isAdmin && (
                <span style={{
                  background: 'rgba(192, 57, 43, 0.1)',
                  color: '#c0392b',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Admin View
                </span>
              )}
            </div>

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

        {/* Member Overlapping Avatars, Progress & Create Task button for Admin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
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
                    background: i % 2 === 0 ? '#c0392b' : '#922b21',
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
          <div style={{ width: '120px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Progress</span>
              <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 700 }}>{calculatedProgress}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${calculatedProgress}%`, height: '100%', background: '#22c55e', borderRadius: '4px', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          {/* ADMIN ONLY: "+ Create Task" Button */}
          {isAdmin && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #c0392b 0%, #922b21 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(192, 57, 43, 0.25)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={16} strokeWidth={2.5} />
              Create Task
            </button>
          )}
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
      }}>
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
          }}>
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
          }}>
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
                    <span style={{
                      background: '#fff',
                      color: '#475569',
                      fontSize: '10px',
                      fontWeight: 700,
                      borderRadius: '8px',
                      padding: '2px 6px',
                      border: '1px solid #e2e8f0'
                    }}>
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
                        style={{
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                          position: 'relative'
                        }}
                      >
                        {/* Card Top Line */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: '#64748b',
                              background: '#f1f5f9',
                              padding: '2px 5px',
                              borderRadius: '4px'
                            }}>
                              {task.taskNumber || `#${task.id}`}
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

                          {/* Top Right Action: Admin Delete or Menu */}
                          {isAdmin ? (
                            <div style={{ position: 'relative' }}>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActionMenuTaskId(actionMenuTaskId === task.id ? null : task.id)
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
                              >
                                <MoreVertical size={14} />
                              </button>

                              {/* Admin Card Dropdown Menu */}
                              {actionMenuTaskId === task.id && (
                                <div 
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                                    zIndex: 50,
                                    minWidth: '150px',
                                    padding: '4px'
                                  }}
                                >
                                  {/* Quick status moves for Admin */}
                                  <div style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                                    Move to:
                                  </div>
                                  {['to-do', 'in-progress', 'in-testing', 'completed', 're-opened'].filter(s => s !== task.status).map(statusKey => (
                                    <button
                                      key={statusKey}
                                      onClick={() => {
                                        handleUpdateStatus(task.id, statusKey)
                                        setActionMenuTaskId(null)
                                      }}
                                      style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        background: 'none',
                                        border: 'none',
                                        padding: '6px 8px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: '#334155',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                      }}
                                      className="hover:bg-slate-50"
                                    >
                                      <ArrowRight size={12} color="#64748b" />
                                      {statusKey.replace('-', ' ')}
                                    </button>
                                  ))}
                                  <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
                                  <button
                                    onClick={() => {
                                      setActionMenuTaskId(null)
                                      handleDeleteTask(task.id)
                                    }}
                                    style={{
                                      width: '100%',
                                      textAlign: 'left',
                                      background: 'none',
                                      border: 'none',
                                      padding: '6px 8px',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      color: '#dc2626',
                                      cursor: 'pointer',
                                      borderRadius: '4px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}
                                    className="hover:bg-red-50"
                                  >
                                    <Trash2 size={12} color="#dc2626" />
                                    Delete Task
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button style={{ background: 'none', border: 'none', cursor: 'default', color: '#cbd5e1', padding: 2 }}>
                              <MoreVertical size={14} />
                            </button>
                          )}
                        </div>

                        {/* Title text */}
                        <p style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#1e293b',
                          margin: 0,
                          lineHeight: 1.4
                        }}>
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
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
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
                                    background: '#fef2f2',
                                    color: '#c0392b',
                                    border: '1px solid #fecaca',
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
                                  <Play size={8} fill="#059669" /> Resume
                                </button>
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
                              </>
                            )}

                            {col.key === 'in-progress' && (
                              <>
                                <button 
                                  onClick={() => handleSendToTesting(task.id)}
                                  style={{
                                    background: '#fffbeb',
                                    color: '#d97706',
                                    border: '1px solid #fef3c7',
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
                                  Testing
                                </button>
                                <button 
                                  onClick={() => handleCompleteTask(task.id)}
                                  style={{
                                    background: '#fef2f2',
                                    color: '#c0392b',
                                    border: '1px solid #fecaca',
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

                            {col.key === 'in-testing' && (
                              <button 
                                onClick={() => handleCompleteTask(task.id)}
                                style={{
                                  background: '#ecfdf5',
                                  color: '#059669',
                                  border: '1px solid #a7f3d0',
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
                                <Check size={9} strokeWidth={2.5} /> Approve
                              </button>
                            )}

                            {/* Admin Quick Delete Trash icon on card */}
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                title="Delete Task"
                                style={{
                                  background: '#fef2f2',
                                  border: '1px solid #fee2e2',
                                  borderRadius: '4px',
                                  padding: '3px 5px',
                                  cursor: 'pointer',
                                  color: '#ef4444',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginLeft: '2px'
                                }}
                              >
                                <Trash2 size={10} />
                              </button>
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
                background: 'linear-gradient(135deg, #c0392b, #922b21)',
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

      {/* ========================================================================= */}
      {/* ADMIN ONLY: Create Task Modal */}
      {/* ========================================================================= */}
      {isAdmin && isCreateModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => !submittingTask && setIsCreateModalOpen(false)}
        >
          <div 
            style={{
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #fafafa 0%, #f1f5f9 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  color: '#c0392b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Plus size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Create New Task
                  </h2>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Project: <strong>{project.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                disabled={submittingTask}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateTaskSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Task Title */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Task Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement real-time notifications workflow"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#c0392b'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide context, acceptance criteria or steps to reproduce..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#c0392b'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>

              {/* Priority & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Priority
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      color: '#0f172a',
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                    <option value="urgent">⚡ Urgent</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Initial Column
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      color: '#0f172a',
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_testing">In Testing</option>
                    <option value="reopened">Re-Opened</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Assignee & Role */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Assign Employee
                  </label>
                  <select
                    value={createForm.employeeId}
                    onChange={(e) => setCreateForm({ ...createForm, employeeId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      color: '#0f172a',
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    {employeesList.length > 0 ? (
                      employeesList.map(emp => {
                        const name = emp.name || emp.userId?.name || (emp.firstName ? `${emp.firstName} ${emp.lastName || ''}`.trim() : 'Employee')
                        return (
                          <option key={emp._id} value={emp._id}>
                            {name} ({emp.employeeId || 'Staff'})
                          </option>
                        )
                      })
                    ) : (
                      <>
                        <option value="adhil">Adhil (Developer)</option>
                        <option value="aswin">Aswin (Lead)</option>
                        <option value="rahul">Rahul (Frontend)</option>
                        <option value="neha">Neha (QA)</option>
                        <option value="faisal">Faisal (Fullstack)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Assignee Role
                  </label>
                  <input
                    type="text"
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    placeholder="e.g. Frontend Engineer"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Hours & Due Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={createForm.estimatedHours}
                    onChange={(e) => setCreateForm({ ...createForm, estimatedHours: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={createForm.dueDate}
                    onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '12px',
                paddingTop: '16px',
                borderTop: '1px solid #f1f5f9'
              }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={submittingTask}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTask}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #c0392b 0%, #922b21 100%)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: submittingTask ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(192, 57, 43, 0.25)'
                  }}
                >
                  {submittingTask ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Creating...
                    </>
                  ) : (
                    <>
                      <Check size={15} strokeWidth={2.5} /> Save & Create
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
