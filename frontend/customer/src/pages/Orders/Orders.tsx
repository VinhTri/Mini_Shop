import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import type { Order, PageResponse } from '../../types'
import { returnStatusLabel, statusLabel, vnd } from '../../utils/format'
import { OrderAccountSidebar } from '../../components/OrderAccountSidebar'
import './Orders.css'

type OrderFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED' | 'RETURN'
const canRequestReturn = (order: Order) => order.status === 'COMPLETED' && order.returnStatus === 'NONE' && (order.exchangeStatus ?? 'NONE') === 'NONE' && !!order.completedAt && Date.now() <= new Date(order.completedAt).getTime() + 7 * 86400000

const filters: Array<{ value: OrderFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'RETURN', label: 'Hậu mãi' },
]

export function Orders() {
  const [data, setData] = useState<PageResponse<Order> | null>(null)
  const [filter, setFilter] = useState<OrderFilter>('ALL')
  const [query, setQuery] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    api<PageResponse<Order>>('/api/v1/orders?size=50').then(setData).catch((e: Error) => setErr(e.message))
  }, [])

  const orders = data?.content ?? []
  const counts = useMemo(() => filters.reduce<Record<OrderFilter, number>>((result, item) => {
    result[item.value] = item.value === 'ALL'
      ? orders.length
      : item.value === 'RETURN'
        ? orders.filter((order) => order.returnStatus !== 'NONE' || order.exchangeStatus !== 'NONE').length
        : orders.filter((order) => order.status === item.value).length
    return result
  }, {} as Record<OrderFilter, number>), [orders])

  const visibleOrders = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('vi')
    return orders.filter((order) => {
      const matchesFilter = filter === 'ALL' || (filter === 'RETURN' ? order.returnStatus !== 'NONE' || order.exchangeStatus !== 'NONE' : order.status === filter)
      const matchesQuery = !keyword || String(order.id).includes(keyword) || order.orderCode?.toLocaleLowerCase('vi').includes(keyword) || order.fullName.toLocaleLowerCase('vi').includes(keyword) || order.items.some((item) => item.productName.toLocaleLowerCase('vi').includes(keyword))
      return matchesFilter && matchesQuery
    })
  }, [orders, filter, query])

  if (err) return <p className="error orders-state">{err}</p>
  if (!data) return <div className="orders-skeleton"><span /><span /><span /></div>

  return (
    <div className="order-account-layout">
      <OrderAccountSidebar />
      <main className="orders-page">
      <header className="orders-heading"><div><p>Tài khoản của bạn</p><h1>Đơn hàng</h1></div><span>{orders.length} đơn đã đặt</span></header>

      <nav className="order-tabs" aria-label="Lọc đơn hàng">
        {filters.map((item) => <button key={item.value} className={filter === item.value ? 'active' : ''} onClick={() => setFilter(item.value)}>{item.label}{counts[item.value] > 0 && <small>{counts[item.value]}</small>}</button>)}
      </nav>

      <label className="order-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo mã đơn hoặc tên sản phẩm" /></label>

      <section className="order-card-list">
        {visibleOrders.length === 0 && <div className="orders-empty"><strong>Không tìm thấy đơn hàng</strong><p>Thử chọn trạng thái khác hoặc thay đổi từ khóa tìm kiếm.</p><Link to="/">Tiếp tục mua sắm</Link></div>}
        {visibleOrders.map((order) => <article className="order-card" key={order.id}>
          <header>
            <div className="order-card-identity">
              <span className="order-card-number">{order.orderCode ?? `#${String(order.id).padStart(4, '0')}`}</span>
              <div>
                <b>Đơn hàng</b>
                <time>Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')}</time>
              </div>
            </div>
            <div className="order-card-status"><span>{statusLabel(order.status)}</span>{order.returnStatus !== 'NONE' && <small>{returnStatusLabel(order.returnStatus)}</small>}</div>
          </header>
          <div className="order-card-products">
            {order.items.map((item) => <Link to={`/products/${item.productId}`} className="order-product" key={`${item.productId}-${item.variantSku ?? ''}`}>
              <div className="order-product-image">{item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : <span>{item.productName.charAt(0)}</span>}</div>
              <div><strong>{item.productName}</strong>{item.variantName && <small>Phân loại: {item.variantName}</small>}<span>×{item.quantity}</span></div>
              <b>{vnd(item.subtotal)}</b>
            </Link>)}
          </div>
          <footer>
            <div><span>Thành tiền</span><strong>{vnd(order.total)}</strong></div>
            <div className="order-card-actions">
              <Link className="btn" to={`/orders/${order.id}`}>Xem chi tiết</Link>
              {order.status === 'COMPLETED' && order.items[0] && <Link className="btn ghost" to={`/products/${order.items[0].productId}`}>Đánh giá / Bình luận</Link>}
              {canRequestReturn(order) && <Link className="btn ghost" to={`/orders/${order.id}`}>Hoàn tiền / Đổi hàng</Link>}
              {order.status === 'COMPLETED' && (order.returnStatus !== 'NONE' || order.exchangeStatus !== 'NONE') && <Link className="btn ghost" to={`/orders/${order.id}`}>Xem yêu cầu hậu mãi</Link>}
              {(order.status === 'PENDING' || order.status === 'CONFIRMED') && <Link className="order-text-action" to={`/orders/${order.id}`}>Quản lý / Hủy đơn</Link>}
            </div>
          </footer>
        </article>)}
      </section>
      </main>
    </div>
  )
}
