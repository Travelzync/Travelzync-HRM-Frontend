import apiClient from './apiClient'

// =====================================================
// TASKS
// =====================================================

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

// Change Task Status with mandatory/optional reason remarks (Admin & Assigned Employee)
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

// =====================================================
// EXTRA TIME REQUESTS
// =====================================================

// Create Extra Time Request (Employee)
export const createExtraTimeRequest = async (data) => {
  const response = await apiClient.post('/extra-time-requests', data)
  return response.data
}

// Get My Extra Time Requests (Employee)
export const getMyExtraTimeRequests = async () => {
  const response = await apiClient.get('/extra-time-requests/my')
  return response.data
}

// Get All Extra Time Requests (Admin)
export const getAllExtraTimeRequests = async () => {
  const response = await apiClient.get('/extra-time-requests')
  return response.data
}

// Approve Extra Time Request (Admin)
export const approveExtraTimeRequest = async (requestId, adminRemarks = '') => {
  const response = await apiClient.patch(`/extra-time-requests/${requestId}/approve`, { adminRemarks })
  return response.data
}

// Reject Extra Time Request (Admin)
export const rejectExtraTimeRequest = async (requestId, adminRemarks = '') => {
  const response = await apiClient.patch(`/extra-time-requests/${requestId}/reject`, { adminRemarks })
  return response.data
}

// =====================================================
// TIME TRACKING
// =====================================================

// Start tracking time on a task (Employee)
export const startTimeTracking = async (taskId, description = '') => {
  const response = await apiClient.post('/time-tracking/start', { taskId, description })
  return response.data
}

// Stop tracking time on a task (Employee)
export const stopTimeTracking = async (trackingId) => {
  const response = await apiClient.patch(`/time-tracking/${trackingId}/stop`)
  return response.data
}

// Get My Time Tracking sessions (Employee)
export const getMyTimeTracking = async () => {
  const response = await apiClient.get('/time-tracking/my')
  return response.data
}

// Get All Time Tracking sessions (Admin)
export const getAllTimeTracking = async () => {
  const response = await apiClient.get('/time-tracking')
  return response.data
}
