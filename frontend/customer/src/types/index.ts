export type Role = 'USER' | 'ADMIN'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'
export type PaymentMethod = 'COD' | 'QR'
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUND_PENDING' | 'REFUNDED'
export type ReturnStatus = 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'ITEM_RECEIVED' | 'REFUNDING' | 'REFUNDED'
export type ExchangeStatus = 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'ITEM_RECEIVED' | 'SHIPPING' | 'COMPLETED'

export type User = {
  id: number
  email: string
  name: string
  role: Role
}

export type AuthResponse = {
  token: string
  user: User
}

export type Category = {
  id: number
  name: string
  active: boolean
  parentId?: number | null
  sortOrder?: number
  iconKey?: string | null
  children?: Category[]
}

export type Product = {
  id: number
  categoryId: number
  categoryName: string
  name: string
  price: number
  originalPrice?: number | null
  stock: number
  imageUrl: string
  description: string
  active: boolean
  brand?: string | null
  ageRange?: string | null
  flavor?: string | null
  benefits?: string | null
  protein?: number | null
  fat?: number | null
  fiber?: number | null
  ingredients?: string | null
  feedingGuide?: string | null
  origin?: string | null
  shelfLife?: string | null
  variants?: ProductVariant[]
}

export type ProductVariant = {
  weight: string
  sku: string
  price: number
  salePrice?: number | null
  stock: number
}

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type CartItem = {
  id: number
  productId: number
  name: string
  imageUrl: string
  variantSku: string
  variantName: string
  price: number
  quantity: number
  stock: number
  subtotal: number
}

export type Cart = {
  items: CartItem[]
  total: number
  itemCount: number
}

export type OrderItem = {
  productId: number
  productName: string
  imageUrl?: string | null
  variantSku?: string | null
  variantName?: string | null
  price: number
  quantity: number
  subtotal: number
}

export type Order = {
  id: number
  orderCode?: string | null
  status: OrderStatus
  fullName: string
  phone: string
  address: string
  note: string | null
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  returnStatus: ReturnStatus
  returnReason?: string | null
  returnDescription?: string | null
  returnRequestedAt?: string | null
  returnApprovedAt?: string | null
  refundBankName?: string | null
  refundAccountName?: string | null
  refundAccountNumber?: string | null
  refundBankSubmittedAt?: string | null
  returnItemReceivedAt?: string | null
  refundedAt?: string | null
  exchangeStatus: ExchangeStatus
  exchangeProductId?: number | null
  exchangeRequestedVariant?: string | null
  exchangeReason?: string | null
  exchangeDescription?: string | null
  exchangeRequestedAt?: string | null
  exchangeApprovedAt?: string | null
  exchangeItemReceivedAt?: string | null
  exchangeShippingAt?: string | null
  exchangeCompletedAt?: string | null
  total: number
  createdAt: string
  confirmedAt?: string | null
  shippingAt?: string | null
  completedAt?: string | null
  cancelledAt?: string | null
  items: OrderItem[]
}

export type Stats = {
  ordersToday: number
  revenue: number
  lowStock: number
}

export type ProductReview = { id: number; productId: number; productName: string; userName: string; rating: number; comment: string; adminReply?: string | null; createdAt: string; repliedAt?: string | null }
export type ChatMessage = { id: number; fromAdmin: boolean; content: string; createdAt: string }
export type ProductConversation = { id: number; productId: number; productName: string; productImageUrl: string; userName: string; userEmail: string; updatedAt: string; messages: ChatMessage[] }
