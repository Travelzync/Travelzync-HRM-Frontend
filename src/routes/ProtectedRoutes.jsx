import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, allowedRole }) {
  // 1. Check if the user is logged in
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  
  // 2. Check if they are an 'admin' or an 'employee'
  const userRole = localStorage.getItem('userRole') 

  // If they are NOT logged in, send them back to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If they ARE logged in, but trying to sneak into the wrong layout
  // (e.g. employee trying to open admin pages), redirect them to their home layout
  if (allowedRole && userRole !== allowedRole) {
    const defaultPage = userRole === 'admin' ? '/admin/dashboard' : '/employee/overview'
    return <Navigate to={defaultPage} replace />
  }

  // If they are logged in and have the correct role, let them in!
  return children
}