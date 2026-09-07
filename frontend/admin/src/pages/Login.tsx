import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'

export function AdminLogin() {
  const { user, login } = useAdminAuth()
  const [email, setEmail] = useState('admin@shop.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  if (user) return <Navigate to="/" replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    try {
      await login(email, password)
      const from = (location.state as { from?: string } | null)?.from ?? '/'
      navigate(from, { replace: true })
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <main className="auth-box">
      <h1>Quản trị MeoShop</h1>
      <p className="muted">Đăng nhập bằng tài khoản ADMIN.</p>
      <form className="form" onSubmit={(event) => void submit(event)}>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Mật khẩu<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">Đăng nhập</button>
      </form>
      <p><a href={import.meta.env.VITE_SHOP_URL ?? 'http://localhost:5173'}>← Về cửa hàng</a></p>
    </main>
  )
}
