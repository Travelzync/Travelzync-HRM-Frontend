import apiClient from './apiClient'

export const getEmployees = async () => {
  const response = await apiClient.get('/employees')
  return response.data
}

export const getEmployeeById = async (id) => {
  const response = await apiClient.get(`/employees/${id}`)
  return response.data
}

export const createEmployee = async (formData) => {
  const response = await apiClient.post('/employees', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const updateEmployee = async (id, formData) => {
  // If formData is FormData, pass multipart/form-data headers
  const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData
  const response = await apiClient.put(`/employees/${id}`, formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' },
  })
  return response.data
}

export const deleteEmployee = async (id) => {
  const response = await apiClient.delete(`/employees/${id}`)
  return response.data
}
