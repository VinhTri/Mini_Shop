import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import type { PageResponse, Product } from '../../types'
import { vnd } from '../../utils/format'

type StatusFilter = 'all' | 'active' | 'hidden'

export function Products() {
  const [data, setData] = useState<PageResponse<Product> | null>(null)
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    api<PageResponse<Product>>('/api/v1/admin/products?size=50')
      .then(setData)
      .catch((error: Error) => setErr(error.message))
      .finally(() => setLoading(false))
  }, [])

  const products = data?.content ?? []
  const categories = useMemo(() => [...new Map(products.map((product) => [product.categoryId, product.categoryName])).entries()], [products])
  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('vi')
    return products.filter((product) => {
      const matchesText = !keyword || `${product.name} ${product.brand ?? ''}`.toLocaleLowerCase('vi').includes(keyword)
      const matchesCategory = !categoryId || String(product.categoryId) === categoryId
      const matchesStatus = status === 'all' || (status === 'active' ? product.active : !product.active)
      return matchesText && matchesCategory && matchesStatus
    })
  }, [categoryId, products, query, status])

  const activeCount = products.filter((product) => product.active).length
  const lowStockCount = products.filter((product) => product.stock <= 5).length
  const hasFilters = Boolean(query || categoryId || status !== 'all')

  function clearFilters() {
    setQuery('')
    setCategoryId('')
    setStatus('all')
  }

  return (
    <main className="product-list-page">


      <section className="product-list-summary" aria-label="Tổng quan sản phẩm">
        <div><span>Tổng sản phẩm</span><strong>{products.length}</strong></div>
        <div><span>Đang bán</span><strong>{activeCount}</strong></div>
        <div className={lowStockCount > 0 ? 'warning' : ''}><span>Sắp hết hàng</span><strong>{lowStockCount}</strong></div>
      </section>

      <section className="product-list-panel">
        <div className="product-list-filters">
          <label className="product-list-search">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên hoặc thương hiệu..." />
          </label>
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} aria-label="Lọc theo danh mục">
            <option value="">Tất cả danh mục</option>
            {categories.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} aria-label="Lọc theo trạng thái">
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="hidden">Tạm ẩn</option>
          </select>
          <Link className="btn product-add-btn" to="/products/new" style={{marginLeft: 'auto'}}><span aria-hidden>＋</span> Thêm sản phẩm</Link>
        </div>

        {err ? (
          <div className="product-list-state error-state"><strong>Không thể tải sản phẩm</strong><span>{err}</span></div>
        ) : loading ? (
          <div className="product-list-state"><strong>Đang tải sản phẩm...</strong></div>
        ) : filtered.length === 0 ? (
          <div className="product-list-state">
            <span className="product-empty-icon" aria-hidden>＋</span>
            <strong>{hasFilters ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}</strong>
            <span>{hasFilters ? 'Thử thay đổi từ khóa hoặc bộ lọc.' : 'Thêm sản phẩm đầu tiên để bắt đầu bán hàng.'}</span>
            {hasFilters ? <button type="button" className="btn ghost" onClick={clearFilters}>Xóa bộ lọc</button> : <Link className="btn" to="/products/new">Thêm sản phẩm đầu tiên</Link>}
          </div>
        ) : (
          <div className="product-list-table-wrap">
            <table className="product-list-table">
              <thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Giá bán</th><th>Tồn kho</th><th>Trạng thái</th><th></th></tr></thead>
              <tbody>{filtered.map((product) => (
                <tr key={product.id}>
                  <td><div className="product-list-item"><img src={product.imageUrl || '/logo.png'} alt={product.name} /><div><strong>{product.name}</strong><span>{product.brand || `${product.variants?.length ?? 1} biến thể`}</span></div></div></td>
                  <td><span className="product-category-tag">{product.categoryName}</span></td>
                  <td><div className="product-list-price"><strong>{vnd(product.price)}</strong>{product.originalPrice && product.originalPrice > product.price && <del>{vnd(product.originalPrice)}</del>}</div></td>
                  <td><span className={`product-stock ${product.stock <= 5 ? 'low' : ''}`}>{product.stock}<small>{product.stock <= 5 ? ' Sắp hết' : ' Còn hàng'}</small></span></td>
                  <td><span className={`product-status ${product.active ? 'active' : 'hidden'}`}>{product.active ? 'Đang bán' : 'Tạm ẩn'}</span></td>
                  <td><Link className="product-edit-link" to={`/products/${product.id}`}>Chỉnh sửa <span aria-hidden>→</span></Link></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
