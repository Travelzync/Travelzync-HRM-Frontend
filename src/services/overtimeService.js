import apiClient from './apiClient'

// Employee
export const createExtraTimeRequest = async (payload) => {
  const response = await apiClient.post('/extra-time-requests', payload)
  return response.data
}

export const getMyExtraTimeRequests = async () => {
  const response = await apiClient.get('/extra-time-requests/my')
  return response.data
}

// Admin
export const getAllExtraTimeRequests = async () => {
  const response = await apiClient.get('/extra-time-requests')
  return response.data
}

export const approveExtraTimeRequest = async (requestId, adminRemarks = '') => {
  const response = await apiClient.patch(`/extra-time-requests/${requestId}/approve`, {
    adminRemarks,
  })
  return response.data
}

export const rejectExtraTimeRequest = async (requestId, adminRemarks = '') => {
  const response = await apiClient.patch(`/extra-time-requests/${requestId}/reject`, {
    adminRemarks,
  })
  return response.data
}
