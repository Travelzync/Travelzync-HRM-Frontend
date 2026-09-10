import apiClient from './apiClient'

// =====================================================
// Employee Attendance
// =====================================================

export const checkIn = async () => {
  const response = await apiClient.post('/attendance/check-in')
  return response.data
}

export const checkOut = async () => {
  const response = await apiClient.post('/attendance/check-out')
  return response.data
}

export const toggleBreak = async (note = '') => {
  const response = await apiClient.post('/attendance/break', { note })
  return response.data
}

export const getMyAttendance = async () => {
  const response = await apiClient.get('/attendance/my')
  return response.data
}

export const getTodayAttendance = async () => {
  const response = await apiClient.get('/attendance/today')
  return response.data
}

// =====================================================
// Admin Attendance
// =====================================================

export const getAllAttendance = async () => {
  const response = await apiClient.get('/attendance')
  return response.data
}

export const getEmployeeAttendance = async (employeeId) => {
  const response = await apiClient.get(`/attendance/employee/${employeeId}`)
  return response.data
}

export const updateAttendance = async (id, data) => {
  const response = await apiClient.put(`/attendance/${id}`, data)
  return response.data
}
