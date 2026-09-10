import apiClient from './apiClient'

// 1. Get my notifications
export const getMyNotifications = async (params = {}) => {
  const response = await apiClient.get('/notifications', { params })
  return response.data
}

// 2. Get unread count
export const getUnreadCount = async () => {
  const response = await apiClient.get('/notifications/unread-count')
  return response.data
}

// 3. Mark single notification as read
export const markNotificationAsRead = async (id) => {
  const response = await apiClient.patch(`/notifications/${id}/read`)
  return response.data
}

// 4. Mark all as read
export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.patch('/notifications/read-all')
  return response.data
}

// 5. Send broadcast announcement (Admin only)
export const sendBroadcastNotification = async (data) => {
  const response = await apiClient.post('/notifications/broadcast', data)
  return response.data
}

// 6. Delete notification
export const deleteNotification = async (id) => {
  const response = await apiClient.delete(`/notifications/${id}`)
  return response.data
}
