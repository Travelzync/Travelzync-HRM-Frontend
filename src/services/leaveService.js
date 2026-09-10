import apiClient from './apiClient'

// Employee operations
export const applyLeave = async (leaveData) => {
  const response = await apiClient.post('/leave/apply', leaveData)
  return response.data
}

export const getMyLeaves = async () => {
  const response = await apiClient.get('/leave/my')
  return response.data
}

export const cancelLeave = async (leaveId) => {
  const response = await apiClient.patch(`/leave/${leaveId}/cancel`)
  return response.data
}

// Admin operations
export const getAllLeaves = async () => {
  const response = await apiClient.get('/admin/leaves')
  return response.data
}

export const updateLeaveStatus = async (leaveId, { status, adminRemarks }) => {
  const response = await apiClient.patch(`/admin/leaves/${leaveId}/status`, {
    status,
    adminRemarks,
  })
  return response.data
}
