import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function PrivateRoute() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (user) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
