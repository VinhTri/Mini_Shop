import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import type { Category } from '../types'
import { CatIcon } from './CatIcon'
import './OrderAccountSidebar.css'

type AccountSection = 'cart' | 'orders'

export function OrderAccountSidebar({ active }: { active: AccountSection }) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    api<Category[]>('/api/v1/categories').then((items) => setCategories(items.filter((item) => item.active))).catch(() => setCategories([]))
  }, [])

  return <aside className="order-account-sidebar">
    <nav aria-label="Khu vực tài khoản">
      <Link to="/cart" className={active === 'cart' ? 'active' : undefined}><i>🛒</i><span>Giỏ hàng</span></Link>
      <Link to="/orders" className={active === 'orders' ? 'active' : undefined}><i>▣</i><span>Đơn hàng của tôi</span></Link>
    </nav>
    <div className="order-sidebar-categories">
      <p>Danh mục mua sắm</p>
      <Link to="/">
        <CatIcon name="Trang chủ" />
        <span>Trang chủ</span>
      </Link>
      {categories.length === 0 && <small>Chưa có danh mục</small>}
      {categories.map((category) => <Link to={`/?categoryId=${category.id}`} key={category.id}>
        <CatIcon name={category.name} iconKey={category.iconKey} />
        <span>{category.name}</span>
      </Link>)}
    </div>
  </aside>
}
