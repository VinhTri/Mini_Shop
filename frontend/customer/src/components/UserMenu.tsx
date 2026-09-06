import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { NavIcon } from './NavIcon'
import { useAuth } from '../contexts/AuthContext'
import type { User } from '../types'
import './UserMenu.css'

function initials(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  if (parts[0]) return parts[0].slice(0, 2).toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

export function UserMenu({ user }: { user: User }) {
  const { logout } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpen(false)
  }, [loc.pathname])

  useEffect(() => {
    if (!open) return

    function onPointer(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="user-menu" ref={wrap}>
      <button
        type="button"
        className={`user-chip${open ? ' open' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="user-avatar">{initials(user.name, user.email)}</span>
        <span className="user-chip-text">
          <b>{user.name}</b>
          <small>{user.email}</small>
        </span>
      </button>
      {open && (
        <div className="user-drop" role="menu">
          <div className="user-drop-head">
            <span className="user-avatar">{initials(user.name, user.email)}</span>
            <div>
              <b>{user.name}</b>
              <small>{user.email}</small>
            </div>
          </div>
          <Link to="/orders" role="menuitem" onClick={() => setOpen(false)}>
            <NavIcon name="orders" />
            Đơn hàng
          </Link>
          {user.role === 'ADMIN' && (
            <a href={import.meta.env.VITE_ADMIN_URL ?? 'http://localhost:5174'} role="menuitem">
              <NavIcon name="admin" />
              Admin
            </a>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              logout()
              nav('/')
            }}
          >
            <NavIcon name="logout" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
