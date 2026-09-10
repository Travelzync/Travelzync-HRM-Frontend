import apiClient from './apiClient'

// 1. Get available channels (public & department)
export const getChannels = async () => {
  const response = await apiClient.get('/chat/channels')
  return response.data
}

// 2. Get chat users for direct messaging
export const getChatUsers = async () => {
  const response = await apiClient.get('/chat/users')
  return response.data
}

// 3. Get messages for a channel or direct chat
export const getMessages = async (params = {}) => {
  const response = await apiClient.get('/chat/messages', { params })
  return response.data
}

// 4. Send message
export const sendMessage = async (data) => {
  const response = await apiClient.post('/chat/send', data)
  return response.data
}

// 5. Mark conversation as read
export const markAsRead = async (data) => {
  const response = await apiClient.post('/chat/read', data)
  return response.data
}
