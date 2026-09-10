import apiClient from './apiClient'

export const getDesignations = async () => {
  const response = await apiClient.get('/designations')
  return response.data
}

export const getDesignationsByDepartment = async (departmentId) => {
  const response = await apiClient.get(`/departments/${departmentId}/designations`)
  return response.data
}

export const getDesignationById = async (id) => {
  const response = await apiClient.get(`/designations/${id}`)
  return response.data
}

export const createDesignation = async (designationData) => {
  const response = await apiClient.post('/designations', designationData)
  return response.data
}

export const updateDesignation = async (id, designationData) => {
  const response = await apiClient.put(`/designations/${id}`, designationData)
  return response.data
}

export const deleteDesignation = async (id) => {
  const response = await apiClient.delete(`/designations/${id}`)
  return response.data
}
