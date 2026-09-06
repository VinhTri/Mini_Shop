import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { api } from '../../services/api'
import type { Category } from '../../types'
import { CATEGORY_ICONS, categoryIconSrc } from '../../constants/categoryIcons'

export function Categories() {
  const [rows, setRows] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [iconKey, setIconKey] = useState('')
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')

  function load() {
    setLoading(true)
    api<Category[]>('/api/v1/admin/categories')
      .then(setRows)
      .catch((error: Error) => setErr(error.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('vi')
    if (!keyword) return rows
    return rows.filter((category) => category.name.toLocaleLowerCase('vi').includes(keyword))
  }, [query, rows])

  function notify(message: string) {
    setErr('')
    setSuccess(message)
  }

  async function add(event: FormEvent) {
    event.preventDefault()
    const normalizedName = name.trim()
    if (!normalizedName) return
    try {
      setBusyId(0)
      setErr('')
      await api('/api/v1/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name: normalizedName, active: true, iconKey }),
      })
      setName('')
      setIconKey('')
      notify(`Đã thêm danh mục “${normalizedName}”.`)
      load()
    } catch (error) {
      setSuccess('')
      setErr((error as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  async function update(category: Category, changes: Partial<Pick<Category, 'name' | 'active'>>) {
    setBusyId(category.id)
    setErr('')
    try {
      await api(`/api/v1/admin/categories/${category.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: changes.name ?? category.name,
          active: changes.active ?? category.active,
          sortOrder: category.sortOrder ?? 0,
          iconKey: category.iconKey || 'dry-food',
        }),
      })
      load()
      return true
    } catch (error) {
      setSuccess('')
      setErr((error as Error).message)
      return false
    } finally {
      setBusyId(null)
    }
  }

  async function saveName(category: Category) {
    const normalizedName = editingName.trim()
    if (!normalizedName) {
      setErr('Tên danh mục không được để trống.')
      return
    }
    const saved = await update(category, { name: normalizedName })
    if (saved) {
      setEditingId(null)
      notify(`Đã đổi tên danh mục thành “${normalizedName}”.`)
    }
  }

  async function toggle(category: Category) {
    const active = !category.active
    const saved = await update(category, { active })
    if (saved) notify(active ? `Đã hiển thị “${category.name}”.` : `Đã ẩn “${category.name}”.`)
  }

  async function remove(category: Category) {
    if (!window.confirm(`Xóa danh mục “${category.name}”? Thao tác này không thể hoàn tác.`)) return
    try {
      setBusyId(category.id)
      setErr('')
      await api(`/api/v1/admin/categories/${category.id}`, { method: 'DELETE' })
      notify(`Đã xóa danh mục “${category.name}”.`)
      load()
    } catch (error) {
      setSuccess('')
      setErr((error as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="category-admin-page">
      <header className="category-admin-head" style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '24px', alignItems: 'center'}}>
        <label className="category-search" style={{margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên danh mục..." style={{minWidth: '300px', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--line)', background: '#fff'}} />
        </label>
      </header>

      <form className="category-create" onSubmit={(event) => void add(event)}>
        <div>
          <h2>Thêm danh mục mới</h2>
          <p>Danh mục mới sẽ được hiển thị ngay trên cửa hàng.</p>
        </div>
        <label>
          <span>Tên danh mục</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Thức ăn cho mèo" maxLength={100} required />
        </label>
        <fieldset className="category-icon-fieldset">
          <legend>Chọn icon</legend>
          <div className="category-icon-grid">
            {CATEGORY_ICONS.map((icon) => (
              <label className={`category-icon-option ${iconKey === icon.key ? 'selected' : ''}`} key={icon.key} title={icon.label}>
                <input type="radio" name="categoryIcon" value={icon.key} checked={iconKey === icon.key} onChange={() => setIconKey(icon.key)} required />
                <img src={icon.src} alt={icon.label} />
                <span>{icon.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button className="btn category-create-submit" disabled={busyId === 0 || !name.trim() || !iconKey}>{busyId === 0 ? 'Đang thêm...' : 'Thêm danh mục'}</button>
      </form>

      {err && <p className="category-notice error" role="alert">{err}</p>}
      {success && <p className="category-notice ok-msg" role="status">{success}</p>}

      <section className="category-table-wrap" aria-labelledby="category-list-title">
        <div className="category-table-head">
          <h2 id="category-list-title">Danh sách danh mục</h2>
          <span>{filteredRows.length} / {rows.length} danh mục</span>
        </div>
        {loading ? (
          <div className="category-state">Đang tải danh mục...</div>
        ) : filteredRows.length === 0 ? (
          <div className="category-state">
            <strong>{query ? 'Không tìm thấy danh mục phù hợp' : 'Chưa có danh mục nào'}</strong>
            <span>{query ? 'Thử tìm bằng từ khóa khác.' : 'Nhập tên ở phía trên để tạo danh mục đầu tiên.'}</span>
          </div>
        ) : (
          <div className="category-table-scroll">
            <table className="table category-table">
              <thead><tr><th>Tên danh mục</th><th>Sản phẩm</th><th>Trạng thái</th><th className="category-actions-heading">Thao tác</th></tr></thead>
              <tbody>
                {filteredRows.map((category) => (
                  <tr key={category.id}>
                    <td>
                      {editingId === category.id ? (
                        <div className="category-edit">
                          <input value={editingName} onChange={(event) => setEditingName(event.target.value)} maxLength={100} autoFocus />
                          <button type="button" className="btn" onClick={() => void saveName(category)} disabled={busyId === category.id}>Lưu</button>
                          <button type="button" className="btn ghost" onClick={() => setEditingId(null)}>Hủy</button>
                        </div>
                      ) : <span className="category-name-cell"><img src={categoryIconSrc(category.iconKey)} alt="" aria-hidden /><strong>{category.name}</strong></span>}
                    </td>
                    <td><span className="category-count">{category.productCount ?? 0}</span></td>
                    <td><span className={`category-status ${category.active ? 'visible' : 'hidden'}`}>{category.active ? 'Đang hiển thị' : 'Đang ẩn'}</span></td>
                    <td>
                      <div className="category-actions">
                        <button type="button" className="btn ghost" onClick={() => { setEditingId(category.id); setEditingName(category.name); setSuccess('') }} disabled={busyId === category.id || editingId === category.id}>Đổi tên</button>
                        <button type="button" className="btn ghost" onClick={() => void toggle(category)} disabled={busyId === category.id}>{category.active ? 'Ẩn' : 'Hiện'}</button>
                        <button type="button" className="btn danger" onClick={() => void remove(category)} disabled={busyId === category.id || (category.productCount ?? 0) > 0} title={(category.productCount ?? 0) > 0 ? 'Hãy chuyển hoặc xóa sản phẩm trước khi xóa danh mục' : undefined}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
