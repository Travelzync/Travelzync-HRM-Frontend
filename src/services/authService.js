import apiClient from './apiClient'

/**
 * Login user (Admin via email, Employee via email or employeeId)
 * @param {Object} credentials - { email, employeeId, password }
 * @returns {Promise<Object>} Response data { success, message, token, user }
 */
export const loginUser = async (credentials) => {
  const response = await apiClient.post('/login', credentials)
  return response.data
}

/**
 * Persist authentication session
 * @param {string} token - JWT token
 * @param {Object} user - User object
 */
export const setAuthSession = (token, user) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('userRole', user.role)
  localStorage.setItem('isAuthenticated', 'true')
}

/**
 * Clear authentication session
 */
export const clearAuthSession = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('userRole')
  localStorage.removeItem('isAuthenticated')
}

/**
 * Get current authenticated user
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.error('Error parsing stored user:', err)
    return null
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isUserAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true' && Boolean(localStorage.getItem('token'))
}

/**
 * Get current user role
 * @returns {string|null}
 */
export const getUserRole = () => {
  return localStorage.getItem('userRole') || null
}
