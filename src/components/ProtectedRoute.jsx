import { Navigate } from 'react-router-dom'

/**
 * A wrapper component that checks if the user is authenticated
 * and has the appropriate role to access a route.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component/layout to render if authorized
 * @param {string} props.allowedRole - The role required to access this route ('admin' or 'employee')
 */
export default function ProtectedRoute({ children, allowedRole }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const userRole = localStorage.getItem('userRole') // 'admin' or 'employee'

  if (!isAuthenticated) {
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />
  }

  if (allowedRole && userRole !== allowedRole) {
    // If role doesn't match, redirect to their default home page
    const defaultRedirect = userRole === 'admin' ? '/admin/dashboard' : '/employee/overview'
    return <Navigate to={defaultRedirect} replace />
  }

  return children
}
