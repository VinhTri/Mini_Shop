import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import '../Login/Login.css'

export function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setErr('')
    try {
      await register(name, email, password)
      nav('/')
    } catch (ex) {
      setErr((ex as Error).message)
    }
  }

  return (
    <div className="auth-split">
      <aside className="auth-welcome">
        <img src="/logo.png" alt="MeoShop" />
        <h1>
          Meo<span>Shop</span>
          <span className="auth-welcome-sep">|</span>
          Đồng hành cùng bạn chăm sóc boss mỗi ngày.
        </h1>
        <p>Tạo tài khoản để lưu giỏ hàng, theo dõi đơn và mua sắm thuận tiện hơn.</p>
      </aside>

      <div className="auth-panel">
        <h2>Tạo tài khoản</h2>
        <p className="muted">Chỉ mất một phút để bắt đầu mua sắm cùng MeoShop.</p>
        <form className="form" onSubmit={(e) => void submit(e)}>
          <label>
            Họ và tên
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn An"
              autoComplete="name"
              required
              minLength={2}
            />
          </label>
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="ban@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Mật khẩu
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              autoComplete="new-password"
              required
              minLength={6}
            />
          </label>
          {err && <p className="error" aria-live="polite">{err}</p>}
          <button className="btn" type="submit">Tạo tài khoản</button>
        </form>
        <p className="muted" style={{ marginTop: 16 }}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}
