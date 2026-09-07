import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../services/api'
import type { ProductConversation } from '../types'

export function Interactions() {
  const [chats, setChats] = useState<ProductConversation[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const chat = chats.find(item => item.id === selectedId) ?? chats[0]

  async function load() {
    const data = await api<ProductConversation[]>('/api/v1/admin/conversations')
    setChats(data)
    setSelectedId(current => current ?? data[0]?.id ?? null)
  }

  useEffect(() => {
    void load().catch((e: Error) => setError(e.message))
    const timer = window.setInterval(() => void load(), 5000)
    return () => window.clearInterval(timer)
  }, [])

  async function send(event: FormEvent) {
    event.preventDefault()
    if (!chat || !message.trim()) return
    try {
      await api(`/api/v1/admin/conversations/${chat.id}/messages`, { method: 'POST', body: JSON.stringify({ content: message }) })
      setMessage('')
      await load()
    } catch (e) { setError((e as Error).message) }
  }

  return <main className="interaction-admin consultation-only">
    <header className="interaction-head"><div><p>Chăm sóc khách hàng</p><h1>Tư vấn sản phẩm</h1><span>Hỗ trợ riêng từng khách hàng theo đúng sản phẩm họ đang quan tâm.</span></div><div className="consultation-count"><b>{chats.length}</b><span>Cuộc trò chuyện</span></div></header>
    {error && <p className="error">{error}</p>}
    <section className="interaction-workspace">
      <aside className="interaction-list"><header><div><b>Hộp thư tư vấn</b><small>{chats.length} cuộc trò chuyện</small></div><span>⌕</span></header>{chats.map(item => <button key={item.id} className={chat?.id===item.id?'active':''} onClick={()=>setSelectedId(item.id)}><span className="interaction-avatar">{item.userName.charAt(0)}</span><span><b>{item.userName}</b><small>{item.productName}</small><em>{item.messages.at(-1)?.content ?? 'Chưa có tin nhắn'}</em></span></button>)}</aside>
      <article className="interaction-detail">{!chat ? <div className="interaction-empty"><span>💬</span><b>Chưa có cuộc tư vấn</b><small>Tin nhắn mới của khách hàng sẽ xuất hiện tại đây.</small></div> : <><header className="admin-chat-product">{chat.productImageUrl?<img src={chat.productImageUrl} alt={chat.productName}/>:<span>🐱</span>}<div><small>Đang tư vấn sản phẩm</small><h2>{chat.productName}</h2><span>{chat.userName} · {chat.userEmail}</span></div><em className="online">Đang hỗ trợ</em></header><div className="admin-chat-messages">{chat.messages.map(item=><div key={item.id} className={item.fromAdmin?'admin':'customer'}><small>{item.fromAdmin?'MeoShop':'Khách hàng'}</small><p>{item.content}</p></div>)}</div><form onSubmit={(e)=>void send(e)}><div className="interaction-compose"><textarea value={message} onChange={e=>setMessage(e.target.value)} maxLength={1500} required rows={2} placeholder="Nhập nội dung tư vấn..."/><small>{message.length}/1500</small></div><button className="btn interaction-send"><span>↗</span>Gửi tin</button></form></>}</article>
    </section>
  </main>
}
