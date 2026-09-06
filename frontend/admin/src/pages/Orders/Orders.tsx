import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import type { Order, OrderStatus, PageResponse } from '../../types'
import { statusLabel, vnd } from '../../utils/format'
import './Orders.css'

type Filter = 'ALL' | OrderStatus
const filters: Array<{ value: Filter; label: string }> = [
  { value: 'ALL', label: 'Tất cả' }, { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' }, { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'COMPLETED', label: 'Hoàn thành' }, { value: 'CANCELLED', label: 'Đã hủy' },
]

export function Orders() {
  const [data, setData] = useState<PageResponse<Order> | null>(null)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [query, setQuery] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => { api<PageResponse<Order>>('/api/v1/admin/orders?size=100').then(setData).catch((e: Error) => setErr(e.message)) }, [])
  const orders = data?.content ?? []
  const counts = useMemo(() => filters.reduce<Record<string, number>>((result, item) => {
    result[item.value] = item.value === 'ALL' ? orders.length : orders.filter((order) => order.status === item.value).length
    return result
  }, {}), [orders])
  const visible = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('vi')
    return orders.filter((order) => {
      const statusMatches = filter === 'ALL' || order.status === filter
      const textMatches = !keyword || String(order.id).includes(keyword) || order.orderCode?.toLocaleLowerCase('vi').includes(keyword) || order.fullName.toLocaleLowerCase('vi').includes(keyword) || order.phone.includes(keyword) || order.items.some((item) => item.productName.toLocaleLowerCase('vi').includes(keyword))
      return statusMatches && textMatches
    })
  }, [orders, filter, query])

  return <main className="admin-orders-page">

    <nav className="admin-order-tabs" aria-label="Lọc đơn hàng">{filters.map((item) => <button key={item.value} className={filter === item.value ? 'active' : ''} onClick={() => setFilter(item.value)}>{item.label}<small>{counts[item.value] ?? 0}</small></button>)}</nav>
    <label className="admin-order-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm mã đơn, khách hàng, số điện thoại hoặc sản phẩm" /></label>
    {err && <p className="error">{err}</p>}
    {!data && <div className="admin-orders-loading"><span /><span /><span /></div>}
    {data && visible.length === 0 && <div className="admin-orders-empty"><b>Không có đơn phù hợp</b><p>Thử đổi trạng thái hoặc từ khóa tìm kiếm.</p></div>}
    <section className="admin-order-list">{visible.map((order) => <article className={`admin-order-row ${order.status === 'PENDING' || order.returnStatus === 'REQUESTED' ? 'needs-action' : ''}`} key={order.id}>
      <header><div><b>{order.orderCode ?? `#${String(order.id).padStart(4, '0')}`}</b><time>{new Date(order.createdAt).toLocaleString('vi-VN')}</time></div><div><span className={`pill ${order.status}`}>{statusLabel(order.status)}</span></div></header>
      <div className="admin-order-body"><div className="admin-order-customer"><span>Khách hàng</span><b>{order.fullName}</b><small>{order.phone}</small><p>{order.address}</p></div><div className="admin-order-products">{order.items.slice(0, 3).map((item) => <div key={`${item.productId}-${item.variantSku ?? ''}`}><div>{item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : <span>{item.productName.charAt(0)}</span>}</div><p><b>{item.productName}</b><small>{item.variantName ?? 'Mặc định'} · ×{item.quantity}</small></p><strong>{vnd(item.subtotal)}</strong></div>)}{order.items.length > 3 && <small className="admin-order-more">+{order.items.length - 3} sản phẩm khác</small>}</div></div>
      <footer><div><span>Tổng đơn</span><strong>{vnd(order.total)}</strong></div><Link className="btn" to={`/orders/${order.id}`}>{order.status === 'PENDING' || order.returnStatus === 'REQUESTED' ? 'Xử lý đơn' : 'Xem chi tiết'}</Link></footer>
    </article>)}</section>
  </main>
}
