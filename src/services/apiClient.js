import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.travelzynclabs.in'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

// Request interceptor to attach JWT bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle unauthenticated 401 responses
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear authentication state
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userRole')
      localStorage.removeItem('isAuthenticated')

      // If we are not already on the login page, redirect
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
