const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('minishop_token')
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('Không kết nối được máy chủ. Hãy kiểm tra backend đang chạy ở cổng 9090.')
  }

  const contentType = res.headers.get('content-type') || ''
  const body = (contentType.includes('application/json')
    ? await res.json()
    : { message: res.status >= 500
        ? 'Backend chưa chạy hoặc proxy API chưa kết nối được cổng 9090.'
        : 'Máy chủ trả về phản hồi không hợp lệ.' }) as {
    success?: boolean
    message?: string
    data?: T
  }
  if (!res.ok || body.success === false) {
    throw new Error(body.message || 'Có lỗi xảy ra')
  }
  return body.data as T
}
