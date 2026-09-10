import apiClient from './apiClient'

// 1. Get CRM Stats
export const getCRMStats = async () => {
  const response = await apiClient.get('/crm/stats')
  return response.data
}

// 2. Leads
export const getAllLeads = async (params = {}) => {
  const response = await apiClient.get('/crm/leads', { params })
  return response.data
}

export const createLead = async (data) => {
  const response = await apiClient.post('/crm/leads', data)
  return response.data
}

export const updateLead = async (id, data) => {
  const response = await apiClient.put(`/crm/leads/${id}`, data)
  return response.data
}

export const addLeadNote = async (id, text) => {
  const response = await apiClient.post(`/crm/leads/${id}/note`, { text })
  return response.data
}

export const deleteLead = async (id) => {
  const response = await apiClient.delete(`/crm/leads/${id}`)
  return response.data
}

// 3. Tour Packages
export const getAllPackages = async (params = {}) => {
  const response = await apiClient.get('/crm/packages', { params })
  return response.data
}

export const createPackage = async (data) => {
  const response = await apiClient.post('/crm/packages', data)
  return response.data
}

export const updatePackage = async (id, data) => {
  const response = await apiClient.put(`/crm/packages/${id}`, data)
  return response.data
}

export const deletePackage = async (id) => {
  const response = await apiClient.delete(`/crm/packages/${id}`)
  return response.data
}

// 4. Bookings & Invoicing
export const getAllBookings = async (params = {}) => {
  const response = await apiClient.get('/crm/bookings', { params })
  return response.data
}

export const createBooking = async (data) => {
  const response = await apiClient.post('/crm/bookings', data)
  return response.data
}

export const updateBooking = async (id, data) => {
  const response = await apiClient.put(`/crm/bookings/${id}`, data)
  return response.data
}

export const deleteBooking = async (id) => {
  const response = await apiClient.delete(`/crm/bookings/${id}`)
  return response.data
}
