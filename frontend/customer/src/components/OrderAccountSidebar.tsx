import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import type { Category } from '../types'
import { CatIcon } from './CatIcon'
import './OrderAccountSidebar.css'

export function OrderAccountSidebar() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    api<Category[]>('/api/v1/categories').then((items) => setCategories(items.filter((item) => item.active))).catch(() => setCategories([]))
  }, [])

  return <aside className="order-account-sidebar">
    <header>
      <span>{user?.name?.charAt(0).toUpperCase() ?? 'K'}</span>
      <div><b>{user?.name ?? 'Khách hàng'}</b><small>{user?.email}</small></div>
    </header>
    <nav aria-label="Khu vực tài khoản">
      <Link to="/"><i>⌂</i><span>Trang chủ</span></Link>
      <Link to="/orders" className="active"><i>▣</i><span>Đơn hàng của tôi</span></Link>
    </nav>
    <div className="order-sidebar-categories">
      <p>Danh mục mua sắm</p>
      {categories.length === 0 && <small>Chưa có danh mục</small>}
      {categories.map((category) => <Link to={`/?categoryId=${category.id}`} key={category.id}>
        <CatIcon name={category.name} iconKey={category.iconKey} />
        <span>{category.name}</span>
      </Link>)}
    </div>
  </aside>
}
