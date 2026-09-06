import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { Product, ProductConversation, ProductReview } from '../../types'

export function ProductCommunity({ product }: { product: Product }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [chat, setChat] = useState<ProductConversation | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  const [ratingFilter, setRatingFilter] = useState(0)
  const [reviewSort, setReviewSort] = useState<'newest' | 'highest' | 'lowest'>('newest')
  const average = useMemo(() => reviews.length ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length : 0, [reviews])
  const ratingCounts = useMemo(() => [1, 2, 3, 4, 5].reduce<Record<number, number>>((result, value) => {
    result[value] = reviews.filter((item) => item.rating === value).length
    return result
  }, {}), [reviews])
  const visibleReviews = useMemo(() => {
    const filtered = ratingFilter ? reviews.filter((item) => item.rating === ratingFilter) : [...reviews]
    if (reviewSort === 'highest') return filtered.sort((a, b) => b.rating - a.rating)
    if (reviewSort === 'lowest') return filtered.sort((a, b) => a.rating - b.rating)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [reviews, ratingFilter, reviewSort])

  async function loadReviews() { setReviews(await api<ProductReview[]>(`/api/v1/products/${product.id}/reviews`)) }
  async function loadChat() { if (user) setChat(await api<ProductConversation | null>(`/api/v1/products/${product.id}/chat`)) }

  useEffect(() => { void loadReviews() }, [product.id])
  useEffect(() => {
    if (!chatOpen || !user) return
    void loadChat()
    const timer = window.setInterval(() => void loadChat(), 5000)
    return () => window.clearInterval(timer)
  }, [chatOpen, user, product.id])

  async function submitReview(event: FormEvent) {
    event.preventDefault(); setSending(true); setError('')
    try { await api(`/api/v1/products/${product.id}/reviews`, { method: 'POST', body: JSON.stringify({ rating, comment }) }); setComment(''); setReviewFormOpen(false); await loadReviews() }
    catch (e) { setError((e as Error).message) } finally { setSending(false) }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault(); if (!message.trim()) return; setSending(true); setError('')
    try { setChat(await api<ProductConversation>(`/api/v1/products/${product.id}/chat`, { method: 'POST', body: JSON.stringify({ content: message }) })); setMessage('') }
    catch (e) { setError((e as Error).message) } finally { setSending(false) }
  }

  return <>
    <section className="product-reviews">
      <header className="review-heading"><span className="review-heading-icon" aria-hidden="true">▱</span><h2>Đánh giá sản phẩm</h2></header>
      <div className="review-layout">
        <aside className="review-summary">
          <div className="review-score"><strong>{reviews.length ? average.toFixed(1) : '0.0'}</strong><span aria-label={`${average.toFixed(1)} trên 5 sao`}>{'★'.repeat(Math.round(average))}<i>{'★'.repeat(5 - Math.round(average))}</i></span><small>{reviews.length} đánh giá</small></div>
          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map((star) => {
              const percent = reviews.length ? Math.round((ratingCounts[star] / reviews.length) * 100) : 0
              return <button type="button" key={star} className={ratingFilter === star ? 'active' : ''} onClick={() => setRatingFilter(ratingFilter === star ? 0 : star)} aria-label={`Lọc đánh giá ${star} sao`}><b>{star}</b><span>★</span><i><em style={{ width: `${percent}%` }} /></i><small>{percent}%</small></button>
            })}
          </div>
          {user ? <button className="write-review-button" onClick={() => setReviewFormOpen((open) => !open)}>{reviewFormOpen ? 'Đóng biểu mẫu' : 'Viết đánh giá'}</button> : <Link className="write-review-button" to="/login" state={{ from: `/products/${product.id}` }}>Đăng nhập để đánh giá</Link>}
        </aside>
        <div className="review-content">
          <div className="review-toolbar">
            <label>Lọc theo<select value={ratingFilter} onChange={(event) => setRatingFilter(Number(event.target.value))}><option value={0}>Tất cả</option>{[5,4,3,2,1].map((star) => <option value={star} key={star}>{star} sao</option>)}</select></label>
            <label>Sắp xếp<select value={reviewSort} onChange={(event) => setReviewSort(event.target.value as typeof reviewSort)}><option value="newest">Mới nhất</option><option value="highest">Điểm cao nhất</option><option value="lowest">Điểm thấp nhất</option></select></label>
          </div>
          {reviewFormOpen && user && <form className="review-compose" onSubmit={(e) => void submitReview(e)}><div><h3>Chia sẻ trải nghiệm của bạn</h3><small>Đánh giá chân thực giúp khách hàng khác lựa chọn dễ hơn.</small></div><div className="rating-input" aria-label="Chọn số sao">{[1,2,3,4,5].map(star => <button type="button" aria-label={`${star} sao`} key={star} className={star <= rating ? 'on' : ''} onClick={() => setRating(star)}>★</button>)}</div><textarea value={comment} onChange={e => setComment(e.target.value)} required maxLength={1500} rows={4} placeholder="Sản phẩm có phù hợp với mèo của bạn không?"/><div className="review-compose-footer"><small>{comment.length}/1500</small><button className="btn" disabled={sending}>{sending ? 'Đang gửi...' : 'Gửi đánh giá'}</button></div></form>}
          <div className="review-list">
            {reviews.length === 0 && <div className="review-empty">Chưa có đánh giá. Hãy là người đầu tiên chia sẻ trải nghiệm.</div>}
            {reviews.length > 0 && visibleReviews.length === 0 && <div className="review-empty">Chưa có đánh giá phù hợp với bộ lọc này.</div>}
            {visibleReviews.map((review) => <article key={review.id}><div className="review-meta"><span className="review-stars">{'★'.repeat(review.rating)}<i>{'★'.repeat(5-review.rating)}</i></span><b>{review.userName}</b><time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</time></div><p>{review.comment}</p>{review.adminReply && <div className="review-reply"><b>TVT Meow phản hồi</b><p>{review.adminReply}</p></div>}</article>)}
          </div>
        </div>
      </div>
      {error && <p className="review-error">{error}</p>}
    </section>

    <button className="product-chat-trigger" onClick={() => setChatOpen(true)}><span>💬</span><b>Tư vấn sản phẩm</b></button>
    {chatOpen && <div className="product-chat-layer" onMouseDown={(e) => { if (e.target === e.currentTarget) setChatOpen(false) }}><section className="product-chat">
      <header><div className="chat-product">{product.imageUrl ? <img src={product.imageUrl} alt={product.name}/> : <span>🐱</span>}<div><small>Đang tư vấn sản phẩm</small><b>{product.name}</b></div></div><button onClick={() => setChatOpen(false)} aria-label="Đóng">×</button></header>
      {!user ? <div className="chat-login"><b>Đăng nhập để trò chuyện với TVT Meow</b><p>Cuộc tư vấn sẽ được lưu riêng cho tài khoản của bạn.</p><Link className="btn" to="/login" state={{ from: `/products/${product.id}` }}>Đăng nhập</Link></div> : <><div className="chat-messages">{!chat?.messages.length && <div className="chat-welcome">Chào bạn, hãy gửi câu hỏi về sản phẩm. Admin sẽ phản hồi sớm.</div>}{chat?.messages.map(item => <div key={item.id} className={`chat-bubble ${item.fromAdmin ? 'admin' : 'user'}`}><small>{item.fromAdmin ? 'TVT Meow' : 'Bạn'}</small><p>{item.content}</p></div>)}</div><form onSubmit={(e) => void sendMessage(e)}><textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} maxLength={1500} placeholder="Nhập câu hỏi về sản phẩm..."/><button className="btn" disabled={sending || !message.trim()}>Gửi</button></form></>}
      {error && <p className="error">{error}</p>}
    </section></div>}
  </>
}
