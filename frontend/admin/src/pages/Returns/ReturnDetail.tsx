import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/api'
import type { Order, ReturnStatus } from '../../types'
import { returnStatusLabel, vnd } from '../../utils/format'
import './Returns.css'

export function ReturnDetail() {
  const {id}=useParams(); const nav=useNavigate()
  const [order,setOrder]=useState<Order|null>(null); const [err,setErr]=useState('')
  useEffect(()=>{api<Order>(`/api/v1/admin/orders/${id}`).then(setOrder).catch((e:Error)=>setErr(e.message))},[id])
  async function change(status:ReturnStatus){try{setOrder(await api<Order>(`/api/v1/admin/orders/${id}/return-status`,{method:'PATCH',body:JSON.stringify({status})}));setErr('')}catch(e){setErr((e as Error).message)}}
  if(err&&!order)return <p className="error">{err}</p>; if(!order)return <div className="returns-empty">Đang tải...</div>
  const steps:ReturnStatus[]=['REQUESTED','APPROVED','ITEM_RECEIVED','REFUNDED']; const current=steps.indexOf(order.returnStatus)
  return <main className="return-detail-page">
    <div className="admin-order-back" style={{marginBottom: '24px'}}>
      <button className="back-btn" onClick={() => nav('/returns')} style={{display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: '1px solid var(--line)', background: 'var(--paper)', borderRadius: '99px', color: 'var(--muted)', fontSize: '13px', fontWeight: 600, cursor: 'pointer'}}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '16px', height: '16px'}}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Trở về danh sách
      </button>
    </div>
    <div className="return-detail-grid">
      <section>
        <section className="return-stepper">{steps.map((step,index)=><div className={index<=current?'reached':''} key={step}><i>{index<current?'✓':index+1}</i><b>{returnStatusLabel(step)}</b></div>)}</section>
        <article className="return-request-card"><span>Nội dung khách hàng gửi</span><h2>{order.returnReason}</h2><p>{order.returnDescription}</p><small>Gửi lúc {order.returnRequestedAt?new Date(order.returnRequestedAt).toLocaleString('vi-VN'):'—'}</small></article>
      {order.items.map((item)=><article className="return-product" key={`${item.productId}-${item.variantSku}`}><div>{item.imageUrl?<img src={item.imageUrl} alt=""/>:item.productName.charAt(0)}</div><p><b>{item.productName}</b><span>{item.variantName} · ×{item.quantity}</span></p><strong>{vnd(item.subtotal)}</strong></article>)}
    </section><aside>
      <section className="return-info-sidebar-card" style={{background: 'var(--paper)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(229, 214, 239, 0.6)', marginBottom: '24px'}}>
        <span style={{fontSize: '10px', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em'}}>Khách hàng</span>
        <h3 style={{margin: '4px 0 16px', fontSize: '20px', color: 'var(--title)'}}>{order.fullName}</h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span style={{color: 'var(--muted)', fontSize: '13px'}}>Đơn hàng</span>
            <strong style={{fontSize: '14px', color: 'var(--title)'}}>{order.orderCode ?? `#${order.id}`}</strong>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span style={{color: 'var(--muted)', fontSize: '13px'}}>Giá trị hoàn</span>
            <strong style={{fontSize: '16px', color: 'var(--accent)'}}>{vnd(order.total)}</strong>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{color: 'var(--muted)', fontSize: '13px'}}>Trạng thái</span>
            <span className={`pill return-${order.returnStatus}`} style={{fontSize: '12px', padding: '4px 10px'}}>{returnStatusLabel(order.returnStatus)}</span>
          </div>
        </div>
      </section>
      <section className="return-bank-card"><header><div><span>Thông tin nhận tiền hoàn</span><h3>Tài khoản hoàn tiền</h3></div>{order.refundBankSubmittedAt&&<i aria-label="Đã xác minh">✓</i>}</header>{order.refundBankSubmittedAt?<><dl><div><dt>Ngân hàng</dt><dd>{order.refundBankName}</dd></div><div><dt>Chủ tài khoản</dt><dd>{order.refundAccountName}</dd></div><div className="admin-account-number"><dt>Số tài khoản</dt><dd>{order.refundAccountNumber}</dd></div></dl><footer><span>Khách gửi thông tin</span><time>{new Date(order.refundBankSubmittedAt).toLocaleString('vi-VN')}</time></footer></>:<div className="return-bank-empty"><b>Chưa có thông tin tài khoản</b><p>Khách hàng sẽ nhập thông tin sau khi yêu cầu được chấp nhận.</p></div>}{order.refundedAt&&<div className="return-paid-note"><b>✓ Đã thanh toán tiền hoàn</b><time>{new Date(order.refundedAt).toLocaleString('vi-VN')}</time></div>}</section>
      <section className="return-action-card"><span>Hành động tiếp theo</span>{order.returnStatus==='REQUESTED'&&<><button className="btn ok" onClick={()=>void change('APPROVED')}>Chấp nhận yêu cầu</button><button className="btn danger ghost" onClick={()=>void change('REJECTED')}>Từ chối yêu cầu</button></>}{order.returnStatus==='APPROVED'&&<button className="btn ok" disabled={!order.refundBankSubmittedAt} onClick={()=>void change('ITEM_RECEIVED')}>Đã nhận hàng trả</button>}{order.returnStatus==='APPROVED'&&!order.refundBankSubmittedAt&&<small>Chờ khách hàng nhập tài khoản nhận tiền hoàn.</small>}{order.returnStatus==='ITEM_RECEIVED'&&<button className="btn ok" onClick={()=>void change('REFUNDED')}>Xác nhận đã hoàn tiền</button>}{order.returnStatus==='REFUNDED'&&<strong>✓ Đã thanh toán tiền hoàn cho khách</strong>}<Link to={`/orders/${order.id}`}>Xem đơn hàng gốc</Link></section>
    </aside></div>{err&&<p className="error">{err}</p>}
  </main>
}
