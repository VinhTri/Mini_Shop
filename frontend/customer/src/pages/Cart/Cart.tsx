import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { NavIcon } from '../../components/NavIcon'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { vnd } from '../../utils/format'
import { readCartSelection, writeCartSelection } from '../../utils/cartSelection'
import './Cart.css'

export function Cart() {
  const { cart, setQty, remove } = useCart()
  const { user } = useAuth()
  const [err, setErr] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [selectionReady, setSelectionReady] = useState(false)
  const nav = useNavigate()
  const cartItemIds = useMemo(() => cart.items.map((item) => item.id), [cart.items])
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const selectedItems = cart.items.filter((item) => selectedSet.has(item.id))
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0)
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0)
  const allSelected = cart.items.length > 0 && selectedItems.length === cart.items.length

  useEffect(() => {
    if (!cartItemIds.length) return
    const validIds = new Set(cartItemIds)
    if (!selectionReady) {
      const saved = readCartSelection().filter((id) => validIds.has(id))
      const initial = saved.length ? saved : cartItemIds
      setSelectedIds(initial)
      writeCartSelection(initial)
      setSelectionReady(true)
      return
    }
    setSelectedIds((current) => {
      const next = current.filter((id) => validIds.has(id))
      if (next.length !== current.length) writeCartSelection(next)
      return next
    })
  }, [cartItemIds, selectionReady])

  function toggleProduct(itemId: number) {
    setSelectedIds((current) => {
      const next = current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId]
      writeCartSelection(next)
      return next
    })
  }

  function toggleAll() {
    const next = allSelected ? [] : cartItemIds
    setSelectedIds(next)
    writeCartSelection(next)
  }

  async function changeQty(itemId: number, quantity: number) {
    setErr('')
    setUpdatingId(itemId)
    try {
      await setQty(itemId, quantity)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setUpdatingId(null)
    }
  }

  async function removeItem(itemId: number) {
    setErr('')
    setUpdatingId(itemId)
    try {
      await remove(itemId)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setUpdatingId(null)
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">
          <NavIcon name="cart" />
        </div>
        <p className="cart-empty-kicker">TVT Meow</p>
        <h1>Giỏ của boss đang trống</h1>
        <p>Chọn thêm món ngon hoặc đồ chơi. Đơn hàng được giữ lại để bạn thanh toán COD khi sẵn sàng.</p>
        <Link to="/" className="btn">
          Tiếp tục mua sắm
        </Link>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-head">
        <div>
          <p className="cart-kicker">Đơn hàng của bạn</p>
          <h1>Giỏ hàng</h1>
          <p>{cart.itemCount} sản phẩm đã sẵn sàng để giao</p>
        </div>
        <Link to="/" className="cart-keep">
          ← Tiếp tục mua
        </Link>
      </div>

      {err && <p className="error cart-error" aria-live="polite">{err}</p>}

      <div className="cart-layout">
        <section className="cart-panel">
          <div className="cart-panel-head">
            <div>
              <h2>Sản phẩm đã chọn</h2>
              <p>Kiểm tra số lượng trước khi thanh toán</p>
            </div>
            <label className="cart-select-all">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              <span>Chọn tất cả</span>
            </label>
          </div>
          <ul className="cart-list">
            {cart.items.map((i) => (
              <li key={i.id} className={`cart-item${selectedSet.has(i.id) ? ' selected' : ''}`}>
                <label className="cart-check" aria-label={`Chọn ${i.name}`}>
                  <input type="checkbox" checked={selectedSet.has(i.id)} onChange={() => toggleProduct(i.id)} />
                  <span aria-hidden />
                </label>
                <Link to={`/products/${i.productId}`} className="cart-thumb">
                  <img src={i.imageUrl} alt={i.name} />
                </Link>
                <div className="cart-info">
                  <span className="cart-line-label">TVT Meow chọn lọc</span>
                  <Link to={`/products/${i.productId}`} className="cart-name">
                    {i.name}
                  </Link>
                  <div className="cart-meta">
                    <span>Kích cỡ: <b>{i.variantName}</b></span>
                    <span className="cart-stock">Còn {i.stock}</span>
                    <span className="cart-unit">{vnd(i.price)} / sp</span>
                  </div>
                  <button className="cart-remove" disabled={updatingId === i.id} onClick={() => void removeItem(i.id)}>
                    {updatingId === i.id ? 'Đang cập nhật' : 'Xóa'}
                  </button>
                </div>
                <div className="qty cart-qty">
                  <button disabled={updatingId === i.id} onClick={() => void changeQty(i.id, i.quantity - 1)} aria-label="Giảm số lượng">
                    −
                  </button>
                  <span aria-live="polite">{i.quantity}</span>
                  <button disabled={updatingId === i.id || i.quantity >= i.stock} onClick={() => void changeQty(i.id, i.quantity + 1)} aria-label="Tăng số lượng">
                    +
                  </button>
                </div>
                <div className="cart-sub"><small>Thành tiền</small>{vnd(i.subtotal)}</div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="cart-summary">
          <ol className="cart-steps cart-summary-steps" aria-label="Tiến trình đặt hàng">
            <li className="active" aria-current="step"><span><img src="/checkout-steps/cart.png" alt="" aria-hidden="true" /></span><b>Giỏ hàng</b></li>
            <li><span><img src="/checkout-steps/delivery.png" alt="" aria-hidden="true" /></span><b>Thông tin giao</b></li>
            <li><span><img src="/checkout-steps/confirm.png" alt="" aria-hidden="true" /></span><b>Xác nhận</b></li>
          </ol>
          <div className="cart-summary-top">
            <div>
              <span>Hóa đơn</span>
              <h2>Tóm tắt đơn hàng</h2>
            </div>
            <span className="cart-cod">COD</span>
          </div>
          <div className="cart-row">
            <span>Tạm tính ({selectedCount} SP)</span>
            <b>{vnd(selectedTotal)}</b>
          </div>
          <div className="cart-row">
            <span>Phí vận chuyển</span>
            <b className="cart-free">Miễn phí</b>
          </div>
          <div className="cart-row">
            <span>Thanh toán</span>
            <b>Khi nhận hàng</b>
          </div>
          <div className="cart-total">
            <span>Tổng thanh toán</span>
            <strong>{vnd(selectedTotal)}</strong>
          </div>
          <button
            className="btn cart-checkout"
            disabled={selectedItems.length === 0}
            onClick={() =>
              nav(user ? '/checkout' : '/login', { state: user ? undefined : { from: '/checkout' } })
            }
          >
            {!user
              ? 'Đăng nhập để đặt hàng'
              : selectedItems.length
                ? `Đặt ${selectedCount} sản phẩm`
                : 'Chọn sản phẩm để đặt'}
          </button>
          {!user && <p className="cart-hint">Bạn cần đăng nhập trước khi nhập thông tin giao hàng. Giỏ hàng vẫn được giữ nguyên.</p>}
          <div className="cart-assurance">
            <div><b>Giao tận cửa</b><span>Miễn phí vận chuyển</span></div>
            <div><b>Thanh toán COD</b><span>Nhận hàng rồi thanh toán</span></div>
          </div>
        </aside>
      </div>
    </div>
  )
}
