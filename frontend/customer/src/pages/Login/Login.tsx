import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Login.css'

export function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState('user@shop.com')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setErr('')
    try {
      await login(email, password)
      const from = (loc.state as { from?: string } | null)?.from
      nav(from || '/')
    } catch (ex) {
      setErr((ex as Error).message)
    }
  }

  return (
    <div className="auth-split">
      <aside className="auth-welcome">
        <img src="/logo.png" alt="TVT Meow" />
        <h1>
          TVT <span>Meow</span>
          <span className="auth-welcome-sep">|</span>
          Đồ ăn &amp; phụ kiện cho mèo, trải nghiệm dễ dàng.
        </h1>
        <p>
          Đăng nhập để xem sản phẩm mới, quản lý đơn hàng và nhận ưu đãi riêng. Hỗ trợ thanh toán COD toàn quốc.
        </p>
      </aside>

      <div className="auth-panel">
        <h2>Đăng nhập</h2>
        <form className="form" onSubmit={(e) => void submit(e)}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            Mật khẩu
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </label>
          {err && <p className="error">{err}</p>}
          <button className="btn" type="submit">
            Vào TVT Meow
          </button>
        </form>
        <p className="muted" style={{ marginTop: 16 }}>
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </div>
    </div>
  )
}
