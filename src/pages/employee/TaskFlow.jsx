import { useState, useMemo, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { 
  Play, Check, RefreshCw, Clock, MessageSquare, 
  MoreVertical, Search, Menu, Kanban, Table, List, 
  Calendar, Bug, CheckSquare, Plus, Trash2, X, Loader2,
  AlertCircle, Sparkles, User, ArrowRight, Lock, Unlock,
  Hourglass, CheckCircle2, XCircle, Timer, AlertTriangle, Send
} from 'lucide-react'
import { PROJECTS_DATA } from '../../components/ProjectsSidebar'
import { getCurrentUser, getUserRole } from '../../services/authService'
import { 
  getTasks, createTask, deleteTask, updateTaskStatus, getProjects,
  createExtraTimeRequest, getMyExtraTimeRequests, getAllExtraTimeRequests,
  approveExtraTimeRequest, rejectExtraTimeRequest,
  startTimeTracking, stopTimeTracking, getMyTimeTracking, getAllTimeTracking
} from '../../services/taskService'
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
    assignee: { name: 'Adhil', avatar: 'A', role: 'Frontend Dev' },
    progress: 0,
    estimatedHours: 2,
    timeSpentHours: 0,
    dueDate: '2026-09-20',
    duration: '0h 0m / 2h 0m',
    comments: 0
  },
  {
    id: '154',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 'to-do',
    title: 'Sales Pipeline - Project Overview Displays Only First Custom Service Row',
    assignee: { name: 'Neha', avatar: 'N', role: 'UI Engineer' },
    progress: 0,
    estimatedHours: 1.5,
    timeSpentHours: 0,
    dueDate: '2026-09-18',
    duration: '0h 0m / 1h 30m',
    comments: 0
  },
  {
    id: '84',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 're-opened',
    title: 'Leads Module - Sending Proposal via Email Fails with "Failed to send email" error',
    assignee: { name: 'Rahul', avatar: 'R', role: 'Backend Dev' },
    progress: 25,
    estimatedHours: 2,
    timeSpentHours: 2.5, // Exceeded -> Locked demo
    dueDate: '2026-09-12', // Expired
    duration: '2h 30m / 2h 0m',
    comments: 0,
    reopenCount: 1,
    lastRemark: 'Bug persisted when sending to multi-recipient cc list'
  },
  {
    id: '113',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 're-opened',
    title: 'Wallet Module - Download Invoice Button is Not Functioning',
    assignee: { name: 'Faisal', avatar: 'F', role: 'Fullstack Dev' },
    progress: 30,
    estimatedHours: 3,
    timeSpentHours: 1.2,
    dueDate: '2026-09-25',
    duration: '1h 12m / 3h 0m',
    comments: 4,
    reopenCount: 4,
    lastRemark: 'PDF generator throwing stream error on invoice print'
  },
  {
    id: '162',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 'in-progress',
    title: 'Employee Module - Reporting To Workflow Incorrect in Web View layout',
    assignee: { name: 'Aswin', avatar: 'A', role: 'Tech Lead' },
    progress: 60,
    estimatedHours: 4,
    timeSpentHours: 2.4,
    dueDate: '2026-09-22',
    duration: '2h 24m / 4h 0m',
    comments: 1,
    isTracking: true,
    lastRemark: 'Refactoring organizational tree component'
  },
  {
    id: '3',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 'in-testing',
    title: 'Forgot Password - OTP Verification Does Not Accept New Configurations',
    assignee: { name: 'Shruthi', avatar: 'S', role: 'QA Engineer' },
    progress: 80,
    estimatedHours: 3,
    timeSpentHours: 2.1,
    dueDate: '2026-09-21',
    duration: '2h 6m / 3h 0m',
    comments: 3,
    lastRemark: 'Ready for automated regression suite validation'
  },
  {
    id: '39',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 'in-testing',
    title: 'Employee Module - Phone Number Field Validation Missing on Signup',
    assignee: { name: 'John', avatar: 'J', role: 'QA Analyst' },
    progress: 80,
    estimatedHours: 2,
    timeSpentHours: 1.8,
    dueDate: '2026-09-22',
    duration: '1h 48m / 2h 0m',
    comments: 0
  },
  {
    id: '16',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 'completed',
    title: 'Dashboard - Role-Based Toppers Order is Inconsistent Between Panels',
    assignee: { name: 'Priya', avatar: 'P', role: 'Frontend Dev' },
    progress: 100,
    estimatedHours: 2,
    timeSpentHours: 1.5,
    dueDate: '2026-09-15',
    duration: '1h 30m / 2h 0m',
    comments: 0,
    lastRemark: 'Verified across Admin and Employee portals'
  },
  {
    id: '17',
    projectId: 'crm-app',
    priority: 'HIGH',
    status: 'completed',
    title: 'Dashboard - Switch Button UI is Inconsistent Between Mobile App and Desktop',
    assignee: { name: 'Kiran', avatar: 'K', role: 'Mobile Dev' },
    progress: 100,
    estimatedHours: 2,
    timeSpentHours: 1.9,
    dueDate: '2026-09-14',
    duration: '1h 54m / 2h 0m',
    comments: 0
  },
  // TravelZync Aura tasks
  {
    id: '201',
    projectId: 'travelzync-aura',
    priority: 'HIGH',
    status: 'to-do',
    title: 'Landing Page Redesign - Hero Section Button Click action triggers reload',
    assignee: { name: 'Amit', avatar: 'A', role: 'Frontend Dev' },
    progress: 0,
    estimatedHours: 4,
    timeSpentHours: 0,
    dueDate: '2026-09-25',
    duration: '0h 0m / 4h 0m',
    comments: 2
  },
  {
    id: '202',
    projectId: 'travelzync-aura',
    priority: 'MEDIUM',
    status: 'in-progress',
    title: 'Bugfix - Mobile Navigation Menu doesn\'t close on dashboard link selection',
    assignee: { name: 'Sneha', avatar: 'S', role: 'UI Engineer' },
    progress: 55,
    estimatedHours: 2,
    timeSpentHours: 1.1,
    dueDate: '2026-09-24',
    duration: '1h 6m / 2h 0m',
    comments: 1,
    isTracking: true
  },
  {
    id: '203',
    projectId: 'travelzync-aura',
    priority: 'LOW',
    status: 'completed',
    title: 'Setup ESLint rules and style guide formatting config in the workspace',
    assignee: { name: 'Deepak', avatar: 'D', role: 'DevOps' },
    progress: 100,
    estimatedHours: 1.5,
    timeSpentHours: 1.2,
    dueDate: '2026-09-10',
    duration: '1h 12m / 1h 30m',
    comments: 0
  }
]

