import apiClient from './apiClient'

// 1. Get all meetings
export const getAllMeetings = async (params = {}) => {
  const response = await apiClient.get('/meetings', { params })
  return response.data
}

// 2. Get my meetings (employee)
export const getMyMeetings = async () => {
  const response = await apiClient.get('/meetings/my')
  return response.data
}

// 3. Create meeting
export const createMeeting = async (data) => {
  const response = await apiClient.post('/meetings', data)
  return response.data
}

// 4. Update meeting
export const updateMeeting = async (id, data) => {
  const response = await apiClient.put(`/meetings/${id}`, data)
  return response.data
}

// 5. Delete meeting
export const deleteMeeting = async (id) => {
  const response = await apiClient.delete(`/meetings/${id}`)
  return response.data
}

// 6. Update RSVP
export const updateRSVP = async (id, status) => {
  const response = await apiClient.post(`/meetings/${id}/rsvp`, { status })
  return response.data
}
