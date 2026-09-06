import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { NavIcon } from '../components/NavIcon'
import { CatIcon } from '../components/CatIcon'
import { UserMenu } from '../components/UserMenu'
import { Footer } from './Footer'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { api } from '../services/api'
import type { Category } from '../types'

function flattenCategories(rows: Category[]): Category[] {
  const out: Category[] = []
  for (const c of rows) {
    if (c.children?.length) out.push(...c.children.map((ch) => ({ ...ch, children: [] })))
    else out.push({ ...c, children: [] })
  }
  return out
}

export function ShopLayout() {
  const { user } = useAuth()
  const { cart } = useCart()
  const [q, setQ] = useState('')
  const [cats, setCats] = useState<Category[]>([])
  const nav = useNavigate()
  const loc = useLocation()
  const categoryId = new URLSearchParams(loc.search).get('categoryId') ?? ''
  const onHome = loc.pathname === '/'
  const showCats = onHome
  const widePage = loc.pathname === '/cart' || loc.pathname === '/checkout' || loc.pathname.startsWith('/orders')

  useEffect(() => {
    api<Category[]>('/api/v1/categories')
      .then((rows) => setCats(flattenCategories(rows)))
      .catch(() => setCats([]))
  }, [])

  return (
    <div className="shell">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark"><img src="/logo.png" alt="TVT Meow" /></span>
            <span className="brand-copy">
              <span className="brand-name">TVT <em>Meow</em></span>
              <small>Đồ ngon cho boss</small>
            </span>
          </Link>
          <form
            className="search"
            onSubmit={(e) => {
              e.preventDefault()
              nav(`/?q=${encodeURIComponent(q)}`)
            }}
          >
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
              <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm hạt, pate, snack, đồ chơi..."
            />
            <span className="search-hint" aria-hidden>⌘ K</span>
            <button type="submit"><span>Tìm</span><b aria-hidden>↗</b></button>
          </form>
          <div className="account-wrap">
            <div className="account">
              <NavLink to="/cart" className="account-item">
                <span className="nav-cart">
                  <NavIcon name="cart" />
                  {cart.itemCount > 0 && <span className="badge">{cart.itemCount}</span>}
                </span>
                Giỏ hàng
              </NavLink>
              {!user && (
                <>
                  <span className="account-sep">/</span>
                  <NavLink to="/login" className="account-item">
                    <NavIcon name="login" />
                    Đăng nhập
                  </NavLink>
                </>
              )}
            </div>
            {user && <UserMenu user={user} />}
          </div>
        </div>
        {showCats && (
          <div className="category-topbar">
          <div className="category-topbar-inner">
            <span className="category-topbar-title">Danh mục</span>
            <nav className="category-topbar-nav" aria-label="Danh mục sản phẩm">
              <Link to="/" className={onHome && !categoryId ? 'on' : ''} title="Trang chủ">
                <CatIcon name="Trang chủ" className="cat-ico" />
                <span>Trang chủ</span>
              </Link>
              {cats.map((c) => (
                <Link
                  key={c.id}
                  to={`/?categoryId=${c.id}`}
                  className={onHome && categoryId === String(c.id) ? 'on' : ''}
                  title={c.name}
                >
                  <CatIcon name={c.name} iconKey={c.iconKey} className="cat-ico" />
                  <span>{c.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          </div>
        )}
      </header>
      <div className="shop-body shop-body-plain">
        <main className="main">
          <div className={showCats ? 'main-inner' : `container${widePage ? ' container-wide' : ''}`}>
            <Outlet context={{ cats }} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
