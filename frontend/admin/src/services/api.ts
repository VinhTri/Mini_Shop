const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('minishop_token')
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  const body = (await res.json().catch(() => ({ message: 'Không đọc được phản hồi' }))) as {
    success?: boolean
    message?: string
    data?: T
  }
  if (!res.ok || body.success === false) {
    throw new Error(body.message || 'Có lỗi xảy ra')
  }
  return body.data as T
}
