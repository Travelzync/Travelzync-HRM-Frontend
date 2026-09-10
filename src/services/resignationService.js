import apiClient from './apiClient'

// =====================================================
// Resignation Service
// =====================================================

export const submitResignation = async (data) => {
  const response = await apiClient.post('/resignation/submit', data)
  return response.data
}

export const getMyResignation = async () => {
  const response = await apiClient.get('/resignation/my')
  return response.data
}

export const withdrawResignation = async () => {
  const response = await apiClient.patch('/resignation/withdraw')
  return response.data
}

export const getAllResignations = async (params = {}) => {
  const response = await apiClient.get('/admin/resignations', { params })
  return response.data
}

export const updateResignationStatus = async (id, data) => {
  const response = await apiClient.patch(`/admin/resignations/${id}/status`, data)
  return response.data
}

export const updateExitClearance = async (id, data) => {
  const response = await apiClient.patch(`/admin/resignations/${id}/clearance`, data)
  return response.data
}
