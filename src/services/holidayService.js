import apiClient from './apiClient'

// =====================================================
// Holiday Service
// =====================================================

export const getAllHolidays = async (params = {}) => {
  const response = await apiClient.get('/holidays', { params })
  return response.data
}

export const getUpcomingHolidays = async () => {
  const response = await apiClient.get('/holidays/upcoming')
  return response.data
}

export const createHoliday = async (data) => {
  const response = await apiClient.post('/holidays', data)
  return response.data
}

export const updateHoliday = async (id, data) => {
  const response = await apiClient.put(`/holidays/${id}`, data)
  return response.data
}

export const deleteHoliday = async (id) => {
  const response = await apiClient.delete(`/holidays/${id}`)
  return response.data
}
