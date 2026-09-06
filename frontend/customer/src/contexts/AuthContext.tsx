import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { mergeGuestCartToServer } from '../utils/guestCart'
import { api } from '../services/api'
import type { AuthResponse, User } from '../types'

type AuthCtx = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

function readUser(): User | null {
  const token = localStorage.getItem('minishop_token')
  const raw = localStorage.getItem('minishop_user')
  if (!token || !raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readUser)

  function persist(res: AuthResponse) {
    localStorage.setItem('minishop_token', res.token)
    localStorage.setItem('minishop_user', JSON.stringify(res.user))
  }

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      async login(email, password) {
        const res = await api<AuthResponse>('/api/v1/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        persist(res)
        setUser(res.user)
        try {
          await mergeGuestCartToServer()
        } catch (error) {
          console.warn('Đăng nhập thành công nhưng chưa đồng bộ được giỏ hàng khách.', error)
        }
      },
      async register(name, email, password) {
        const res = await api<AuthResponse>('/api/v1/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        })
        persist(res)
        setUser(res.user)
        try {
          await mergeGuestCartToServer()
        } catch (error) {
          console.warn('Đăng ký thành công nhưng chưa đồng bộ được giỏ hàng khách.', error)
        }
      },
      logout() {
        localStorage.removeItem('minishop_token')
        localStorage.removeItem('minishop_user')
        setUser(null)
      },
    }),
    [user],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('AuthProvider missing')
  return ctx
}
