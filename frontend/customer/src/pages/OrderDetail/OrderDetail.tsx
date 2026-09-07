import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/api'
import type { Order, OrderStatus } from '../../types'
import { paymentStatusLabel, returnStatusLabel, statusLabel, vnd } from '../../utils/format'
import { OrderAccountSidebar } from '../../components/OrderAccountSidebar'
import './OrderDetail.css'

const stages: Array<{ status: OrderStatus; label: string; short: string }> = [
  { status: 'PENDING', label: 'Đã đặt hàng', short: '01' },
  { status: 'CONFIRMED', label: 'Đã xác nhận', short: '02' },
  { status: 'SHIPPING', label: 'Đang giao hàng', short: '03' },
  { status: 'COMPLETED', label: 'Hoàn thành', short: '04' },
]

const returnStages = [
  { status: 'REQUESTED', label: 'Đã gửi yêu cầu', note: 'Cửa hàng đang kiểm tra' },
  { status: 'APPROVED', label: 'Đã chấp nhận', note: 'Gửi hàng về cửa hàng' },
  { status: 'ITEM_RECEIVED', label: 'Đã nhận hàng', note: 'Đang xử lý hoàn tiền' },
  { status: 'REFUNDED', label: 'Đã hoàn tiền', note: 'Hoàn tất hoàn tiền' },
] as const

const exchangeStages = [
  { status: 'REQUESTED', label: 'Đã gửi yêu cầu', note: 'Cửa hàng đang kiểm tra' },
  { status: 'APPROVED', label: 'Đã chấp nhận', note: 'Gửi hàng cũ về cửa hàng' },
  { status: 'ITEM_RECEIVED', label: 'Đã nhận hàng cũ', note: 'Cửa hàng đang chuẩn bị hàng mới' },
  { status: 'SHIPPING', label: 'Đang giao hàng mới', note: 'Sản phẩm thay thế đang được giao' },
  { status: 'COMPLETED', label: 'Đổi hàng thành công', note: 'Bạn đã nhận sản phẩm thay thế' },
] as const

function orderTime(value?: string | null) {
  return value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có dữ liệu thời gian'
}

