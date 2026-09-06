import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { api } from '../../services/api'
import { vnd } from '../../utils/format'
import { clearCartSelection, readCartSelection } from '../../utils/cartSelection'
import type { PaymentMethod } from '../../types'
import './Checkout.css'

export function Checkout() {
  const nav = useNavigate()
  const { cart } = useCart()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD')
  const [showQr, setShowQr] = useState(false)
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const cartItemIds = readCartSelection()
  const selectedIds = new Set(cartItemIds)
  const selectedItems = cart.items.filter((item) => selectedIds.has(item.id))
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0)
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0)

  function validate() {
    setErr('')
    if (!cartItemIds.length) {
      setErr('Hãy quay lại giỏ hàng và chọn ít nhất một sản phẩm.')
      return false
    }
    if (!/^(0|\+84)[0-9]{9}$/.test(phone.replace(/\s/g, ''))) {
      setErr('Số điện thoại chưa đúng định dạng Việt Nam.')
      return false
    }
    return true
  }

  async function createOrder() {
    setSubmitting(true)
    try {
      const order = await api<{ id: number }>('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify({ fullName, phone, address, note, paymentMethod, cartItemIds }),
      })
      clearCartSelection()
      nav(`/checkout/confirmation/${order.id}`)
    } catch (ex) {
      setErr((ex as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    if (paymentMethod === 'QR') {
      setShowQr(true)
      return
    }
    await createOrder()
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(`TVTMEOW|${selectedTotal}|${phone.replace(/\s/g, '')}`)}`

  return (
    <div className="checkout-page">
      <header className="checkout-head">
        <div><p>Thông tin giao hàng</p><h1>Hoàn tất đơn của boss</h1><span>Nhập địa chỉ và chọn cách thanh toán phù hợp.</span></div>
        <Link to="/cart">← Quay lại giỏ</Link>
      </header>

      <div className="checkout-layout">
        <section className="checkout-form-panel">
          <div className="checkout-panel-head"><div><span>Giao tận cửa</span><h2>Người nhận hàng</h2></div><small>* Bắt buộc</small></div>
          <form className="checkout-form" onSubmit={(e) => void submit(e)}>
            <div className="checkout-field-row">
              <label><span>Họ và tên *</span><input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn An" autoComplete="name" required maxLength={80} /></label>
              <label><span>Số điện thoại *</span><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xx xxx xxx" autoComplete="tel" inputMode="tel" required maxLength={20} /></label>
            </div>
            <label>
              <span>Địa chỉ nhận hàng *</span>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố" autoComplete="street-address" required rows={4} maxLength={255} />
              <small>Ghi đầy đủ để đơn được giao nhanh và chính xác.</small>
            </label>
            <label>
              <span>Ghi chú cho TVT Meow</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: giao giờ hành chính, gọi trước khi đến" rows={3} maxLength={200} />
              <small>{note.length}/200 ký tự</small>
            </label>
            <fieldset className="checkout-payment">
              <legend>Phương thức thanh toán *</legend>
              <div className="checkout-payment-options">
                <label className={paymentMethod === 'COD' ? 'selected' : ''}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                  <span className="checkout-payment-icon" aria-hidden="true">₫</span>
                  <span><b>Thanh toán khi nhận hàng</b><small>Thanh toán tiền mặt cho người giao hàng</small></span>
                </label>
                <label className={paymentMethod === 'QR' ? 'selected' : ''}>
                  <input type="radio" name="payment" value="QR" checked={paymentMethod === 'QR'} onChange={() => setPaymentMethod('QR')} />
                  <span className="checkout-payment-icon checkout-payment-qr" aria-hidden="true">▦</span>
                  <span><b>Quét mã QR</b><small>Quét mã bằng ứng dụng ngân hàng</small></span>
                </label>
              </div>
            </fieldset>
            {err && <p className="error checkout-error" aria-live="polite">{err}</p>}
            <div className="checkout-form-foot">
              <button className="btn checkout-submit" type="submit" disabled={submitting || !selectedItems.length}>
                {submitting ? 'Đang tạo đơn...' : `Xác nhận thông tin - ${vnd(selectedTotal)}`}
              </button>
              <div><b>{paymentMethod === 'QR' ? 'Thanh toán QR' : 'Thanh toán COD'}</b><span>{paymentMethod === 'QR' ? 'Quét mã sau khi xác nhận' : 'Nhận hàng rồi thanh toán'}</span></div>
            </div>
          </form>
        </section>

        <aside className="checkout-summary">
          <ol className="checkout-steps checkout-summary-steps" aria-label="Tiến trình đặt hàng">
            <li className="done"><span><img src="/checkout-steps/cart.png" alt="" aria-hidden="true" /></span><b>Giỏ hàng</b></li>
            <li className="active" aria-current="step"><span><img src="/checkout-steps/delivery.png" alt="" aria-hidden="true" /></span><b>Thông tin giao</b></li>
            <li><span><img src="/checkout-steps/confirm.png" alt="" aria-hidden="true" /></span><b>Xác nhận</b></li>
          </ol>
          <div className="checkout-summary-head"><div><span>Đơn đã chọn</span><h2>{selectedCount} sản phẩm</h2></div><b>{paymentMethod}</b></div>
          <ul>
            {selectedItems.map((item) => (
              <li key={item.id}>
                <div className="checkout-product-image"><img src={item.imageUrl} alt={item.name} /><span>{item.quantity}</span></div>
                <div><strong>{item.name}</strong><small>Kích cỡ: {item.variantName} · {vnd(item.price)} / sp</small></div>
                <b>{vnd(item.subtotal)}</b>
              </li>
            ))}
          </ul>
          {!selectedItems.length && <p className="checkout-no-items">Chưa có sản phẩm được chọn.</p>}
          <div className="checkout-summary-row"><span>Tạm tính</span><b>{vnd(selectedTotal)}</b></div>
          <div className="checkout-summary-row"><span>Phí vận chuyển</span><b className="checkout-free">Miễn phí</b></div>
          <div className="checkout-summary-total"><span>Tổng thanh toán</span><strong>{vnd(selectedTotal)}</strong></div>
        </aside>
      </div>

      {showQr && (
        <div className="qr-overlay" role="dialog" aria-modal="true" aria-labelledby="qr-title">
          <section className="qr-dialog">
            <button className="qr-close" type="button" aria-label="Đóng mã QR" onClick={() => setShowQr(false)}>×</button>
            <p>Thanh toán đơn hàng</p>
            <h2 id="qr-title">Quét mã QR</h2>
            <span className="qr-helper">Mở ứng dụng ngân hàng và quét mã bên dưới</span>
            <div className="qr-image"><img src={qrUrl} alt={`Mã QR thanh toán ${vnd(selectedTotal)}`} /></div>
            <div className="qr-amount"><span>Số tiền</span><strong>{vnd(selectedTotal)}</strong></div>
            <div className="qr-notice">Đây là luồng thanh toán mô phỏng. Không chuyển tiền thật.</div>
            {err && <p className="error checkout-error" aria-live="polite">{err}</p>}
            <button className="btn qr-paid" type="button" disabled={submitting} onClick={() => void createOrder()}>
              {submitting ? 'Đang xác nhận...' : 'Tôi đã thanh toán'}
            </button>
            <button className="qr-back" type="button" disabled={submitting} onClick={() => setShowQr(false)}>Chọn phương thức khác</button>
          </section>
        </div>
      )}
    </div>
  )
}
