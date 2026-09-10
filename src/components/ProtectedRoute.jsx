import { Navigate } from 'react-router-dom'
import { isUserAuthenticated, getUserRole, clearAuthSession } from '../services/authService'

/**
 * A wrapper component that checks if the user is authenticated
 * and has the appropriate role to access a route.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component/layout to render if authorized
 * @param {string} props.allowedRole - The role required to access this route ('admin' or 'employee')
 */
export default function ProtectedRoute({ children, allowedRole }) {
  const authenticated = isUserAuthenticated()
  const userRole = getUserRole()

  if (!authenticated) {
    clearAuthSession()
    return <Navigate to="/login" replace />
  }

  if (allowedRole && userRole !== allowedRole) {
    const defaultRedirect = userRole === 'admin' ? '/admin/dashboard' : '/employee/overview'
    return <Navigate to={defaultRedirect} replace />
  }

  return children
}

