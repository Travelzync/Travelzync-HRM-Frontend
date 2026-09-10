import apiClient from './apiClient'

// =====================================================
// Payroll & Salary Structure Service
// =====================================================

// Salary Structures
export const getAllSalaryStructures = async () => {
  const response = await apiClient.get('/salary-structures')
  return response.data
}

export const getEmployeeSalaryStructure = async (employeeId) => {
  const response = await apiClient.get(`/salary-structures/employee/${employeeId}`)
  return response.data
}

export const createSalaryStructure = async (data) => {
  const response = await apiClient.post('/salary-structures', data)
  return response.data
}

export const updateSalaryStructure = async (id, data) => {
  const response = await apiClient.patch(`/salary-structures/${id}`, data)
  return response.data
}

// Payroll
export const getAllPayrolls = async (params = {}) => {
  const response = await apiClient.get('/payroll', { params })
  return response.data
}

export const getMyPayrolls = async () => {
  const response = await apiClient.get('/payroll/my')
  return response.data
}

export const getPayrollById = async (id) => {
  const response = await apiClient.get(`/payroll/${id}`)
  return response.data
}

export const generatePayroll = async (data) => {
  const response = await apiClient.post('/payroll', data)
  return response.data
}

export const processPayroll = async (id) => {
  const response = await apiClient.patch(`/payroll/${id}/process`)
  return response.data
}

export const markPayrollAsPaid = async (id, data = {}) => {
  const response = await apiClient.patch(`/payroll/${id}/pay`, data)
  return response.data
}
