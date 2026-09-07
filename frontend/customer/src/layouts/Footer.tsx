import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

function Icon({ d, extra }: { d: string; extra?: string }) {
  return (
    <svg className="ft-ico" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {extra && <path d={extra} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  )
}

const pledges = [
  {
    title: 'Chính hãng',
    desc: 'Đồ ăn & phụ kiện đúng mô tả',
    d: 'M12 3 4.5 6.5v5.2c0 4.7 3.2 8.1 7.5 9.3 4.3-1.2 7.5-4.6 7.5-9.3V6.5L12 3z',
    extra: 'm9 12 2 2 4-4',
  },
  {
    title: 'Giao hàng',
    desc: 'COD toàn quốc, miễn ship >500k',
    d: 'M3 7h11v10H3zM14 10h4l3 3v4h-7M6 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm12 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  },
  {
    title: 'Thanh toán',
    desc: 'Thanh toán khi nhận hàng (COD)',
    d: 'M4 6h16v12H4zM4 10h16M8 14h4',
  },
  {
    title: 'Đổi trả',
    desc: 'Hỗ trợ đổi trong 7 ngày',
    d: 'M4 12a8 8 0 0 1 13.5-5.8L20 8M20 12a8 8 0 0 1-13.5 5.8L4 16',
    extra: 'M20 4v4h-4M4 20v-4h4',
  },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function subscribe(event: FormEvent) {
    event.preventDefault()
    if (!email.trim()) return
    setSent(true)
    setEmail('')
  }

  function toTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="site-footer">
      <div className="ft-pledges">
        <div className="container ft-pledges-row">
          {pledges.map((pledge) => (
            <div key={pledge.title} className="ft-pledge">
              <Icon d={pledge.d} extra={pledge.extra} />
              <div>
                <b>{pledge.title}</b>
                <span>{pledge.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container ft-main">
        <div className="ft-personal">
          <div className="ft-brand">
            <img className="ft-logo" src="/logo.png" alt="MeoShop" />
            <div>
              <strong>MEOSHOP</strong>
              <p>Đồ ăn và phụ kiện nhỏ xinh dành cho mèo.</p>
            </div>
          </div>

          <p className="ft-addr">
            Trụ sở: Hà Nội, Việt Nam
            <br />
            MST: 0123456789 · Dự án Spring Boot + React + JWT
          </p>

          <h3>Đăng ký nhận tin</h3>
          <p className="ft-hint">Nhập email để nhận thông tin sản phẩm mới.</p>
          <form className="ft-news" onSubmit={subscribe}>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Địa chỉ Email"
              required
            />
            <button type="submit">Gửi</button>
          </form>
          {sent && <p className="ft-ok">Đã ghi nhận email của bạn.</p>}

          <div className="ft-follow">
            <div>
              <span>Theo dõi chúng tôi</span>
              <div className="ft-social">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">Ig</a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">Yt</a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">Tk</a>
              </div>
            </div>
            <b>HOTLINE: 1800 0000</b>
          </div>
        </div>

        <nav className="ft-links" aria-label="Liên kết cuối trang">
          <Link to="/">Cửa hàng</Link>
          <Link to="/cart">Giỏ hàng</Link>
          <Link to="/orders">Đơn hàng</Link>
          <Link to="/login">Đăng nhập</Link>
        </nav>
      </div>

      <div className="ft-bottom">
        <div className="container">
          <span>© {new Date().getFullYear()} MeoShop</span>
          <span>Thanh toán COD · Hỗ trợ đổi trả trong 7 ngày</span>
        </div>
      </div>

      <button className="ft-top" type="button" onClick={toTop} aria-label="Lên đầu trang">
        ↑
      </button>
    </footer>
  )
}
