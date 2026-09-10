import apiClient from './apiClient'

// Employee
export const applyWFH = async (payload) => {
  const response = await apiClient.post('/wfh/apply', payload)
  return response.data
}

export const getMyWFHRequests = async () => {
  const response = await apiClient.get('/wfh/my')
  return response.data
}

// Admin
export const getAllWFHRequests = async () => {
  const response = await apiClient.get('/admin/wfh')
  return response.data
}

export const updateWFHStatus = async (id, payload) => {
  const response = await apiClient.patch(`/admin/wfh/${id}/status`, payload)
  return response.data
}
