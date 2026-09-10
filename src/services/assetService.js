import apiClient from './apiClient'

// =====================================================
// Asset Service
// =====================================================

export const getAllAssets = async (params = {}) => {
  const response = await apiClient.get('/assets', { params })
  return response.data
}

export const getMyAssets = async () => {
  const response = await apiClient.get('/assets/my')
  return response.data
}

export const createAsset = async (data) => {
  const response = await apiClient.post('/assets', data)
  return response.data
}

export const updateAsset = async (id, data) => {
  const response = await apiClient.put(`/assets/${id}`, data)
  return response.data
}

export const assignAsset = async (id, data) => {
  const response = await apiClient.patch(`/assets/${id}/assign`, data)
  return response.data
}

export const returnAsset = async (id, data = {}) => {
  const response = await apiClient.patch(`/assets/${id}/return`, data)
  return response.data
}

export const deleteAsset = async (id) => {
  const response = await apiClient.delete(`/assets/${id}`)
  return response.data
}
