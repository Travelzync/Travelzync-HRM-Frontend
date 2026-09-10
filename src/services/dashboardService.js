import apiClient from './apiClient'

// Get Real-time Admin Dashboard aggregated statistics
export const getAdminDashboardStats = async () => {
  const response = await apiClient.get('/admin/dashboard-stats')
  return response.data
}
