import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { api } from '../services/api'
import type { AuthResponse, User } from '../types'

type AdminAuthContextValue = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const Context = createContext<AdminAuthContextValue | null>(null)

function readAdmin(): User | null {
  const token = localStorage.getItem('minishop_token')
  const raw = localStorage.getItem('minishop_admin_user')
  if (!token || !raw) return null
  try {
    const user = JSON.parse(raw) as User
    if (user.role !== 'ADMIN') {
      localStorage.removeItem('minishop_token')
      localStorage.removeItem('minishop_admin_user')
      return null
    }
    return user
  } catch {
    localStorage.removeItem('minishop_token')
    localStorage.removeItem('minishop_admin_user')
    return null
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readAdmin)

  const value = useMemo<AdminAuthContextValue>(() => ({
    user,
    async login(email, password) {
      const result = await api<AuthResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (result.user.role !== 'ADMIN') {
        localStorage.removeItem('minishop_token')
        localStorage.removeItem('minishop_admin_user')
        throw new Error('Tài khoản không có quyền truy cập trang quản trị.')
      }
      localStorage.setItem('minishop_token', result.token)
      localStorage.setItem('minishop_admin_user', JSON.stringify(result.user))
      setUser(result.user)
    },
    logout() {
      localStorage.removeItem('minishop_token')
      localStorage.removeItem('minishop_admin_user')
      setUser(null)
    },
  }), [user])

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useAdminAuth() {
  const value = useContext(Context)
  if (!value) throw new Error('AdminAuthProvider missing')
  return value
}
