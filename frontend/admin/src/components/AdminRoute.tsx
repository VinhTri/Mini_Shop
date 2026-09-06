import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'

export function AdminRoute() {
  const { user } = useAdminAuth()
  const location = useLocation()
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}
