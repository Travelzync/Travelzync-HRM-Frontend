import apiClient from './apiClient'

// Employee
export const applyAttendanceRequest = async (payload) => {
  const response = await apiClient.post('/attendance-requests/apply', payload)
  return response.data
}

export const getMyAttendanceRequests = async () => {
  const response = await apiClient.get('/attendance-requests/my')
  return response.data
}

// Admin
export const getAllAttendanceRequests = async () => {
  const response = await apiClient.get('/admin/attendance-requests')
  return response.data
}

export const updateAttendanceRequestStatus = async (id, payload) => {
  const response = await apiClient.patch(`/admin/attendance-requests/${id}/status`, payload)
  return response.data
}
