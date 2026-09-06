import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

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
    <div className="auth-box">
      <h1>Tạo tài khoản</h1>
      <form className="form" onSubmit={(e) => void submit(e)}>
        <label>
          Tên
          <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        </label>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Mật khẩu
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} />
        </label>
        {err && <p className="error">{err}</p>}
        <button className="btn" type="submit">
          Đăng ký
        </button>
      </form>
    </div>
  )
}
