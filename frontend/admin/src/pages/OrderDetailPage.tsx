import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import type { Order, OrderStatus } from '../types'
import { paymentStatusLabel, statusLabel, vnd } from '../utils/format'
import './OrderDetailPage.css'

const stages: Array<{ status: OrderStatus; label: string; icon: React.ReactNode }> = [
  { status: 'PENDING', label: 'Chờ xác nhận', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { status: 'CONFIRMED', label: 'Đã xác nhận', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  { status: 'SHIPPING', label: 'Đang giao', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  { status: 'COMPLETED', label: 'Hoàn thành', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg> },
]

export function OrderDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => { api<Order>(`/api/v1/admin/orders/${id}`).then(setOrder).catch((e: Error) => setErr(e.message)) }, [id])

  async function setStatus(status: OrderStatus) {
    try { setOrder(await api<Order>(`/api/v1/admin/orders/${id}/status`, { method:'PATCH', body:JSON.stringify({ status }) })); setErr('') }
    catch (e) { setErr((e as Error).message) }
  }
  if (err && !order) return <p className="error">{err}</p>
  if (!order) return <div className="admin-order-detail-loading"><span /><span /></div>

  const next: OrderStatus[] = order.status === 'PENDING' ? ['CONFIRMED','CANCELLED'] : order.status === 'CONFIRMED' ? ['SHIPPING','CANCELLED'] : order.status === 'SHIPPING' ? ['COMPLETED'] : []
  const currentStage = order.status === 'CANCELLED' ? -1 : stages.findIndex((stage) => stage.status === order.status)

  return <main className="admin-order-detail">
    <div className="admin-order-back">
      <button className="back-btn" onClick={() => nav('/orders')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Trở về danh sách
      </button>
    </div>

    <div className="admin-order-detail-grid">
      <div className="admin-order-detail-main">
        <section className={`admin-order-flow ${order.status === 'CANCELLED' ? 'cancelled' : ''}`}>
          {order.status === 'CANCELLED' ? (
            <div className="admin-order-cancel-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <b>Đơn hàng đã hủy</b>
              <span>Rất tiếc, đơn hàng này không còn hiệu lực.</span>
            </div>
          ) : (
            <div className="admin-order-progress">
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${(Math.max(0, currentStage) / (stages.length - 1)) * 100}%` }} />
              </div>
              <div className="progress-steps">
                {stages.map((stage, i) => {
                  const isReached = i <= currentStage
                  const isCurrent = i === currentStage
                  return <div key={stage.status} className={`step ${isReached ? 'reached' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="step-icon-wrapper">
                      {stage.icon}
                    </div>
                    <b>{stage.label}</b>
                  </div>
                })}
              </div>
            </div>
          )}
        </section>

        <article className="admin-order-products-panel card-premium">
          <header>
            <div className="panel-title-wrapper">
              <span className="panel-subtitle">Chi tiết sản phẩm</span>
              <h2>Danh sách mặt hàng</h2>
            </div>
            <div className="item-count">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {order.items.length} sản phẩm
            </div>
          </header>
          
          <div className="admin-order-products-list">
            {order.items.map((item) => (
              <div className="admin-order-detail-product" key={`${item.productId}-${item.variantSku ?? ''}`}>
                <div className="product-image-wrapper">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : <span>{item.productName.charAt(0)}</span>}
                </div>
                <div className="product-info">
                  <p className="product-name">{item.productName}</p>
                  <div className="product-meta">
                    <span className="variant-name">{item.variantName ?? 'Mặc định'}</span>
                    <span className="sku">SKU: {item.variantSku ?? '—'}</span>
                  </div>
                </div>
                <div className="product-price-qty">
                  <span>{vnd(item.price)}</span>
                  <span className="qty-multiplier">×</span>
                  <span className="qty-value">{item.quantity}</span>
                </div>
                <div className="product-subtotal">
                  {vnd(item.subtotal)}
                </div>
              </div>
            ))}
          </div>
          
          <footer>
            <div className="total-row">
              <span>Tổng thanh toán</span>
              <strong>{vnd(order.total)}</strong>
            </div>
          </footer>
        </article>

        {order.returnStatus !== 'NONE' && (
          <article className="admin-return-workflow card-premium danger-tinge">
            <header>
              <div className="panel-title-wrapper">
                <span className="panel-subtitle">Yêu cầu đổi trả</span>
                <h2>Quy trình xử lý hoàn trả riêng</h2>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="alert-icon"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </header>
            <footer>
              <Link className="btn btn-premium warning" to={`/returns/${order.id}`}>Mở trang xử lý đổi trả</Link>
            </footer>
          </article>
        )}
      </div>

      <aside className="admin-order-sidebar">
        <section className="card-premium customer-info-card">
          <div className="card-content">
            <span className="panel-subtitle">Thông tin nhận hàng</span>
            <h3>{order.fullName}</h3>
            
            <div className="info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <p>Đơn hàng #{order.orderCode ?? String(order.id).padStart(4,'0')}</p>
            </div>
            
            <div className="info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <p>Tạo lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            
            <div className="info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <p>{order.phone}</p>
            </div>
            
            <div className="info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <p>{order.address}</p>
            </div>
            
            {order.note && (
              <div className="info-note">
                <strong>Ghi chú:</strong> {order.note}
              </div>
            )}
          </div>
        </section>

        <section className="card-premium payment-info-card">
           <div className="card-content">
            <span className="panel-subtitle">Thông tin thanh toán</span>
            <dl>
              <div className="dl-row">
                <dt>Phương thức</dt>
                <dd className="payment-method-badge">
                  {order.paymentMethod === 'QR' ? (
                    <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Quét mã QR</>
                  ) : (
                    <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Khi nhận hàng</>
                  )}
                </dd>
              </div>
              <div className="dl-row">
                <dt>Trạng thái</dt>
                <dd><span className={`pill payment-${order.paymentStatus}`}>{paymentStatusLabel(order.paymentStatus)}</span></dd>
              </div>
            </dl>
          </div>
        </section>

        {next.length > 0 && (
          <section className="admin-order-actions card-premium">
            <span className="panel-subtitle">Hành động tiếp theo</span>
            <div className="actions-container">
              {next.map((status) => (
                <button 
                  key={status} 
                  className={`btn btn-premium ${status === 'CANCELLED' ? 'danger ghost' : 'primary'}`} 
                  onClick={() => void setStatus(status)}
                >
                  {status === 'CANCELLED' ? 'Hủy bỏ đơn hàng' : `Chuyển sang: ${statusLabel(status)}`}
                </button>
              ))}
            </div>
            <small className="action-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Trạng thái chỉ cho phép chuyển đổi tuần tự.
            </small>
          </section>
        )}
      </aside>
    </div>
    {err && <p className="error admin-order-detail-error">{err}</p>}
  </main>
}
