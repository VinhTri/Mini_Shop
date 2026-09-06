import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAdminAuth } from '../contexts/AdminAuthContext'

type IconName = 'dashboard' | 'category' | 'product' | 'order' | 'return' | 'exchange' | 'interaction' | 'store' | 'logout'

function SidebarIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    category: <><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5z" /><path d="M13 5.5A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 13 9.5z" /><path d="M4 14.5A1.5 1.5 0 0 1 5.5 13h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5z" /><path d="M13 16.5h7M16.5 13v7" /></>,
    product: <><path d="m4 7 8-4 8 4-8 4z" /><path d="M4 7v10l8 4 8-4V7" /><path d="M12 11v10" /></>,
    order: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
    return: <><path d="M9 7 5 11l4 4"/><path d="M5 11h9a5 5 0 0 1 5 5v2"/><path d="M7 4h10a2 2 0 0 1 2 2v3"/></>,
    exchange: <><path d="M7 7h11l-3-3"/><path d="m18 7-3 3"/><path d="M17 17H6l3 3"/><path d="m6 17 3-3"/></>,
    interaction: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-5 4v-4.5A2.5 2.5 0 0 1 4 13.5z"/><path d="M8 8h8M8 12h5"/></>,
    store: <><path d="M3 10h18l-2-6H5z" /><path d="M5 10v10h14V10M9 20v-6h6v6" /><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></>,
    logout: <><path d="M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5" /><path d="m15 8 4 4-4 4M9 12h10" /></>,
  }
  return <svg className="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>
}

export function AdminLayout() {
  const { user, logout } = useAdminAuth()
  const navigate = useNavigate()
  const initial = user?.name?.trim().charAt(0).toUpperCase() || 'A'

  return (
    <div className="admin">
      <aside className="side">
        <Link to="/" className="side-brand">
          <img src="/logo.png" alt="TVT Meow" />
          <span><b>TVT <em>Meow</em></b><small>Admin workspace</small></span>
        </Link>

        <nav className="side-nav" aria-label="Điều hướng quản trị">
          <span className="side-nav-label">Quản lý</span>
          <NavLink to="/" end><SidebarIcon name="dashboard" /><span>Tổng quan</span></NavLink>
          <NavLink to="/categories"><SidebarIcon name="category" /><span>Danh mục</span></NavLink>
          <NavLink to="/products"><SidebarIcon name="product" /><span>Sản phẩm</span></NavLink>
          <NavLink to="/orders"><SidebarIcon name="order" /><span>Đơn hàng</span></NavLink>
          <NavLink to="/returns"><SidebarIcon name="return" /><span>Hoàn tiền</span></NavLink>
          <NavLink to="/exchanges"><SidebarIcon name="exchange" /><span>Đổi hàng</span></NavLink>
          <NavLink to="/interactions"><SidebarIcon name="interaction" /><span>Tư vấn sản phẩm</span></NavLink>
        </nav>

        <div className="side-footer">
          <a href={import.meta.env.VITE_SHOP_URL ?? 'http://localhost:5173'} className="side-store-link">
            <SidebarIcon name="store" /><span>Về cửa hàng</span><b aria-hidden>↗</b>
          </a>
          <div className="side-user">
            <span className="side-avatar">{initial}</span>
            <span className="side-user-copy"><strong>{user?.name ?? 'Quản trị viên'}</strong><small>Quản trị hệ thống</small></span>
            <button type="button" onClick={() => { logout(); navigate('/login') }} title="Đăng xuất" aria-label="Đăng xuất"><SidebarIcon name="logout" /></button>
          </div>
        </div>
      </aside>
      <div className="admin-main"><Outlet /></div>
    </div>
  )
}
