import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/api'
import type { Category, Product, ProductVariant } from '../../types'
import { ProductReviewsPanel } from './ProductReviewsPanel'

type VariantDraft = Omit<ProductVariant, 'price' | 'salePrice' | 'stock'> & {
  price: string
  salePrice: string
  stock: string
}

const emptyVariant = (): VariantDraft => ({ weight: '', sku: '', price: '', salePrice: '', stock: '0' })

export function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [cats, setCats] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [feedingGuide, setFeedingGuide] = useState('')
  const [variants, setVariants] = useState<VariantDraft[]>([emptyVariant()])
  const [imageUrl, setImageUrl] = useState('')
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    void api<Category[]>('/api/v1/admin/categories')
      .then(setCats)
      .catch((error: Error) => setErr(error.message))
  }, [])

  useEffect(() => {
    if (!id && cats[0] && !categoryId) setCategoryId(String(cats[0].id))
  }, [cats, id, categoryId])

  useEffect(() => {
    if (!id) return
    void api<Product>(`/api/v1/admin/products/${id}`)
      .then((product) => {
        setName(product.name)
        setBrand(product.brand ?? '')
        setCategoryId(String(product.categoryId))
        setDescription(product.description ?? '')
        setIngredients(product.ingredients ?? '')
        setFeedingGuide(product.feedingGuide ?? '')
        setImageUrl(product.imageUrl ?? '')
        setActive(product.active)
        setVariants((product.variants?.length ? product.variants : [{ weight: 'Mặc định', sku: `SP-${product.id}`, price: product.originalPrice ?? product.price, salePrice: product.originalPrice ? product.price : null, stock: product.stock }]).map((variant) => ({
          weight: variant.weight,
          sku: variant.sku,
          price: String(variant.price),
          salePrice: variant.salePrice == null ? '' : String(variant.salePrice),
          stock: String(variant.stock),
        })))
      })
      .catch((error: Error) => setErr(error.message))
  }, [id])

  function updateVariant(index: number, field: keyof VariantDraft, value: string) {
    setVariants((current) => current.map((variant, row) => row === index ? { ...variant, [field]: value } : variant))
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErr('Vui lòng chọn đúng định dạng ảnh.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setErr('Ảnh không được vượt quá 2 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImageUrl(String(reader.result))
      setErr('')
    }
    reader.readAsDataURL(file)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!categoryId) {
      setErr('Bạn cần tạo và chọn một danh mục trước khi lưu sản phẩm.')
      return
    }
    const normalizedVariants = variants.map((variant) => ({
      weight: variant.weight.trim(),
      sku: variant.sku.trim(),
      price: Number(variant.price),
      salePrice: variant.salePrice ? Number(variant.salePrice) : null,
      stock: Number(variant.stock),
    }))
    if (normalizedVariants.some((variant) => !variant.weight || variant.price < 0 || variant.stock < 0)) {
      setErr('Vui lòng nhập đầy đủ trọng lượng, giá và kho cho từng biến thể.')
      return
    }
    const existingSkus = normalizedVariants.map((variant) => variant.sku.toLowerCase()).filter(Boolean)
    if (new Set(existingSkus).size !== existingSkus.length) {
      setErr('SKU của các biến thể không được trùng nhau.')
      return
    }

    setSaving(true)
    setErr('')
    const body = {
      name: name.trim(), brand: brand.trim(), categoryId: Number(categoryId), description: description.trim(),
      ingredients: ingredients.trim(), feedingGuide: feedingGuide.trim(),
      imageUrl, active, variants: normalizedVariants,
    }
    try {
      await api(editing ? `/api/v1/admin/products/${id}` : '/api/v1/admin/products', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      })
      navigate('/products')
    } catch (error) {
      setErr((error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!id || !window.confirm(`Xóa sản phẩm “${name}”?`)) return
    try {
      await api(`/api/v1/admin/products/${id}`, { method: 'DELETE' })
      navigate('/products')
    } catch (error) {
      setErr((error as Error).message)
    }
  }

  return (
    <main className="product-editor">
      <header className="product-editor-head">
        <div>
          <Link to="/products" className="product-back">← Sản phẩm</Link>
          <h1>{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
          <p>Nhập thông tin cơ bản, giá bán và hình ảnh sản phẩm.</p>
        </div>
        <span className={`product-save-state ${active ? 'selling' : ''}`}>{active ? 'Đang bán' : 'Tạm ẩn'}</span>
      </header>

      <form className="product-form" onSubmit={(event) => void submit(event)}>
        <section className="product-form-section">
          <div className="product-section-index">01</div>
          <div className="product-section-content">
            <div className="product-section-title"><h2>Thông tin cơ bản</h2><p>Tên gọi và nhóm sản phẩm hiển thị trên cửa hàng.</p></div>
            <div className="product-fields two-cols">
              <label>Tên sản phẩm<input value={name} onChange={(e) => setName(e.target.value)} maxLength={160} required placeholder="Ví dụ: Hạt dinh dưỡng cho mèo trưởng thành" /></label>
              <label>Thương hiệu<input value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={120} placeholder="Ví dụ: Royal Canin" /></label>
              <label>Danh mục<select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required><option value="">Chọn danh mục</option>{cats.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select>{cats.length === 0 && <small>Chưa có danh mục. <Link to="/categories">Tạo danh mục trước</Link></small>}</label>
              <label className="field-span-2">Mô tả<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} maxLength={2000} placeholder="Mô tả đặc điểm, kết cấu và điểm nổi bật của sản phẩm..." /></label>
              <label className="field-span-2">Thành phần<textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={4} maxLength={3000} placeholder="Ví dụ: Thịt gà, gạo, dầu cá, vitamin và khoáng chất..." /></label>
              <label className="field-span-2">Hướng dẫn cho ăn<textarea value={feedingGuide} onChange={(e) => setFeedingGuide(e.target.value)} rows={4} maxLength={3000} placeholder="Ví dụ: Mèo 3kg: 40g/ngày. Luôn chuẩn bị đủ nước sạch..." /></label>
            </div>
          </div>
        </section>

        <section className="product-form-section">
          <div className="product-section-index">02</div>
          <div className="product-section-content">
            <div className="product-section-title product-section-title-row"><div><h2>Biến thể</h2><p>Mỗi trọng lượng có SKU, giá và kho riêng.</p></div><button type="button" className="btn ghost" onClick={() => setVariants((current) => [...current, emptyVariant()])}>+ Thêm biến thể</button></div>
            <div className="variant-table-wrap">
              <table className="variant-table"><thead><tr><th>Trọng lượng</th><th>Giá</th><th>Giá KM</th><th>Kho</th><th></th></tr></thead><tbody>{variants.map((variant, index) => <tr key={index}>
                <td><input value={variant.weight} onChange={(e) => updateVariant(index, 'weight', e.target.value)} required placeholder="400g" /></td>
                <td><input type="number" min="0" value={variant.price} onChange={(e) => updateVariant(index, 'price', e.target.value)} required placeholder="0" /></td>
                <td><input type="number" min="0" value={variant.salePrice} onChange={(e) => updateVariant(index, 'salePrice', e.target.value)} placeholder="Không giảm" /></td>
                <td><input type="number" min="0" value={variant.stock} onChange={(e) => updateVariant(index, 'stock', e.target.value)} required /></td>
                <td><button type="button" className="variant-remove" onClick={() => setVariants((current) => current.filter((_, row) => row !== index))} disabled={variants.length === 1} aria-label="Xóa biến thể">×</button></td>
              </tr>)}</tbody></table>
            </div>
          </div>
        </section>

        <section className="product-form-section">
          <div className="product-section-index">03</div>
          <div className="product-section-content">
            <div className="product-section-title"><h2>Hình ảnh</h2><p>Tải ảnh vuông, rõ sản phẩm; dung lượng tối đa 2 MB.</p></div>
            <label className={`product-image-upload ${imageUrl ? 'has-image' : ''}`}>
              <input type="file" accept="image/*" onChange={handleImage} />
              {imageUrl ? <><img src={imageUrl} alt="Xem trước sản phẩm" /><span>Chọn ảnh khác</span></> : <><b>＋</b><strong>Tải ảnh sản phẩm</strong><span>PNG, JPG hoặc WEBP</span></>}
            </label>
          </div>
        </section>

        <section className="product-form-section compact">
          <div className="product-section-index">04</div>
          <div className="product-section-content">
            <div className="product-section-title"><h2>Trạng thái</h2><p>Chỉ sản phẩm đang bán mới xuất hiện trên cửa hàng.</p></div>
            <label className="product-status-select">Trạng thái<select value={active ? 'active' : 'hidden'} onChange={(e) => setActive(e.target.value === 'active')}><option value="active">Đang bán</option><option value="hidden">Tạm ẩn</option></select></label>
          </div>
        </section>

        {err && <p className="product-form-error" role="alert">{err}</p>}
        <footer className="product-form-actions">
          {editing && <button type="button" className="product-delete" onClick={() => void remove()}>Xóa sản phẩm</button>}
          <div><button type="button" className="btn ghost" onClick={() => navigate('/products')}>Hủy</button><button className="btn" disabled={saving || cats.length === 0}>{saving ? 'Đang lưu...' : 'Lưu sản phẩm'}</button></div>
        </footer>
      </form>
      {editing && id && <ProductReviewsPanel productId={Number(id)} />}
    </main>
  )
}
