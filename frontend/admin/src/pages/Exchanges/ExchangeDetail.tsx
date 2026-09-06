import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/api'
import type { ExchangeStatus, Order } from '../../types'
import { vnd } from '../../utils/format'
import '../Returns/Returns.css'

const labels: Record<ExchangeStatus,string>={NONE:'Chưa yêu cầu',REQUESTED:'Chờ duyệt đổi hàng',APPROVED:'Đã chấp nhận đổi hàng',REJECTED:'Đã từ chối',ITEM_RECEIVED:'Đã nhận hàng cũ',SHIPPING:'Đang giao hàng thay thế',COMPLETED:'Đổi hàng thành công'}
const steps: ExchangeStatus[]=['REQUESTED','APPROVED','ITEM_RECEIVED','SHIPPING','COMPLETED']

export function ExchangeDetail(){
  const {id}=useParams(); const nav=useNavigate(); const [order,setOrder]=useState<Order|null>(null); const [err,setErr]=useState('')
  useEffect(()=>{api<Order>(`/api/v1/admin/orders/${id}`).then(setOrder).catch((e:Error)=>setErr(e.message))},[id])
  async function change(status:ExchangeStatus){try{setOrder(await api<Order>(`/api/v1/admin/orders/${id}/exchange-status`,{method:'PATCH',body:JSON.stringify({status})}));setErr('')}catch(e){setErr((e as Error).message)}}
  if(err&&!order)return <p className="error">{err}</p>; if(!order)return <div className="returns-empty">Đang tải...</div>
  const current=steps.indexOf(order.exchangeStatus); const item=order.items.find(i=>i.productId===order.exchangeProductId)??order.items[0]
  return <main className="return-detail-page">
    <div className="admin-order-back"><button className="back-btn" onClick={()=>nav('/exchanges')}>← Trở về danh sách đổi hàng</button></div>
    <div className="return-detail-grid"><section>
      <section className="return-stepper exchange-stepper" aria-label="Tiến trình đổi hàng">{steps.map((step,index)=><div className={index<=current?'reached':''} key={step}><i>{index<current?'✓':index+1}</i><b>{labels[step]}</b></div>)}</section>
      <article className="return-request-card"><span>Yêu cầu đổi hàng của khách</span><h2>{order.exchangeReason}</h2><p>{order.exchangeDescription}</p><small>Gửi lúc {order.exchangeRequestedAt?new Date(order.exchangeRequestedAt).toLocaleString('vi-VN'):'—'}</small></article>
      {item&&<article className="return-product exchange-product"><div>{item.imageUrl?<img src={item.imageUrl} alt={item.productName}/>:item.productName.charAt(0)}</div><p><b>{item.productName}</b><span>Hàng đã nhận: {item.variantName} · ×{item.quantity}</span><em>Muốn đổi sang <strong>{order.exchangeRequestedVariant}</strong></em></p><strong>{vnd(item.subtotal)}</strong></article>}
    </section><aside>
      <section className="exchange-customer-card"><span>Khách hàng</span><h3>{order.fullName}</h3><dl><div><dt>Đơn hàng</dt><dd>{order.orderCode??`#${order.id}`}</dd></div><div><dt>Giá trị đơn</dt><dd>{vnd(order.total)}</dd></div><div><dt>Trạng thái</dt><dd><i className={`pill return-${order.exchangeStatus}`}>{labels[order.exchangeStatus]}</i></dd></div></dl></section>
      <section className="return-bank-card exchange-info-card"><header><div><span>Thông tin đổi hàng</span><h3>Sản phẩm thay thế</h3></div><i aria-label="Đã tiếp nhận">✓</i></header><dl><div><dt>Sản phẩm hiện tại</dt><dd>{item?.variantName||'—'}</dd></div><div><dt>Khách muốn nhận</dt><dd>{order.exchangeRequestedVariant||'—'}</dd></div><div><dt>Số điện thoại</dt><dd>{order.phone}</dd></div></dl>{order.exchangeApprovedAt&&<footer><span>Cửa hàng chấp nhận lúc</span><time>{new Date(order.exchangeApprovedAt).toLocaleString('vi-VN')}</time></footer>}</section>
      <section className="return-action-card"><span>Hành động tiếp theo</span>
        {order.exchangeStatus==='REQUESTED'&&<><button className="btn ok" onClick={()=>void change('APPROVED')}>Chấp nhận đổi hàng</button><button className="btn danger ghost" onClick={()=>void change('REJECTED')}>Từ chối yêu cầu</button></>}
        {order.exchangeStatus==='APPROVED'&&<button className="btn ok" onClick={()=>void change('ITEM_RECEIVED')}>Đã nhận hàng cũ</button>}
        {order.exchangeStatus==='ITEM_RECEIVED'&&<button className="btn ok" onClick={()=>void change('SHIPPING')}>Giao sản phẩm thay thế</button>}
        {order.exchangeStatus==='SHIPPING'&&<button className="btn ok" onClick={()=>void change('COMPLETED')}>Xác nhận đổi hàng thành công</button>}
        {order.exchangeStatus==='COMPLETED'&&<strong>✓ Khách đã nhận sản phẩm thay thế</strong>}
        {order.exchangeStatus==='REJECTED'&&<strong>Yêu cầu đã bị từ chối</strong>}<Link to={`/orders/${order.id}`}>Xem đơn hàng gốc</Link>
      </section>
    </aside></div>{err&&<p className="error">{err}</p>}
  </main>
}
