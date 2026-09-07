import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../services/api'
import type { Order } from '../../types'
import { vnd } from '../../utils/format'
import './OrderConfirmation.css'

export function OrderConfirmation() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    api<Order>(`/api/v1/orders/${id}`).then(setOrder).catch((e: Error) => setErr(e.message))
  }, [id])

  if (err) return <p className="error confirmation-load-error">{err}</p>
  if (!order) return <p className="muted confirmation-loading">Đang chuẩn bị xác nhận đơn hàng...</p>

  const isQr = order.paymentMethod === 'QR'

  return (
    <div className="confirmation-page">
      <ol className="checkout-steps confirmation-steps" aria-label="Tiến trình đặt hàng">
        <li className="done"><span>01</span><b>Giỏ hàng</b></li>
        <li className="done"><span>02</span><b>Thông tin giao</b></li>
        <li className="active" aria-current="step"><span>03</span><b>Xác nhận</b></li>
      </ol>

      <section className="confirmation-card">
        <div className="confirmation-main">
          <div className="confirmation-mark" aria-hidden="true">✓</div>
          <p className="confirmation-kicker">Đặt hàng thành công</p>
          <h1>Cảm ơn bạn đã mua sắm</h1>
          <p className="confirmation-copy">
            Đơn <strong>{order.orderCode ?? `#${String(order.id).padStart(4, '0')}`}</strong> đã được ghi nhận. MeoShop sẽ liên hệ khi đơn được xác nhận.
          </p>
          <div className="confirmation-contact">
            <div><span>Người nhận</span><b>{order.fullName}</b><small>{order.phone}</small></div>
            <div><span>Giao đến</span><p>{order.address}</p></div>
          </div>
          <div className="confirmation-actions">
            <Link className="btn" to={`/orders/${order.id}`}>Xem chi tiết đơn</Link>
            <Link className="confirmation-shop-link" to="/">Tiếp tục mua sắm →</Link>
          </div>
        </div>
        <aside className="confirmation-summary">
          <header><span>Đơn hàng</span><b>{order.orderCode ?? `#${String(order.id).padStart(4, '0')}`}</b></header>
          <ul>
            {order.items.map((item) => <li key={`${item.productId}-${item.variantSku ?? ''}`}><div><strong>{item.productName}</strong>{item.variantName && <small>{item.variantName}</small>}</div><span>×{item.quantity}</span><b>{vnd(item.subtotal)}</b></li>)}
          </ul>
          <dl>
            <div><dt>Thanh toán</dt><dd>{isQr ? 'Quét mã QR' : 'Khi nhận hàng'}</dd></div>
            <div><dt>Trạng thái</dt><dd className={isQr ? 'paid' : ''}>{isQr ? 'Đã thanh toán' : 'Chưa thanh toán'}</dd></div>
            <div className="confirmation-total"><dt>Tổng cộng</dt><dd>{vnd(order.total)}</dd></div>
          </dl>
        </aside>
      </section>
    </div>
  )
}
