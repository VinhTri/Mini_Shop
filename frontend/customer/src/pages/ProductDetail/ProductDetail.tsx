import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CatIcon } from '../../components/CatIcon'
import { useCart } from '../../contexts/CartContext'
import { api } from '../../services/api'
import type { Product, ProductVariant } from '../../types'
import { vnd } from '../../utils/format'
import './ProductDetail.css'
import { ProductCommunity } from './ProductCommunity'

export function ProductDetail() {
  const { id } = useParams()
  const { addProduct } = useCart()
  const [p, setP] = useState<Product | null>(null)
  const [selectedSku, setSelectedSku] = useState('')
  const [qty, setQty] = useState(1)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [infoTab, setInfoTab] = useState<'description' | 'ingredients' | 'feeding'>('description')
  const [infoExpanded, setInfoExpanded] = useState(false)

  useEffect(() => {
    setP(null)
    setErr('')
    setInfoTab('description')
    setInfoExpanded(false)
    api<Product>(`/api/v1/products/${id}`)
      .then((product) => {
        setP(product)
        setSelectedSku(product.variants?.find((variant) => variant.stock > 0)?.sku ?? product.variants?.[0]?.sku ?? '')
      })
      .catch((e: Error) => setErr(e.message))
  }, [id])

  async function add() {
    if (!p || !selectedVariant) return
    setErr('')
    setMsg('')
    try {
      await addProduct(p, qty, selectedVariant)
      setMsg('Đã thêm vào giỏ')
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  if (err && !p) return <p className="error">{err}</p>
  if (!p) return <p className="muted">Đang tải...</p>

  const variants: ProductVariant[] = p.variants ?? []
  const selectedVariant = variants.find((variant) => variant.sku === selectedSku) ?? variants[0]
  const currentPrice = selectedVariant ? (selectedVariant.salePrice ?? selectedVariant.price) : p.price
  const currentStock = selectedVariant?.stock ?? 0
  const hasSale = Boolean(selectedVariant?.salePrice && selectedVariant.salePrice < selectedVariant.price)
  const infoContent = infoTab === 'description'
    ? (p.description || 'Sản phẩm chưa có mô tả.')
    : infoTab === 'ingredients'
      ? (p.ingredients || 'Sản phẩm chưa có thông tin thành phần.')
      : (p.feedingGuide || 'Sản phẩm chưa có hướng dẫn cho ăn.')

  function selectInfoTab(tab: 'description' | 'ingredients' | 'feeding') {
    setInfoTab(tab)
    setInfoExpanded(false)
  }

  return (
    <article className="product-detail">
      <nav className="detail-breadcrumb" aria-label="Đường dẫn">
        <Link to="/">Trang chủ</Link><span>›</span><span>{p.categoryName}</span><span>›</span><b>{p.name}</b>
      </nav>

      <section className="detail-purchase">
        <div className="detail-media">
          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : (
            <div className="detail-image-empty">
              <span className="detail-image-halo"><CatIcon name={p.categoryName} /></span>
              <strong>Ảnh sản phẩm đang được cập nhật</strong>
              <small>MeoShop sẽ bổ sung hình ảnh sớm</small>
            </div>
          )}
        </div>
        <div className="detail-body">
          <div className="detail-cat">
            <CatIcon name={p.categoryName} className="detail-cat-ico" />
            <span>{p.categoryName}</span>
          </div>
          <h1>{p.name}</h1>
          {p.brand && <p className="detail-brand">Thương hiệu <b>{p.brand}</b></p>}
          <div className="detail-price-wrap">
            <div className="price detail-price">{vnd(currentPrice)}</div>
            {hasSale && <><del>{vnd(selectedVariant.price)}</del><span className="detail-sale">Giá ưu đãi</span></>}
          </div>
          <div className="detail-variants">
            <b>Chọn kích cỡ</b>
            <div className="detail-variant-list">
              {variants.map((variant) => (
                <button
                  type="button"
                  key={variant.sku}
                  className={variant.sku === selectedVariant?.sku ? 'active' : ''}
                  disabled={variant.stock < 1}
                  onClick={() => { setSelectedSku(variant.sku); setQty(1); setMsg('') }}
                >
                  <span>{variant.weight}</span>
                  <small>{variant.stock > 0 ? vnd(variant.salePrice ?? variant.price) : 'Hết hàng'}</small>
                </button>
              ))}
            </div>
          </div>
          <p className={`detail-stock${currentStock < 10 ? ' low' : ''}`}>
            <span aria-hidden />{currentStock > 0 ? `Còn ${currentStock} sản phẩm cho kích cỡ này` : 'Kích cỡ này tạm hết hàng'}
          </p>
          <div className="detail-buy">
            <div className="qty">
              <button type="button" onClick={() => setQty((n) => Math.max(1, n - 1))}>−</button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((n) => Math.min(currentStock, n + 1))}>+</button>
            </div>
            <button className="btn" disabled={!selectedVariant || currentStock < 1} onClick={() => void add()}>
              Thêm vào giỏ hàng
            </button>
          </div>
          <div className="detail-assurance"><span>✓ Giao hàng tận nơi</span><span>✓ Đổi trả nếu sản phẩm lỗi</span></div>
          {msg && <p className="ok-msg">{msg}</p>}
          {err && <p className="error">{err}</p>}
          <Link to="/" className="detail-back">← Tiếp tục mua</Link>
        </div>
      </section>

      <section className="detail-description">
        <div className="detail-info-tabs" role="tablist" aria-label="Thông tin sản phẩm">
          <button type="button" role="tab" aria-selected={infoTab === 'description'} className={infoTab === 'description' ? 'active' : ''} onClick={() => selectInfoTab('description')}>Mô tả</button>
          <button type="button" role="tab" aria-selected={infoTab === 'ingredients'} className={infoTab === 'ingredients' ? 'active' : ''} onClick={() => selectInfoTab('ingredients')}>Thành phần</button>
          <button type="button" role="tab" aria-selected={infoTab === 'feeding'} className={infoTab === 'feeding' ? 'active' : ''} onClick={() => selectInfoTab('feeding')}>Hướng dẫn cho ăn</button>
        </div>
        <div className={`detail-info-panel${infoExpanded ? ' expanded' : ''}`} role="tabpanel">
          <div className="detail-description-content">{infoContent}</div>
          <button
            type="button"
            className="detail-expand"
            aria-expanded={infoExpanded}
            onClick={() => setInfoExpanded((current) => !current)}
          >
            {infoExpanded ? 'Thu gọn ↑' : 'Mở rộng ↓'}
          </button>
        </div>
      </section>
      <ProductCommunity product={p} />
    </article>
  )
}
