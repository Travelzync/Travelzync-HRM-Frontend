import { createBrowserRouter, Navigate } from 'react-router-dom'

import Login from '../pages/auth/Login'
import EmployeeLayout from '../layouts/EmployeeLayout'
import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from '../components/ProtectedRoute'
// Employee pages
import Overview from '../pages/employee/Overview'
import EAttendance from '../pages/employee/Attendance'
import Overtime from '../pages/employee/Overtime'
import Leave from '../pages/employee/Leave'
import WorkFromHome from '../pages/employee/WorkFromHome'
import EAssets from '../pages/employee/Assets'
import EHolidays from '../pages/employee/Holidays'
import ENotifications from '../pages/employee/Notifications'
import Tasks from '../pages/employee/Tasks'
import MeetingHub from '../pages/employee/MeetingHub'
import Payslips from '../pages/employee/Payslips'
import AttendanceRequest from '../pages/employee/AttendanceRequest'
import Resignation from '../pages/employee/Resignation'
import ESettings from '../pages/employee/Settings'
import Chat from '../pages/employee/Chat'
import TaskFlow from '../pages/employee/TaskFlow'
import EReports from '../pages/employee/Reports'

// Admin pages
import Dashboard from '../pages/admin/Dashboard'
import Employees from '../pages/admin/Employees'
import Departments from '../pages/admin/Departments'
import AAttendance from '../pages/admin/Attendance'
import LeaveManagement from '../pages/admin/LeaveManagement'
import Payroll from '../pages/admin/Payroll'
import AAssets from '../pages/admin/Assets'
import AHolidays from '../pages/admin/Holidays'
import ANotifications from '../pages/admin/Notifications'
import AReports from '../pages/admin/Reports'
import ASettings from '../pages/admin/Settings'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <Login /> },
  {
    path: '/employee',
    element: (
      <ProtectedRoute allowedRole="employee">
        <EmployeeLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="overview" replace /> },
      { path: 'overview', element: <Overview /> },
      { path: 'attendance', element: <EAttendance /> },
      { path: 'overtime', element: <Overtime /> },
      { path: 'leave', element: <Leave /> },
      { path: 'work-from-home', element: <WorkFromHome /> },
      { path: 'assets', element: <EAssets /> },
      { path: 'holidays', element: <EHolidays /> },
      { path: 'notifications', element: <ENotifications /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'meeting-hub', element: <MeetingHub /> },
      { path: 'payslips', element: <Payslips /> },
      { path: 'attendance-request', element: <AttendanceRequest /> },
      { path: 'resignation', element: <Resignation /> },
      { path: 'settings', element: <ESettings /> },
      { path: 'chat', element: <Chat /> },
      { path: 'taskflow', element: <TaskFlow /> },
      { path: 'reports', element: <EReports /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'employees', element: <Employees /> },
      { path: 'departments', element: <Departments /> },
      { path: 'attendance', element: <AAttendance /> },
      { path: 'leave-management', element: <LeaveManagement /> },
      { path: 'payroll', element: <Payroll /> },
      { path: 'assets', element: <AAssets /> },
      { path: 'holidays', element: <AHolidays /> },
      { path: 'notifications', element: <ANotifications /> },
      { path: 'reports', element: <AReports /> },
      { path: 'settings', element: <ASettings /> },
      
    ],
  },
])

export default router
