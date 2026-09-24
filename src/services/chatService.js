import apiClient from './apiClient'

// 1. Get available channels (public, private & department)
export const getChannels = async () => {
  const response = await apiClient.get('/chat/channels')
  return response.data
}

// 2. Create Channel / Group (Admin only)
export const createChannel = async (data) => {
  const response = await apiClient.post('/chat/channels', data)
  return response.data
}

// 3. Add Members to Group (Admin only)
export const addChannelMembers = async (channelId, userIds) => {
  const response = await apiClient.post(`/chat/channels/${channelId}/members`, { userIds })
  return response.data
}

// 4. Remove Member from Group (Admin only)
export const removeChannelMember = async (channelId, memberId) => {
  const response = await apiClient.delete(`/chat/channels/${channelId}/members/${memberId}`)
  return response.data
}

// 4b. Delete Channel / Group (Admin only)
export const deleteChannel = async (channelId) => {
  const response = await apiClient.delete(`/chat/channels/${channelId}`)
  return response.data
}

// 5. Get chat users for direct messaging
export const getChatUsers = async () => {
  const response = await apiClient.get('/chat/users')
  return response.data
}

// 6. Get online user IDs
export const getOnlineUsers = async () => {
  const response = await apiClient.get('/chat/online-users')
  return response.data
}

// 7. Get messages for a channel or direct chat
export const getMessages = async (params = {}) => {
  const response = await apiClient.get('/chat/messages', { params })
  return response.data
}

// 8. Send message
export const sendMessage = async (data) => {
  const response = await apiClient.post('/chat/send', data)
  return response.data
}

// 9. Pin / Unpin message
export const pinMessage = async (messageId) => {
  const response = await apiClient.patch(`/chat/messages/${messageId}/pin`)
  return response.data
}

// 10. Soft delete message
export const deleteMessage = async (messageId) => {
  const response = await apiClient.delete(`/chat/messages/${messageId}`)
  return response.data
}

// 11. React to message with emoji
export const reactToMessage = async (messageId, emoji) => {
  const response = await apiClient.post(`/chat/messages/${messageId}/react`, { emoji })
  return response.data
}

// 12. Forward message to channel or direct contact
export const forwardMessage = async (messageId, data) => {
  const response = await apiClient.post(`/chat/messages/${messageId}/forward`, data)
  return response.data
}

// 13. Mark conversation as read
export const markAsRead = async (data) => {
  const response = await apiClient.post('/chat/read', data)
  return response.data
}