// Seed Time Requests
const INITIAL_TIME_REQUESTS = [
  {
    _id: 'req-01',
    taskId: { _id: '84', title: 'Leads Module - Sending Proposal via Email Fails' },
    employeeId: { name: 'Rahul', employeeId: 'TZ-014', avatar: 'R' },
    requestedHours: 2,
    reason: 'Investigating third-party SMTP socket timeout on heavy file attachments.',
    status: 'pending',
    createdAt: '2026-09-13T10:15:00.000Z'
  },
  {
    _id: 'req-02',
    taskId: { _id: '113', title: 'Wallet Module - Download Invoice Button is Not Functioning' },
    employeeId: { name: 'Faisal', employeeId: 'TZ-022', avatar: 'F' },
    requestedHours: 1.5,
    reason: 'PDF template library migration required backward compatibility adjustments.',
    status: 'approved',
    adminRemarks: 'Approved for completion today.',
    createdAt: '2026-09-12T14:30:00.000Z'
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

// Convert hours to human readable (e.g. 2.5 -> "2h 30m")
const formatHours = (hours = 0) => {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

// Check if a task is locked due to time expiration
const isTaskTimeLocked = (task) => {
  if (task.status === 'completed') return false
  const timeLimit = Number(task.estimatedHours) || 0
  const spent = Number(task.timeSpentHours) || 0
  // Exceeded time limit
  if (timeLimit > 0 && spent >= timeLimit) return true
  // Passed due date
  if (task.dueDate) {
    const due = new Date(task.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (due < today) return true
  }
  return false
}

// Convert backend task format to frontend Kanban card format
const normalizeBackendTask = (task) => {
  let assigneeName = 'Unassigned'
  let assigneeAvatar = 'U'
  let assigneeRole = 'Engineer'

  if (task.assignedEmployees && task.assignedEmployees.length > 0) {
    const firstEmp = task.assignedEmployees[0]?.employeeId
    assigneeRole = task.assignedEmployees[0]?.role || 'Engineer'
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
  const estHours = Number(task.estimatedHours) || 2
  const spentHours = Number(task.timeSpentHours) || (mappedStatus === 'completed' ? estHours : (mappedStatus === 'in-progress' ? estHours * 0.5 : 0))

  return {
    id: task._id || task.id || String(Math.floor(Math.random() * 900 + 100)),
    rawId: task._id,
    taskNumber: task.taskNumber || `#${task._id ? task._id.slice(-4) : 'TASK'}`,
    projectId: typeof projId === 'string' ? projId : 'crm-app',
    priority: (task.priority || 'medium').toUpperCase(),
    status: mappedStatus,
    title: task.title,
    description: task.description || '',
    assignee: { name: assigneeName, avatar: assigneeAvatar, role: assigneeRole },
    progress: progressMap[mappedStatus] || 0,
    estimatedHours: estHours,
    timeSpentHours: spentHours,
    dueDate: task.dueDate ? String(task.dueDate).split('T')[0] : '',
    duration: `${formatHours(spentHours)} / ${formatHours(estHours)}`,
    comments: 0,
    isBackend: Boolean(task._id),
    lastRemark: ''
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
  const [activeSubTab, setActiveSubTab] = useState('Tasks') // 'Overview', 'Tasks', 'Time Requests', etc.
  const [activeView, setActiveView] = useState('Kanban')
  const [spinningId, setSpinningId] = useState(null)
  const [actionMenuTaskId, setActionMenuTaskId] = useState(null)

  // Extra Time Requests State
  const [extraTimeRequests, setExtraTimeRequests] = useState(INITIAL_TIME_REQUESTS)
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [extraTimeModalOpen, setExtraTimeModalOpen] = useState(false)
  const [extraTimeTargetTask, setExtraTimeTargetTask] = useState(null)
  const [extraTimeForm, setExtraTimeForm] = useState({ requestedHours: 2, reason: '' })
  const [submittingExtraTime, setSubmittingExtraTime] = useState(false)

  // Status Change Reason Modal State
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false)
  const [statusChangeTarget, setStatusChangeTarget] = useState(null) // { taskId, targetStatus, fromStatus }
  const [statusChangeReason, setStatusChangeReason] = useState('')
  const [submittingStatusChange, setSubmittingStatusChange] = useState(false)

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

  // Live Timer Tracker State (for Daily Productive Time)
  const [activeTrackingTaskId, setActiveTrackingTaskId] = useState('162') // Default Aswin active on 162
  const [activeSessionId, setActiveSessionId] = useState(null)

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
        const seedForProject = INITIAL_TASKS.filter(t => t.projectId === selectedProjectId)
        const combined = [...normalized, ...seedForProject.filter(s => !normalized.some(n => n.title === s.title))]
        setTasks(combined)
      } else {
        setTasks(INITIAL_TASKS)
      }
    } catch (err) {
      console.warn('Could not fetch backend tasks, using local fallback:', err)
      setTasks(INITIAL_TASKS)
    } finally {
      setLoading(false)
    }
  }, [selectedProjectId])

  // Fetch Extra Time Requests
  const fetchExtraTimeRequests = useCallback(async () => {
    try {
      setLoadingRequests(true)
      const res = isAdmin ? await getAllExtraTimeRequests() : await getMyExtraTimeRequests()
      if (res && res.success && Array.isArray(res.requests)) {
        setExtraTimeRequests(res.requests)
      }
    } catch (err) {
      console.warn('Could not load backend extra time requests, using mock store:', err)
    } finally {
      setLoadingRequests(false)
    }
  }, [isAdmin])

  // Load initial backend dependencies
  useEffect(() => {
    fetchTasks()
    fetchExtraTimeRequests()

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
          if (res?.projects) setDbProjects(res.projects)
        })
        .catch(err => console.warn('Could not load DB projects:', err))
    }
  }, [fetchTasks, fetchExtraTimeRequests, isAdmin])

  // Close card menus on outside click
  useEffect(() => {
    const handleDocumentClick = () => setActionMenuTaskId(null)
    window.addEventListener('click', handleDocumentClick)
    return () => window.removeEventListener('click', handleDocumentClick)
  }, [])

  // Calculate Productive Time Today
  const productiveTimeStats = useMemo(() => {
    // Sum hours of active tasks worked today
    const inProgressAndDone = tasks.filter(t => t.status === 'in-progress' || t.status === 'in-testing' || t.status === 'completed')
    const totalSpentToday = inProgressAndDone.reduce((sum, t) => sum + (Number(t.timeSpentHours) || 0), 0)
    const targetHours = 8.0
    const pct = Math.min(100, Math.round((totalSpentToday / targetHours) * 100))

    return {
      hoursFormatted: formatHours(totalSpentToday),
      hoursRaw: totalSpentToday,
      targetHours,
      percentage: pct,
      activeTasksCount: tasks.filter(t => t.status === 'in-progress').length
    }
  }, [tasks])

  // Calculate stats dynamically using static base stats adjusted by tasks
  const dynamicStats = useMemo(() => {
    const base = BASE_STATS[selectedProjectId] || DEFAULT_BASE_STATS
    const projectTasks = tasks.filter(t => t.projectId === selectedProjectId)

    const todoCount = projectTasks.filter(t => t.status === 'to-do').length
    const reopenedCount = projectTasks.filter(t => t.status === 're-opened').length
    const inProgressCount = projectTasks.filter(t => t.status === 'in-progress').length
    const inTestingCount = projectTasks.filter(t => t.status === 'in-testing').length
    const completedCount = projectTasks.filter(t => t.status === 'completed').length
    const lockedCount = projectTasks.filter(t => isTaskTimeLocked(t)).length

    return {
      total: Math.max(base.total, projectTasks.length),
      todo: Math.max(base.todo, todoCount),
      reopened: Math.max(base.reopened, reopenedCount),
      inProgress: Math.max(base.inProgress, inProgressCount),
      inTesting: Math.max(base.inTesting, inTestingCount),
      completed: Math.max(base.completed, completedCount),
      overdue: Math.max(base.overdue, lockedCount),
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

  // =========================================================================
  // STATUS CHANGE WITH MANDATORY REASON WORKFLOW
  // =========================================================================

  // Step 1: User clicks any status action -> Prompt reason modal
  const promptStatusChange = (taskId, targetStatus) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // If task is locked due to time expiration, and employee tries to move it -> block!
    if (!isAdmin && isTaskTimeLocked(task) && targetStatus !== 're-opened') {
      showWarning('This task has exceeded its allocated time and is locked. Please request extra time from Admin.')
      return
    }

    setStatusChangeTarget({
      taskId,
      targetStatus,
      fromStatus: task.status,
      taskTitle: task.title
    })
    setStatusChangeReason('')
    setStatusChangeModalOpen(true)
  }

  // Step 2: User confirms reason -> execute transition
  const handleConfirmStatusChange = async (e) => {
    e.preventDefault()
    if (!statusChangeReason.trim()) {
      showWarning('Please enter a reason or remarks for this status update.')
      return
    }

    if (!statusChangeTarget) return
    const { taskId, targetStatus, fromStatus } = statusChangeTarget

    try {
      setSubmittingStatusChange(true)
      const task = tasks.find(t => t.id === taskId)

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
          return { 
            ...t, 
            status: targetStatus, 
            progress: progressMap[targetStatus] || t.progress,
            lastRemark: statusChangeReason.trim()
          }
        }
        return t
      }))

      // Backend sync
      if (task?.rawId) {
        try {
          const backendStatus = statusToBackendMap[targetStatus] || 'todo'
          await updateTaskStatus(task.rawId, backendStatus, statusChangeReason.trim())
        } catch (err) {
          console.warn('Backend updateTaskStatus failed, persisted locally:', err)
        }
      }

      showSuccess(`Task moved from ${fromStatus.replace('-', ' ')} to ${targetStatus.replace('-', ' ')}!`)
      setStatusChangeModalOpen(false)
      setStatusChangeTarget(null)
      setStatusChangeReason('')
    } catch (err) {
      showError(err.message || 'Failed to update task status')
    } finally {
      setSubmittingStatusChange(false)
    }
  }

  // =========================================================================
  // EXTRA TIME REQUEST WORKFLOW
  // =========================================================================

  const handleOpenExtraTimeModal = (task) => {
    setExtraTimeTargetTask(task)
    setExtraTimeForm({ requestedHours: 2, reason: '' })
    setExtraTimeModalOpen(true)
  }

  const handleExtraTimeSubmit = async (e) => {
    e.preventDefault()
    if (!extraTimeForm.reason.trim()) {
      showWarning('Please state the reason why additional time is needed.')
      return
    }

    try {
      setSubmittingExtraTime(true)

      const payload = {
        taskId: extraTimeTargetTask.rawId || extraTimeTargetTask.id,
        requestedHours: Number(extraTimeForm.requestedHours) || 1,
        reason: extraTimeForm.reason.trim()
      }

      let createdReq = null
      try {
        const res = await createExtraTimeRequest(payload)
        if (res?.request) createdReq = res.request
      } catch (err) {
        console.warn('Backend createExtraTimeRequest failed, saving locally:', err)
      }

      // Local fallback representation
      if (!createdReq) {
        createdReq = {
          _id: `req-${Date.now()}`,
          taskId: { _id: extraTimeTargetTask.id, title: extraTimeTargetTask.title },
          employeeId: { name: extraTimeTargetTask.assignee.name, avatar: extraTimeTargetTask.assignee.avatar },
          requestedHours: Number(extraTimeForm.requestedHours) || 1,
          reason: extraTimeForm.reason.trim(),
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      }

      setExtraTimeRequests(prev => [createdReq, ...prev])
      showSuccess('Extra time request submitted! Admin will review and approve.')
      setExtraTimeModalOpen(false)
      setExtraTimeTargetTask(null)
    } catch (err) {
      showError(err.message || 'Failed to submit extra time request')
    } finally {
      setSubmittingExtraTime(false)
    }
  }

  // ADMIN: Approve Extra Time Request
  const handleApproveExtraTime = async (request) => {
    const remarks = window.prompt(`Approve ${request.requestedHours} hours for ${request.taskId?.title || 'Task'}? Enter optional remarks:`, 'Approved')
    if (remarks === null) return // cancelled

    try {
      try {
        await approveExtraTimeRequest(request._id, remarks)
      } catch (err) {
        console.warn('Backend approve extra time failed, updating locally:', err)
      }

      // Update extra time requests state
      setExtraTimeRequests(prev => prev.map(r => 
        r._id === request._id ? { ...r, status: 'approved', adminRemarks: remarks } : r
      ))

      // Update task estimated hours and unlock it
      const targetTaskId = request.taskId?._id || request.taskId?.id || request.taskId
      setTasks(prev => prev.map(t => {
        if (t.id === targetTaskId || t.rawId === targetTaskId) {
          const newEst = (Number(t.estimatedHours) || 0) + Number(request.requestedHours)
          return {
            ...t,
            estimatedHours: newEst,
            duration: `${formatHours(t.timeSpentHours)} / ${formatHours(newEst)}`
          }
        }
        return t
      }))

      showSuccess(`Approved +${request.requestedHours} hours! Task has been extended and unlocked.`)
    } catch (err) {
      showError(err.message || 'Failed to approve request')
    }
  }

  // ADMIN: Reject Extra Time Request
  const handleRejectExtraTime = async (request) => {
    const remarks = window.prompt(`Reject extra time request? Enter remarks for employee:`, 'Not approved due to schedule deadline')
    if (remarks === null) return

    try {
      try {
        await rejectExtraTimeRequest(request._id, remarks)
      } catch (err) {
        console.warn('Backend reject extra time failed, updating locally:', err)
      }

      setExtraTimeRequests(prev => prev.map(r => 
        r._id === request._id ? { ...r, status: 'rejected', adminRemarks: remarks } : r
      ))
      showWarning('Extra time request rejected.')
    } catch (err) {
      showError(err.message || 'Failed to reject request')
    }
  }

  // Toggle Live Time Tracker
  const handleToggleTimer = (task) => {
    if (activeTrackingTaskId === task.id) {
      // Pause
      setActiveTrackingTaskId(null)
      showSuccess(`Time tracking paused for Task #${task.id}`)
    } else {
      // Start
      setActiveTrackingTaskId(task.id)
      showSuccess(`Time tracking started on Task #${task.id}`)
    }
  }

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

      const estHours = Number(createForm.estimatedHours) || 2
      const payload = {
        projectId: targetProjectId,
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        assignedEmployees,
        estimatedHours: estHours,
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
          assignee: { name: selectedEmpName, avatar: selectedEmpName.charAt(0).toUpperCase(), role: createForm.role || 'Engineer' },
          progress: 0,
          estimatedHours: estHours,
          timeSpentHours: 0,
          dueDate: createForm.dueDate || '',
          duration: `0h 0m / ${formatHours(estHours)}`,
          comments: 0
        }
      }

      setTasks(prev => [createdTaskObj, ...prev])
      showSuccess('New task created successfully with time allocation!')
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

  // Count pending extra time requests for badge
  const pendingRequestsCount = useMemo(() => {
    return extraTimeRequests.filter(r => r.status === 'pending').length
  }, [extraTimeRequests])

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
      
      {/* ========================================================================= */}
      {/* 1. Project Header Row */}
      {/* ========================================================================= */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '14px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Title and Badge controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              {isAdmin ? (
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
                  Admin Portal
                </span>
              ) : (
                <span style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#2563eb',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Staff Portal
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
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
                ⚡ High Priority
              </span>
            </div>
          </div>
        </div>

        {/* Productive Time Widget, Members & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* Daily Productive Time Tracker Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Timer size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                  {isAdmin ? "Team Today's Productive:" : "My Productive Time Today:"}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                  {productiveTimeStats.hoursFormatted}
                </span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '1px 5px', borderRadius: '4px' }}>
                  {productiveTimeStats.percentage}%
                </span>
              </div>
              <div style={{ width: '130px', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                <div style={{ width: `${productiveTimeStats.percentage}%`, height: '100%', background: '#10b981', transition: 'width 0.3s' }} />
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ width: '110px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Project</span>
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

      {/* ========================================================================= */}
      {/* 2. Row of Stat Cards (8 items) */}
      {/* ========================================================================= */}
      <div style={{
        padding: '12px 24px 6px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(125px, 1fr))',
        gap: '10px'
      }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>Total Tasks</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '3px 0 0 0', lineHeight: 1 }}>{dynamicStats.total}</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>To Do</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '3px 0 0 0', lineHeight: 1 }}>{dynamicStats.todo}</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>In Progress</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: '#3b82f6', margin: '3px 0 0 0', lineHeight: 1 }}>{dynamicStats.inProgress}</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>In Testing</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: '#f59e0b', margin: '3px 0 0 0', lineHeight: 1 }}>{dynamicStats.inTesting}</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>Completed</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: '#22c55e', margin: '3px 0 0 0', lineHeight: 1 }}>{dynamicStats.completed}</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>Time Expired</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: '#b91c1c', margin: '3px 0 0 0', lineHeight: 1 }}>{dynamicStats.overdue}</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>Re-Opened</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444', margin: '3px 0 0 0', lineHeight: 1 }}>{dynamicStats.reopened}</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>With Bugs</p>
          <p style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '3px 0 0 0', lineHeight: 1 }}>{dynamicStats.bugs}</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Navigation Sub-tabs & View Toggles & Search Row */}
      {/* ========================================================================= */}
      <div style={{
        padding: '6px 24px 8px',
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
            const isTimeRequests = tab === 'Time Requests'
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
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {tab}
                {isTimeRequests && pendingRequestsCount > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '9px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    padding: '1px 5px',
                    lineHeight: 1
                  }}>
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* View Selection & Board Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {activeSubTab === 'Tasks' && (
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
                { id: 'List', icon: List }
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
          )}

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

      {/* ========================================================================= */}
      {/* 4. Main Scrolling Content Pane */}
      {/* ========================================================================= */}
      <div style={{ flex: 1, overflowY: isMobile ? 'visible' : 'auto' }} className="hide-scroll">
        
        {/* SUB-TAB: TASKS KANBAN BOARD */}
        {activeSubTab === 'Tasks' && activeView === 'Kanban' && (
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
                    minWidth: isMobile ? '100%' : '275px',
                    width: isMobile ? '100%' : '275px',
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
                    {columnTasks.map((task) => {
                      const isLocked = isTaskTimeLocked(task)
                      const isTracking = activeTrackingTaskId === task.id

                      return (
                        <div
                          key={task.id}
                          style={{
                            background: '#fff',
                            border: isLocked ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            boxShadow: isTracking ? '0 0 0 2px rgba(16, 185, 129, 0.4)' : '0 1px 3px rgba(0,0,0,0.02)',
                            position: 'relative',
                            transition: 'all 0.2s'
                          }}
                        >
                          {/* Card Top Line */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
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

                              {/* Time Locked Indicator */}
                              {isLocked && (
                                <span style={{
                                  fontSize: '9px',
                                  fontWeight: 800,
                                  color: '#b91c1c',
                                  background: '#fee2e2',
                                  padding: '2px 5px',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px'
                                }}>
                                  <Lock size={9} /> Locked
                                </span>
                              )}

                              {/* Active Tracking Indicator */}
                              {isTracking && (
                                <span style={{
                                  fontSize: '9px',
                                  fontWeight: 800,
                                  color: '#059669',
                                  background: '#ecfdf5',
                                  padding: '2px 5px',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}>
                                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} />
                                  Working
                                </span>
                              )}
                            </div>

                            {/* Top Right Action: Admin Dropdown Menu */}
                            {isAdmin && (
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
                                      minWidth: '160px',
                                      padding: '4px'
                                    }}
                                  >
                                    <div style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                                      Move to:
                                    </div>
                                    {['to-do', 'in-progress', 'in-testing', 'completed', 're-opened'].filter(s => s !== task.status).map(statusKey => (
                                      <button
                                        key={statusKey}
                                        onClick={() => {
                                          setActionMenuTaskId(null)
                                          promptStatusChange(task.id, statusKey)
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

                          {/* Last Status Remark (if any) */}
                          {task.lastRemark && (
                            <div style={{
                              background: '#f8fafc',
                              borderLeft: '2px solid #94a3b8',
                              padding: '4px 8px',
                              borderRadius: '2px',
                              fontSize: '10px',
                              color: '#475569',
                              fontStyle: 'italic',
                              lineHeight: 1.3
                            }}>
                              "{task.lastRemark}"
                            </div>
                          )}

                          {/* Assignee & Active Role */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
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
                              <span style={{ fontSize: '11px', color: '#334155', fontWeight: 600 }}>
                                {task.assignee.name}
                              </span>
                              <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                                • {task.assignee.role || 'Staff'}
                              </span>
                            </div>

                            {/* Live Timer play/pause for Employee on in-progress tasks */}
                            {task.status === 'in-progress' && (
                              <button
                                onClick={() => handleToggleTimer(task)}
                                title={isTracking ? "Pause Tracking" : "Start Tracking"}
                                style={{
                                  background: isTracking ? '#ecfdf5' : '#f1f5f9',
                                  color: isTracking ? '#059669' : '#64748b',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '3px 6px',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <Clock size={11} />
                                {isTracking ? 'Active' : 'Clock In'}
                              </button>
                            )}
                          </div>

                          {/* Time & Duration Spent vs Allocated */}
                          <div style={{
                            background: isLocked ? '#fff1f2' : '#f8fafc',
                            borderRadius: '6px',
                            padding: '6px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>
                              Time Allocated:
                            </span>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: isLocked ? '#e11d48' : '#0f172a' }}>
                              {task.duration}
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
                                background: isLocked ? '#ef4444' : col.color,
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
                            gap: '8px',
                            flexWrap: 'wrap'
                          }}>
                            {/* Due date */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                              <Calendar size={11} />
                              <span style={{ fontSize: '10px', fontWeight: 500 }}>
                                {task.dueDate || 'No due date'}
                              </span>
                            </div>

                            {/* Column & Lock-Specific Action Buttons */}
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              {/* If Locked due to time: show Request Extra Time button */}
                              {isLocked ? (
                                <button
                                  onClick={() => handleOpenExtraTimeModal(task)}
                                  style={{
                                    background: '#fef2f2',
                                    color: '#b91c1c',
                                    border: '1px solid #fecaca',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  <Hourglass size={10} /> Request Extra Time
                                </button>
                              ) : (
                                <>
                                  {/* TO-DO ACTIONS */}
                                  {col.key === 'to-do' && (
                                    <>
                                      <button 
                                        onClick={() => promptStatusChange(task.id, 'in-progress')}
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
                                        onClick={() => promptStatusChange(task.id, 'completed')}
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

                                  {/* RE-OPENED ACTIONS */}
                                  {col.key === 're-opened' && (
                                    <>
                                      <button 
                                        onClick={() => promptStatusChange(task.id, 'in-progress')}
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

                                  {/* IN-PROGRESS ACTIONS */}
                                  {col.key === 'in-progress' && (
                                    <>
                                      <button 
                                        onClick={() => promptStatusChange(task.id, 'in-testing')}
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
                                        onClick={() => promptStatusChange(task.id, 'completed')}
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

                                  {/* IN-TESTING ACTIONS */}
                                  {col.key === 'in-testing' && (
                                    <>
                                      <button 
                                        onClick={() => promptStatusChange(task.id, 'completed')}
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
                                      <button 
                                        onClick={() => promptStatusChange(task.id, 're-opened')}
                                        style={{
                                          background: '#fef2f2',
                                          color: '#b91c1c',
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
                                        <Bug size={9} /> Re-Open Bug
                                      </button>
                                    </>
                                  )}
                                </>
                              )}

                              {/* Admin Trash Quick Delete */}
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
                      )
                    })}

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
        )}

        {/* SUB-TAB: TIME REQUESTS (EMPLOYEE & ADMIN) */}
        {activeSubTab === 'Time Requests' && (
          <div style={{ padding: '24px' }}>
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Extra Time Requests
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                    {isAdmin 
                      ? 'Review and approve extra time requested by staff to unlock tasks.' 
                      : 'Track the approval status of your extra time requests.'}
                  </p>
                </div>
              </div>

              {/* Table of requests */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontWeight: 700 }}>
                      <th style={{ padding: '10px 12px' }}>Task Title</th>
                      <th style={{ padding: '10px 12px' }}>Employee</th>
                      <th style={{ padding: '10px 12px' }}>Requested</th>
                      <th style={{ padding: '10px 12px' }}>Reason</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px' }}>Admin Remarks</th>
                      {isAdmin && <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {extraTimeRequests.map((req) => (
                      <tr key={req._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#0f172a' }}>
                          {req.taskId?.title || 'General Task Extension'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontWeight: 600, color: '#334155' }}>
                            {req.employeeId?.name || 'Staff'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}>
                            +{req.requestedHours} hrs
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#475569', maxWidth: '280px' }}>
                          {req.reason}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: req.status === 'approved' ? '#ecfdf5' : (req.status === 'rejected' ? '#fef2f2' : '#fffbeb'),
                            color: req.status === 'approved' ? '#059669' : (req.status === 'rejected' ? '#dc2626' : '#d97706'),
                            fontWeight: 700,
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            textTransform: 'capitalize'
                          }}>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#64748b' }}>
                          {req.adminRemarks || '—'}
                        </td>
                        {isAdmin && (
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            {req.status === 'pending' ? (
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                <button
                                  onClick={() => handleApproveExtraTime(req)}
                                  style={{
                                    background: '#ecfdf5',
                                    color: '#059669',
                                    border: '1px solid #a7f3d0',
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
                                  onClick={() => handleRejectExtraTime(req)}
                                  style={{
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
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
                              <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600 }}>Resolved</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                    {extraTimeRequests.length === 0 && (
                      <tr>
                        <td colSpan={isAdmin ? 7 : 6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                          No extra time requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB: OTHER VIEWS PLACEHOLDER */}
        {activeSubTab !== 'Tasks' && activeSubTab !== 'Time Requests' && (
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
              {activeSubTab} View
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', textAlign: 'center', maxWidth: '320px' }}>
              You are currently viewing the {activeSubTab} section. Switch back to "Tasks" to interact with the active Kanban board!
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
              Back to Tasks
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. MANDATORY STATUS CHANGE REASON MODAL */}
      {/* ========================================================================= */}
      {statusChangeModalOpen && statusChangeTarget && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => !submittingStatusChange && setStatusChangeModalOpen(false)}
        >
          <div 
            style={{
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              width: '100%',
              maxWidth: '480px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '18px 20px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Update Task Status
                </h3>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Please enter remarks/reason for moving this task
                </p>
              </div>
              <button
                onClick={() => setStatusChangeModalOpen(false)}
                disabled={submittingStatusChange}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Transition Badge */}
            <div style={{
              padding: '12px 20px',
              background: '#f1f5f9',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <span style={{
                background: '#fff',
                color: '#475569',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px',
                textTransform: 'uppercase'
              }}>
                {statusChangeTarget.fromStatus.replace('-', ' ')}
              </span>
              <ArrowRight size={16} color="#94a3b8" />
              <span style={{
                background: '#c0392b',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px',
                textTransform: 'uppercase'
              }}>
                {statusChangeTarget.targetStatus.replace('-', ' ')}
              </span>
            </div>

            {/* Reason Form */}
            <form onSubmit={handleConfirmStatusChange} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                  Task: {statusChangeTarget.taskTitle}
                </p>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Reason / Remarks <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={statusChangeReason}
                  onChange={(e) => setStatusChangeReason(e.target.value)}
                  placeholder="Explain why this status is being changed (e.g., 'Implemented fix for date formatting, ready for testing')..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#c0392b'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setStatusChangeModalOpen(false)}
                  disabled={submittingStatusChange}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStatusChange}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #c0392b 0%, #922b21 100%)',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: submittingStatusChange ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {submittingStatusChange ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Confirm Status Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. EMPLOYEE REQUEST EXTRA TIME MODAL */}
      {/* ========================================================================= */}
      {extraTimeModalOpen && extraTimeTargetTask && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => !submittingExtraTime && setExtraTimeModalOpen(false)}
        >
          <div 
            style={{
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              width: '100%',
              maxWidth: '460px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '18px 20px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fef2f2'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hourglass size={20} color="#b91c1c" />
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#991b1b', margin: 0 }}>
                    Request Extra Time
                  </h3>
                  <p style={{ fontSize: '11px', color: '#b91c1c', margin: '2px 0 0 0' }}>
                    Task is locked or requires additional hours
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExtraTimeModalOpen(false)}
                disabled={submittingExtraTime}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExtraTimeSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Task: {extraTimeTargetTask.title}
                </p>
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Current Allocated: <strong>{formatHours(extraTimeTargetTask.estimatedHours)}</strong>
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Additional Hours Needed <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="50"
                  required
                  value={extraTimeForm.requestedHours}
                  onChange={(e) => setExtraTimeForm({ ...extraTimeForm, requestedHours: e.target.value })}
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
                  Reason for Extra Time <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={extraTimeForm.reason}
                  onChange={(e) => setExtraTimeForm({ ...extraTimeForm, reason: e.target.value })}
                  placeholder="Explain why the task requires more time..."
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setExtraTimeModalOpen(false)}
                  disabled={submittingExtraTime}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingExtraTime}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: submittingExtraTime ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {submittingExtraTime ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Submit Request to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. ADMIN ONLY: CREATE TASK MODAL */}
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
                    resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#c0392b'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>

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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Allocated Hours <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="100"
                    required
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
                      <Check size={15} strokeWidth={2.5} /> Save & Create Task
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
