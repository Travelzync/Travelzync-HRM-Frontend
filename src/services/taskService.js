import apiClient from './apiClient'

export const getTasks = async () => {
  const response = await apiClient.get('/tasks')
  return response.data
}

export const getTaskById = async (taskId) => {
  const response = await apiClient.get(`/tasks/${taskId}`)
  return response.data
}
