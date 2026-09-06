import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { api } from '../../services/api'
import type { ProductReview } from '../../types'

export function ProductReviewsPanel({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const [savingId, setSavingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const average = useMemo(() => reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : 0, [reviews])

  async function load() {
    const all = await api<ProductReview[]>('/api/v1/admin/reviews')
    const data = all.filter(item => item.productId === productId)
    setReviews(data)
    setDrafts(Object.fromEntries(data.map(item => [item.id, item.adminReply ?? ''])))
  }

  useEffect(() => { void load().catch((e: Error) => setError(e.message)) }, [productId])

  async function reply(event: FormEvent, review: ProductReview) {
    event.preventDefault()
    const content = drafts[review.id]?.trim()
    if (!content) return
    setSavingId(review.id); setError('')
    try { await api(`/api/v1/admin/reviews/${review.id}/reply`, { method: 'POST', body: JSON.stringify({ content }) }); await load() }
    catch (e) { setError((e as Error).message) } finally { setSavingId(null) }
  }

  return <section className="product-review-admin">
    <header><div><p>Phản hồi khách hàng</p><h2>Đánh giá sản phẩm</h2><span>Xem và chỉnh sửa phản hồi của TVT Meow cho riêng sản phẩm này.</span></div><div className="product-review-summary"><strong>{average ? average.toFixed(1) : '—'}</strong><span>★★★★★</span><small>{reviews.length} đánh giá</small></div></header>
    {error && <p className="product-form-error">{error}</p>}
    {!reviews.length ? <div className="product-review-empty"><span>☆</span><b>Chưa có đánh giá</b><p>Khi khách hàng đánh giá sản phẩm, nội dung sẽ xuất hiện tại đây.</p></div> : <div className="product-review-admin-list">{reviews.map(review => <article key={review.id}><header><span className="reviewer-avatar">{review.userName.charAt(0)}</span><div><b>{review.userName}</b><span className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span></div><em className={review.adminReply?'answered':'waiting'}>{review.adminReply?'Đã phản hồi':'Chờ phản hồi'}</em></header><blockquote>{review.comment}</blockquote><form onSubmit={(e)=>void reply(e, review)}><label>Phản hồi của TVT Meow<textarea value={drafts[review.id] ?? ''} onChange={e=>setDrafts(current=>({...current,[review.id]:e.target.value}))} maxLength={1500} rows={3} placeholder="Viết phản hồi cho khách hàng..."/></label><div><small>{(drafts[review.id] ?? '').length}/1500</small><button className="btn" disabled={savingId===review.id || !(drafts[review.id] ?? '').trim()}>{savingId===review.id?'Đang lưu...':review.adminReply?'Lưu chỉnh sửa':'Gửi phản hồi'}</button></div></form></article>)}</div>}
  </section>
}
