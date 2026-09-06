import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import type { Stats } from '../../types'
import { vnd } from '../../utils/format'

export function Dashboard() {
  const [s, setS] = useState<Stats | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    api<Stats>('/api/v1/admin/stats').then(setS).catch((e: Error) => setErr(e.message))
  }, [])
  if (err) return <p className="error">{err}</p>
  if (!s) return <p className="muted">Đang tải...</p>
  return (
    <>
      <h1 style={{ fontFamily: 'var(--display)' }}>Tổng quan</h1>
      <div className="stats">
        <div className="stat">
          Đơn hôm nay
          <b>{s.ordersToday}</b>
        </div>
        <div className="stat">
          Doanh thu (đơn hoàn tất)
          <b>{vnd(s.revenue)}</b>
        </div>
        <div className="stat">
          SP tồn ≤ 5
          <b>{s.lowStock}</b>
        </div>
      </div>
    </>
  )
}
