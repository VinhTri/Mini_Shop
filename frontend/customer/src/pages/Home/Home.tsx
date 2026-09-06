import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { CatIcon } from '../../components/CatIcon'
import { useCart } from '../../contexts/CartContext'
import { api } from '../../services/api'
import type { Category, PageResponse, Product } from '../../types'
import { vnd } from '../../utils/format'
import './Home.css'

type ShopCtx = { cats: Category[] }

export function Home() {
  const navigate = useNavigate()
  const { addProduct } = useCart()
  const ctx = useOutletContext<ShopCtx | null>()
  const cats = ctx?.cats ?? []
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const categoryId = params.get('categoryId') ?? ''
  const page = Number(params.get('page') ?? '0')
  const [data, setData] = useState<PageResponse<Product> | null>(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<number | null>(null)
  const [addedId, setAddedId] = useState<number | null>(null)
  const [cartError, setCartError] = useState('')

  const current = useMemo(
    () => (categoryId ? cats.find((c) => String(c.id) === categoryId) ?? null : null),
    [cats, categoryId],
  )
  const browsing = Boolean(categoryId || q)
  const productGroups = useMemo(() => {
    if (!data || browsing) return []
    const grouped = new Map<number, Product[]>()
    data.content.forEach((product) => {
      const products = grouped.get(product.categoryId) ?? []
      products.push(product)
      grouped.set(product.categoryId, products)
    })
    const ids = [...new Set([...cats.map((category) => category.id), ...grouped.keys()])]
    return ids.flatMap((id) => {
      const products = grouped.get(id) ?? []
      if (!products.length) return []
      const category = cats.find((item) => item.id === id)
      return [{ id, name: category?.name ?? products[0].categoryName, iconKey: category?.iconKey, products }]
    })
  }, [browsing, cats, data])

  useEffect(() => {
    setLoading(true)
    setErr('')
    const requestPage = browsing ? page : 0
    const requestSize = browsing ? 12 : 48
    const qs = new URLSearchParams()
    if (q) qs.set('q', q)
    if (categoryId) qs.set('categoryId', categoryId)
    qs.set('page', String(requestPage))
    qs.set('size', String(requestSize))
    api<PageResponse<Product>>(`/api/v1/products?${qs}`)
      .then(setData)
      .catch((e: Error) => {
        setData(null)
        setErr(e.message || 'Không thể tải sản phẩm từ máy chủ.')
      })
      .finally(() => setLoading(false))
  }, [q, categoryId, page, browsing])

  function goCategory(id?: number) {
    const next = new URLSearchParams(params)
    next.delete('page')
    if (id == null) next.delete('categoryId')
    else next.set('categoryId', String(id))
    setParams(next)
  }

  async function addToCart(product: Product, buyNow = false) {
    if (product.stock < 1 || addingId != null) return
    const variant = product.variants?.find((item) => item.stock > 0)
    if (!variant) {
      setCartError('Sản phẩm chưa có kích cỡ khả dụng.')
      return
    }
    setAddingId(product.id)
    setAddedId(null)
    setCartError('')
    try {
      await addProduct(product, 1, variant)
      if (buyNow) {
        navigate('/cart')
        return
      }
      setAddedId(product.id)
      window.setTimeout(() => setAddedId((id) => (id === product.id ? null : id)), 1800)
    } catch (e) {
      setCartError((e as Error).message || 'Chưa thể thêm sản phẩm vào giỏ.')
    } finally {
      setAddingId(null)
    }
  }

  function productCard(product: Product) {
    const onSale = Boolean(product.originalPrice && product.originalPrice > product.price)
    const discount = onSale
      ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
      : 0

    return (
      <article key={product.id} className={`card product-card${onSale ? ' on-sale' : ''}`}>
        <Link to={`/products/${product.id}`} className="thumb product-card-media">
          <img src={product.imageUrl} alt={product.name} />
          <span className="card-tag">{product.categoryName}</span>
          {onSale && <span className="sale-badge">Giảm {discount}%</span>}
        </Link>
        <div className="body">
          <Link to={`/products/${product.id}`} className="product-card-title">
            <h3>{product.name}</h3>
          </Link>
          <div className="card-foot">
            <div className="product-price-wrap">
              <div className="price">{vnd(product.price)}</div>
              {onSale && <del>{vnd(product.originalPrice!)}</del>}
            </div>
            <span className={`stock${product.stock < 10 ? ' low' : ''}`}>
              {product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}
            </span>
          </div>
          <div className="product-card-actions">
            <button type="button" className="product-add" disabled={product.stock < 1 || addingId != null} onClick={() => void addToCart(product)}>
              {addingId === product.id ? 'Đang thêm...' : addedId === product.id ? 'Đã thêm' : 'Thêm vào giỏ'}
            </button>
            <button type="button" className="product-buy" disabled={product.stock < 1 || addingId != null} onClick={() => void addToCart(product, true)}>
              Mua ngay
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className="catalog">
      {!browsing && (
        <section className="hero">
          <img
            src="/hero-backgrounds/hero-bg-editorial-purple.png"
            alt=""
            className="hero-backdrop"
            aria-hidden="true"
          />
          <div className="hero-copy">
            <p className="hero-kicker"><span /> TVT Meow · chọn kỹ cho boss</p>
            <h1>Đồ ngon đúng gu,<br /><em>boss vui mỗi ngày.</em></h1>
            <p className="hero-lead">
              Hạt, pate và phụ kiện được chọn theo nhu cầu thật của mèo. Dễ tìm, giá rõ ràng và giao tận cửa.
            </p>
            <p className="hero-note"><span aria-hidden>✓</span> COD toàn quốc · Theo dõi đơn trong tài khoản</p>
          </div>
          <figure className="hero-lifestyle" aria-label="TVT Meow — đồ ăn và phụ kiện cho mèo">
            <span className="hero-shape hero-shape-one" />
            <span className="hero-shape hero-shape-two" />
            <div className="hero-mascot-wrap">
              <img src="/logo.png" alt="Mascot mèo của TVT Meow" className="hero-mascot" />
            </div>
          </figure>
          <div className="hero-marquee" aria-hidden="true">
            <div className="hero-marquee-track">
              {[...cats, ...cats].map((category, index) => (
                <span className="hero-marquee-item" key={`${category.id}-${index}`}>
                  <CatIcon name={category.name} iconKey={category.iconKey} className="hero-marquee-icon" />
                  {category.name}
                  <i>✦</i>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {browsing && (
        <section className="catalog-head">
          <div className="catalog-head-main">
            {current ? (
              <div className="catalog-brand">
                <CatIcon name={current.name} iconKey={current.iconKey} className="catalog-brand-ico" />
                <div>
                  <nav className="catalog-crumb">
                    <button type="button" onClick={() => goCategory()}>
                      Trang chủ
                    </button>
                    <span>/</span>
                    <b>{current.name}</b>
                  </nav>
                  <h1>{current.name}</h1>
                  <p className="muted">Danh mục sản phẩm TVT Meow</p>
                </div>
              </div>
            ) : (
              <div>
                <nav className="catalog-crumb">
                  <button type="button" onClick={() => goCategory()}>
                    Trang chủ
                  </button>
                  <span>/</span>
                  <b>Tìm kiếm</b>
                </nav>
                <h1>Kết quả cho “{q}”</h1>
              </div>
            )}
            <div className="catalog-meta">
              {loading ? 'Đang tải...' : `${data?.totalElements ?? 0} sản phẩm`}
            </div>
          </div>
        </section>
      )}

      {!browsing && (
        <div className="catalog-toolbar">
          <div>
            <span className="catalog-toolbar-kicker">Chọn theo nhu cầu</span>
            <h2>Gian hàng cho boss</h2>
          </div>
          <span className="muted">{data?.totalElements ?? 0} sản phẩm</span>
        </div>
      )}

      {err && <p className="error">{err}</p>}
      {cartError && <p className="error product-action-error">{cartError}</p>}

      {loading && !data ? (
        <div className="empty">Đang tải sản phẩm...</div>
      ) : !data || data.content.length === 0 ? (
        <div className="empty">Chưa có sản phẩm phù hợp trong danh mục này.</div>
      ) : browsing ? (
        <div className="grid">{data.content.map(productCard)}</div>
      ) : (
        <div className="category-sections">
          {productGroups.map((group) => (
            <section className="category-product-section" key={group.id}>
              <header className="category-section-head">
                <div className="category-section-title">
                  <CatIcon name={group.name} iconKey={group.iconKey} className="category-section-icon" />
                  <div>
                    <h2>{group.name}</h2>
                    <p>{group.products.length} lựa chọn dành cho boss</p>
                  </div>
                </div>
                <button type="button" onClick={() => goCategory(group.id)}>
                  Xem tất cả <span aria-hidden>→</span>
                </button>
              </header>
              <div className="grid category-product-grid">{group.products.map(productCard)}</div>
            </section>
          ))}
        </div>
      )}

      {browsing && data && data.totalPages > 1 && (
        <div className="pager">
          {Array.from({ length: data.totalPages }, (_, i) => (
            <button
              key={i}
              className={`btn ${i === page ? '' : 'ghost'}`}
              onClick={() => {
                const next = new URLSearchParams(params)
                next.set('page', String(i))
                setParams(next)
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
