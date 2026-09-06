export function vnd(n: number | string) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(n))
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao',
    COMPLETED: 'Hoàn tất',
    CANCELLED: 'Đã hủy',
  }
  return map[status] ?? status
}

export function paymentStatusLabel(status: string) {
  return ({ UNPAID: 'Chưa thanh toán', PAID: 'Đã thanh toán', REFUND_PENDING: 'Đang hoàn tiền', REFUNDED: 'Đã hoàn tiền' } as Record<string, string>)[status] ?? status
}

export function returnStatusLabel(status: string) {
  return ({ NONE: 'Chưa yêu cầu', REQUESTED: 'Chờ duyệt đổi trả', APPROVED: 'Đã chấp nhận đổi trả', REJECTED: 'Đã từ chối đổi trả', ITEM_RECEIVED: 'Đã nhận hàng trả', REFUNDING: 'Đang hoàn tiền', REFUNDED: 'Hoàn tiền thành công' } as Record<string, string>)[status] ?? status
}
