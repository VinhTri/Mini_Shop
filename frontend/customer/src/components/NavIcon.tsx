type Name = 'store' | 'orders' | 'admin' | 'user' | 'logout' | 'login' | 'register' | 'cart'

const paths: Record<Name, string> = {
  store:
    'M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z',
  orders:
    'M8 7h8M8 12h8M8 17h5M5 4h14a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2-3-2V5a1 1 0 0 1 1-1z',
  admin:
    'M12 3 4 6v6c0 5 3.5 8.5 8 9.5 4.5-1 8-4.5 8-9.5V6l-8-3z',
  user:
    'M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  logout:
    'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  login:
    'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3',
  register:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6',
  cart:
    'M6 6h15l-1.5 9h-12L5 3H2M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
}

export function NavIcon({ name }: { name: Name }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={paths[name]}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
