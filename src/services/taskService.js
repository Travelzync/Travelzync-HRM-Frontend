import apiClient from './apiClient'

// Get all tasks (Admin gets all, Employee gets assigned tasks)
export const getTasks = async (params = {}) => {
  const response = await apiClient.get('/tasks', { params })
  return response.data
}

// Get single task
export const getTaskById = async (taskId) => {
  const response = await apiClient.get(`/tasks/${taskId}`)
  return response.data
}

// Create Task (Admin only)
export const createTask = async (taskData) => {
  const response = await apiClient.post('/tasks', taskData)
  return response.data
}

// Update Task (Admin only)
export const updateTask = async (taskId, taskData) => {
  const response = await apiClient.put(`/tasks/${taskId}`, taskData)
  return response.data
}

// Delete Task (Admin only)
export const deleteTask = async (taskId) => {
  const response = await apiClient.delete(`/tasks/${taskId}`)
  return response.data
}

// Change Task Status (Admin & Assigned Employee)
export const updateTaskStatus = async (taskId, toStatus, remarks = '') => {
  const response = await apiClient.patch(`/tasks/${taskId}/status`, { toStatus, remarks })
  return response.data
}

// Get Task Flow History
export const getTaskFlowHistory = async (taskId) => {
  const response = await apiClient.get(`/tasks/${taskId}/flow`)
  return response.data
}

// Get Projects list
export const getProjects = async () => {
  const response = await apiClient.get('/projects')
  return response.data
}