export function OrderDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [err, setErr] = useState('')
  const [returnReason, setReturnReason] = useState('Sản phẩm bị lỗi hoặc hư hỏng')
  const [returnDescription, setReturnDescription] = useState('')
  const [showReturn, setShowReturn] = useState(false)
  const [showExchange, setShowExchange] = useState(false)
  const [exchangeProductId, setExchangeProductId] = useState<number | null>(null)
  const [exchangeVariant, setExchangeVariant] = useState('')
  const [exchangeDescription, setExchangeDescription] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')

  function load() { api<Order>(`/api/v1/orders/${id}`).then(setOrder).catch((e: Error) => setErr(e.message)) }
  useEffect(load, [id])

  async function cancel() {
    try { setOrder(await api<Order>(`/api/v1/orders/${id}/cancel`, { method: 'POST' })); setErr('') }
    catch (e) { setErr((e as Error).message) }
  }

  async function requestReturn() {
    if (!returnReason.trim() || !returnDescription.trim()) { setErr('Vui lòng chọn lý do và mô tả tình trạng sản phẩm'); return }
    try {
      setOrder(await api<Order>(`/api/v1/orders/${id}/return-request`, { method: 'POST', body: JSON.stringify({ reason: returnReason, description: returnDescription }) }))
      setShowReturn(false); setErr('')
    } catch (e) { setErr((e as Error).message) }
  }

  async function submitBank() {
    if (!bankName.trim() || !accountName.trim() || !/^\d{6,20}$/.test(accountNumber.trim())) { setErr('Vui lòng nhập đầy đủ ngân hàng, chủ tài khoản và số tài khoản hợp lệ'); return }
    try {
      setOrder(await api<Order>(`/api/v1/orders/${id}/refund-bank`, { method: 'POST', body: JSON.stringify({ bankName, accountName, accountNumber }) }))
      setErr('')
    } catch (e) { setErr((e as Error).message) }
  }

  async function requestExchange() {
    const productId = exchangeProductId ?? order?.items[0]?.productId
    if (!productId || !exchangeVariant.trim()) { setErr('Vui lòng chọn sản phẩm và nhập mẫu hoặc kích cỡ muốn nhận'); return }
    if (exchangeDescription.trim().length < 10) { setErr('Mô tả cần ít nhất 10 ký tự để cửa hàng hiểu rõ sản phẩm đã giao sai'); return }
    try { setOrder(await api<Order>(`/api/v1/orders/${id}/exchange-request`, { method:'POST', body:JSON.stringify({ productId, requestedVariant:exchangeVariant, reason:'Giao sai sản phẩm hoặc kích cỡ', description:exchangeDescription }) })); setShowExchange(false); setErr('') }
    catch(e){ setErr((e as Error).message) }
  }

  if (err && !order) return <p className="error order-detail-state">{err}</p>
  if (!order) return <div className="order-detail-loading"><span /><span /></div>

  const currentStage = order.status === 'CANCELLED' ? -1 : stages.findIndex((stage) => stage.status === order.status)
  const returnDeadline = order.completedAt ? new Date(new Date(order.completedAt).getTime() + 7 * 86400000) : null
  const returnDaysLeft = returnDeadline ? Math.max(0, Math.ceil((returnDeadline.getTime() - Date.now()) / 86400000)) : 0
  const canRequestReturn = order.status === 'COMPLETED' && order.returnStatus === 'NONE' && (order.exchangeStatus ?? 'NONE') === 'NONE' && returnDaysLeft > 0
  const returnStageIndex = order.returnStatus === 'REFUNDING' ? 2 : returnStages.findIndex((stage) => stage.status === order.returnStatus)
  const exchangeStageIndex = exchangeStages.findIndex((stage) => stage.status === order.exchangeStatus)

  return <div className="order-account-layout"><OrderAccountSidebar active="orders" /><main className="order-detail-page">
    <header className="order-detail-head">
      <button onClick={() => nav('/orders')}>← Trở lại</button>
      <div><span>Mã đơn hàng {order.orderCode ?? `#${String(order.id).padStart(4, '0')}`}</span><b className={order.status}>{statusLabel(order.status)}</b></div>
    </header>

    {order.status === 'CANCELLED' ? <section className="order-cancelled"><span>Đơn hàng đã hủy</span><p>{orderTime(order.cancelledAt)} · Đơn này không còn được xử lý. Sản phẩm đã được hoàn lại kho.</p></section> : <section className="order-progress">
      {stages.map((stage, index) => <div key={stage.status} className={index <= currentStage ? 'reached' : ''}>
        <span>{index < currentStage ? '✓' : stage.short}</span><b>{stage.label}</b>{index === 0 && <small>{new Date(order.createdAt).toLocaleString('vi-VN')}</small>}
      </div>)}
    </section>}

    <section className="order-delivery-panel">
      <div className="order-address">
        <header><span>Thông tin giao hàng</span><b>Địa chỉ nhận hàng</b></header>
        <dl className="order-shipping-details">
          <div><dt>Người nhận</dt><dd>{order.fullName}</dd></div>
          <div><dt>Số điện thoại</dt><dd className="shipping-phone">{order.phone}</dd></div>
          <div><dt>Địa chỉ giao hàng</dt><dd>{order.address}</dd></div>
          <div className="shipping-note"><dt>Ghi chú giao hàng</dt><dd>{order.note?.trim() || 'Không có ghi chú'}</dd></div>
        </dl>
        <small className="order-address-hint">Cửa hàng sẽ giao theo đúng thông tin này.</small>
      </div>
      <div className="order-tracking">
        <header><div><span>Theo dõi đơn</span><b>Cập nhật đơn hàng</b></div><small>{statusLabel(order.status)}</small></header>
        <div className={currentStage === 0 ? 'current' : 'completed'}><i>{currentStage > 0 ? '✓' : ''}</i><time>{orderTime(order.createdAt)}</time><p><b>Đặt hàng thành công</b><small>Đơn hàng đã được ghi nhận trên hệ thống.</small></p></div>
        {currentStage >= 1 && <div className={currentStage === 1 ? 'current' : 'completed'}><i>{currentStage > 1 ? '✓' : ''}</i><time>{orderTime(order.confirmedAt)}</time><p><b>Cửa hàng đã xác nhận</b><small>Đơn đang được chuẩn bị để chuyển sang giao hàng.</small></p></div>}
        {currentStage >= 2 && <div className={currentStage === 2 ? 'current' : 'completed'}><i>{currentStage > 2 ? '✓' : ''}</i><time>{orderTime(order.shippingAt)}</time><p><b>Đang giao hàng</b><small>Trạng thái vận chuyển đang được mô phỏng bởi cửa hàng.</small></p></div>}
        {currentStage >= 3 && <div className="current"><i>✓</i><time>{orderTime(order.completedAt)}</time><p><b>Giao hàng thành công</b><small>Đơn hàng đã hoàn thành.</small></p></div>}
      </div>
    </section>

    <section className="order-detail-products">
      <header className="order-info-bar"><div><span>Thông tin đơn hàng</span><b>{order.orderCode ?? `#${String(order.id).padStart(4, '0')}`}</b></div><div><span className={`pill ${order.status}`}>{statusLabel(order.status)}</span><span className={`pill payment-${order.paymentStatus}`}>{paymentStatusLabel(order.paymentStatus)}</span></div></header>
      <div className="order-detail-product-list">{order.items.map((item) => <Link to={`/products/${item.productId}`} className="order-detail-product" key={`${item.productId}-${item.variantSku ?? ''}`}>
        <div className="order-detail-product-image">{item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : <span>{item.productName.charAt(0)}</span>}</div>
        <div><strong>{item.productName}</strong>{item.variantName && <small>Phân loại: {item.variantName}</small>}<span>Số lượng: {item.quantity}</span></div>
        <div><small>{vnd(item.price)} / sản phẩm</small><b>{vnd(item.subtotal)}</b></div>
      </Link>)}</div>
      <footer className="order-payment-summary">
        <dl>
          <div><dt>Tổng tiền hàng</dt><dd>{vnd(order.total)}</dd></div>
          <div><dt>Phí vận chuyển</dt><dd className="free">Miễn phí <small>(demo)</small></dd></div>
          <div className="order-payment-total"><dt>Thành tiền</dt><dd>{vnd(order.total)}</dd></div>
          <div><dt>Phương thức thanh toán</dt><dd>{order.paymentMethod === 'QR' ? 'Quét mã QR' : 'Thanh toán khi nhận hàng'}</dd></div>
        </dl>
      </footer>
      {order.status === 'COMPLETED' && order.returnStatus === 'NONE' && (order.exchangeStatus ?? 'NONE') === 'NONE' && <div className={`return-deadline ${returnDaysLeft === 0 ? 'expired' : ''}`}><b>{returnDaysLeft > 0 ? `Còn ${returnDaysLeft} ngày để yêu cầu hậu mãi` : 'Đã hết thời hạn hậu mãi'}</b><span>Trong 7 ngày sau khi nhận hàng, bạn có thể chọn hoàn tiền hoặc đổi sang đúng sản phẩm.</span></div>}
      {order.returnStatus !== 'NONE' && <section id="return-status" className={`return-case ${order.returnStatus === 'REJECTED' ? 'rejected' : ''}`}>
        <header className="return-case-head"><div><span>Tiến trình hoàn tiền</span><h2>{returnStatusLabel(order.returnStatus)}</h2><p>{order.returnStatus === 'REJECTED' ? 'Cửa hàng đã từ chối yêu cầu này. Bạn có thể liên hệ để được giải thích thêm.' : order.returnStatus === 'REFUNDED' ? 'Cửa hàng đã hoàn tất thanh toán tiền hoàn.' : 'Yêu cầu hoàn tiền đang được xử lý theo từng bước bên dưới.'}</p></div><time>Gửi lúc {orderTime(order.returnRequestedAt)}</time></header>
        {order.returnStatus !== 'REJECTED' && <ol className="return-progress">{returnStages.map((stage,index) => <li className={index < returnStageIndex ? 'done' : index === returnStageIndex ? 'active' : ''} key={stage.status}><i>{index < returnStageIndex ? '✓' : index + 1}</i><div><b>{stage.label}</b><small>{stage.note}</small></div></li>)}</ol>}
        <div className="return-case-body refund-case-body"><article className="refund-request-card"><header><i aria-hidden>↩</i><div><span>Nội dung yêu cầu</span><small>Thông tin khách hàng cung cấp</small></div></header><h3>{order.returnReason}</h3><div className="refund-description"><b>Mô tả</b><p>{order.returnDescription}</p></div></article><aside className="refund-account-card"><header><div><span>Thông tin nhận tiền hoàn</span><h3>Tài khoản hoàn tiền</h3></div>{order.refundBankSubmittedAt && <i aria-label="Đã xác nhận">✓</i>}</header>{order.refundBankSubmittedAt ? <><dl><div><dt>Ngân hàng</dt><dd>{order.refundBankName}</dd></div><div><dt>Chủ tài khoản</dt><dd>{order.refundAccountName}</dd></div><div className="account-number"><dt>Số tài khoản</dt><dd>{order.refundAccountNumber}</dd></div></dl><footer><span>Khách gửi thông tin</span><time>{orderTime(order.refundBankSubmittedAt)}</time></footer></> : <div className="refund-account-empty"><b>Chưa có thông tin tài khoản</b><p>Biểu mẫu sẽ mở sau khi cửa hàng chấp nhận yêu cầu hoàn tiền.</p></div>}{order.refundedAt && <div className="refund-completed-note"><i>✓</i><div><b>Đã thanh toán tiền hoàn</b><time>{orderTime(order.refundedAt)}</time></div></div>}</aside></div>
      </section>}
      {order.exchangeStatus !== 'NONE' && <section id="exchange-status" className={`return-case exchange-progress-case ${order.exchangeStatus === 'REJECTED' ? 'rejected' : ''}`}>
        <header className="return-case-head"><div><span>Tiến trình đổi hàng</span><h2>{({REQUESTED:'Chờ cửa hàng duyệt',APPROVED:'Đã chấp nhận đổi hàng',REJECTED:'Đã từ chối đổi hàng',ITEM_RECEIVED:'Đã nhận hàng cũ',SHIPPING:'Đang giao hàng thay thế',COMPLETED:'Đổi hàng thành công'} as Record<string,string>)[order.exchangeStatus]}</h2><p>{order.exchangeStatus === 'REJECTED' ? 'Cửa hàng đã từ chối yêu cầu đổi hàng. Bạn có thể liên hệ để biết thêm chi tiết.' : order.exchangeStatus === 'COMPLETED' ? 'Bạn đã nhận sản phẩm thay thế và quy trình đổi hàng đã hoàn tất.' : 'Yêu cầu đổi hàng đang được xử lý theo từng bước bên dưới.'}</p></div><time>Gửi lúc {orderTime(order.exchangeRequestedAt)}</time></header>
        {order.exchangeStatus !== 'REJECTED' && <ol className="return-progress exchange-progress">{exchangeStages.map((stage,index) => <li className={index < exchangeStageIndex ? 'done' : index === exchangeStageIndex ? 'active' : ''} key={stage.status}><i>{index < exchangeStageIndex ? '✓' : index + 1}</i><div><b>{stage.label}</b><small>{stage.note}</small></div></li>)}</ol>}
        <div className="return-case-body exchange-case-body"><article className="exchange-request-card"><header><i aria-hidden>↩</i><div><span>Nội dung yêu cầu</span><small>Thông tin khách hàng cung cấp</small></div></header><h3>{order.exchangeReason}</h3><div className="exchange-description"><b>Mô tả</b><p>{order.exchangeDescription}</p></div></article><aside className="exchange-replacement-card"><header><i aria-hidden>⇄</i><div><span>Sản phẩm thay thế</span><small>Mẫu khách hàng muốn nhận</small></div></header><h3>{order.exchangeRequestedVariant}</h3><div className="exchange-replacement-note"><i aria-hidden>✓</i><p>Cửa hàng sẽ gửi đúng mẫu hoặc kích cỡ này sau khi nhận lại hàng cũ.</p></div></aside></div>
      </section>}
      {order.returnStatus === 'APPROVED' && !order.refundBankSubmittedAt && <section className="refund-bank-form"><div><span>Yêu cầu đã được chấp nhận</span><h2>Thông tin nhận tiền hoàn</h2><p>Nhập tài khoản chính chủ để cửa hàng hoàn tiền sau khi nhận lại sản phẩm.</p></div><div className="refund-bank-fields"><label>Ngân hàng<input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Ví dụ: Vietcombank" /></label><label>Chủ tài khoản<input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="NGUYEN VAN A" /></label><label>Số tài khoản<input inputMode="numeric" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} placeholder="Nhập 6-20 chữ số" /></label><button className="btn" onClick={() => void submitBank()}>Lưu thông tin hoàn tiền</button></div></section>}
      {(order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'COMPLETED') && <div className="order-info-actions">
        {(order.status === 'PENDING' || order.status === 'CONFIRMED') && <button className="btn danger ghost" onClick={() => void cancel()}>Hủy đơn hàng</button>}
        {order.status === 'COMPLETED' && order.items[0] && <Link className="btn" to={`/products/${order.items[0].productId}`}>Đánh giá / Bình luận</Link>}
        {canRequestReturn && <button className="btn ghost" onClick={() => setShowReturn(true)}>Yêu cầu hoàn tiền</button>}
        {canRequestReturn && <button className="btn ghost" onClick={() => { setExchangeProductId(order.items[0]?.productId ?? null); setShowExchange(true) }}>Yêu cầu đổi hàng</button>}
      </div>}
    </section>

    {err && <p className="error order-detail-error">{err}</p>}
    {showReturn && canRequestReturn && <div className="order-return-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowReturn(false) }}><section className="order-return-dialog" role="dialog" aria-modal="true" aria-labelledby="return-dialog-title">
      <header><div><span>Trả hàng / Hoàn tiền</span><h2 id="return-dialog-title">Gửi yêu cầu hoàn tiền</h2></div><button onClick={() => setShowReturn(false)} aria-label="Đóng">×</button></header>
      <p>Hoàn tiền chỉ được xử lý sau khi cửa hàng duyệt yêu cầu và nhận lại sản phẩm.</p>
      <label className="return-dialog-field">Lý do<select value={returnReason} onChange={(event) => setReturnReason(event.target.value)}><option>Sản phẩm bị lỗi hoặc hư hỏng</option><option>Sản phẩm không đúng mô tả</option><option>Giao sai sản phẩm hoặc kích cỡ</option><option>Sản phẩm hết hạn sử dụng</option><option>Lý do khác</option></select></label>
      <label className="return-dialog-field">Mô tả chi tiết<textarea autoFocus value={returnDescription} maxLength={1500} onChange={(event) => setReturnDescription(event.target.value)} placeholder="Mô tả tình trạng sản phẩm, thời điểm phát hiện và mong muốn xử lý..." /></label>
      <footer><small>{returnDescription.length}/1500</small><button className="btn ghost" onClick={() => setShowReturn(false)}>Hủy</button><button className="btn" onClick={() => void requestReturn()}>Gửi yêu cầu</button></footer>
    </section></div>}
    {showExchange && canRequestReturn && <div className="order-return-layer" onMouseDown={(event)=>{if(event.target===event.currentTarget)setShowExchange(false)}}><section className="order-return-dialog"><header><div><span>Đổi hàng</span><h2>Yêu cầu sản phẩm thay thế</h2></div><button onClick={()=>setShowExchange(false)}>×</button></header><p>Chọn hàng đã nhận và nhập mẫu hoặc kích cỡ đúng bạn muốn nhận.</p><label className="return-dialog-field">Sản phẩm<select value={exchangeProductId??''} onChange={(e)=>setExchangeProductId(Number(e.target.value))}>{order.items.map((item)=><option value={item.productId} key={item.productId}>{item.productName} — {item.variantName}</option>)}</select></label><label className="return-dialog-field">Mẫu hoặc kích cỡ muốn nhận<input value={exchangeVariant} onChange={(e)=>setExchangeVariant(e.target.value)} placeholder="Ví dụ: 2kg, vị cá hồi"/></label><label className="return-dialog-field">Mô tả hàng nhận sai<textarea value={exchangeDescription} minLength={10} maxLength={1500} onChange={(e)=>setExchangeDescription(e.target.value)} placeholder="Ví dụ: Tôi đặt túi 2kg nhưng nhận được túi 1kg..."/></label><footer><small>Tối thiểu 10 ký tự · {exchangeDescription.length}/1500</small><button className="btn ghost" onClick={()=>setShowExchange(false)}>Hủy</button><button className="btn" onClick={()=>void requestExchange()}>Gửi yêu cầu đổi hàng</button></footer></section></div>}
  </main></div>
}
