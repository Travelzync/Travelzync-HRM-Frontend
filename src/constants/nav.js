import {
  LayoutDashboard, Clock, Timer, CalendarDays, Home, Package,
  Umbrella, Bell, CheckSquare, Video, FileText, ClipboardList,
  LogOut, Settings, MessageSquare, Workflow, BarChart2,
  Users, Building2, DollarSign, Gift, ShieldAlert
} from 'lucide-react'

export const EMPLOYEE_NAV = [
  { label: 'Overview', path: '/employee/overview', icon: LayoutDashboard },
  { label: 'Attendance', path: '/employee/attendance', icon: Clock },
  { label: 'Overtime', path: '/employee/overtime', icon: Timer },
  { label: 'Leave', path: '/employee/leave', icon: CalendarDays },
  { label: 'Work From Home', path: '/employee/work-from-home', icon: Home },
  { label: 'Assets', path: '/employee/assets', icon: Package },
  { label: 'Holidays', path: '/employee/holidays', icon: Umbrella },
  { label: 'Notifications', path: '/employee/notifications', icon: Bell },
  { label: 'Tasks', path: '/employee/tasks', icon: CheckSquare },
  { label: 'Meeting Hub', path: '/employee/meeting-hub', icon: Video },
  { label: 'My Payslips', path: '/employee/payslips', icon: FileText },
  { label: 'Attendance Req', path: '/employee/attendance-request', icon: ClipboardList },
  { label: 'Resign', path: '/employee/resignation', icon: LogOut },
  { label: 'Settings', path: '/employee/settings', icon: Settings },
  { label: 'Chat', path: '/employee/chat', icon: MessageSquare },
  { label: 'TaskFlow', path: '/employee/taskflow', icon: Workflow },
  { label: 'Reports', path: '/employee/reports', icon: BarChart2 },
]

export const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Employees', path: '/admin/employees', icon: Users },
  { label: 'Departments', path: '/admin/departments', icon: Building2 },
  { label: 'Designations', path: '/admin/designations', icon: ClipboardList },
  { label: 'Leave Management', path: '/admin/leave-management', icon: CalendarDays },
  { label: 'Salary Structure', path: '/admin/salary-structure', icon: FileText },
  { label: 'Payroll', path: '/admin/payroll', icon: DollarSign },
  { label: 'Workflow', path: '/admin/workflow', icon: Workflow },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
]
