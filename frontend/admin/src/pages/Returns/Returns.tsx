import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import type { Order, PageResponse, ReturnStatus } from '../../types'
import { returnStatusLabel, vnd } from '../../utils/format'
import './Returns.css'

type Filter = 'ALL' | Exclude<ReturnStatus, 'NONE'>
const filters: Array<{ value: Filter; label: string }> = [
  { value:'ALL', label:'Tất cả' }, { value:'REQUESTED', label:'Chờ duyệt' },
  { value:'APPROVED', label:'Đã chấp nhận' }, { value:'ITEM_RECEIVED', label:'Đã nhận hàng' },
  { value:'REFUNDED', label:'Đã hoàn tiền' }, { value:'REJECTED', label:'Từ chối' },
]

export function Returns() {
  const [orders,setOrders] = useState<Order[]>([])
  const [filter,setFilter] = useState<Filter>('ALL')
  const [query,setQuery] = useState('')
  const [err,setErr] = useState('')
  useEffect(() => { api<PageResponse<Order>>('/api/v1/admin/orders?size=100').then((data) => setOrders(data.content.filter((o) => o.returnStatus !== 'NONE'))).catch((e:Error) => setErr(e.message)) },[])
  const visible = useMemo(() => { const q=query.trim().toLowerCase(); return orders.filter((o) => (filter==='ALL'||o.returnStatus===filter) && (!q || o.orderCode?.toLowerCase().includes(q) || o.fullName.toLowerCase().includes(q) || o.phone.includes(q))) },[orders,filter,query])
  return <main className="admin-returns-page">

    <nav className="return-tabs">{filters.map((item)=><button className={filter===item.value?'active':''} onClick={()=>setFilter(item.value)} key={item.value}>{item.label}<small>{orders.filter((o)=>item.value==='ALL'||o.returnStatus===item.value).length}</small></button>)}</nav>
    <label className="return-search"><span>⌕</span><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Tìm mã đơn, khách hàng hoặc số điện thoại"/></label>
    {err&&<p className="error">{err}</p>}
    <section className="return-list">{visible.map((order)=><article key={order.id} className={order.returnStatus==='REQUESTED'?'new':''}>
      <div className="return-list-code"><span>{order.orderCode??`#${order.id}`}</span><time>{order.returnRequestedAt?new Date(order.returnRequestedAt).toLocaleString('vi-VN'):'—'}</time></div>
      <div className="return-list-customer"><b>{order.fullName}</b><span>{order.phone}</span><small>{order.returnReason}</small></div>
      <div className="return-list-total"><span>Giá trị hoàn</span><b>{vnd(order.total)}</b></div>
      <span className={`pill return-${order.returnStatus}`}>{returnStatusLabel(order.returnStatus)}</span>
      <Link className="btn" to={`/returns/${order.id}`}>{order.returnStatus==='REQUESTED'?'Xử lý yêu cầu':'Xem tiến trình'}</Link>
    </article>)}{visible.length===0&&<div className="returns-empty"><b>Không có yêu cầu phù hợp</b><p>Các yêu cầu hoàn tiền của khách hàng sẽ xuất hiện tại đây.</p></div>}</section>
  </main>
}
