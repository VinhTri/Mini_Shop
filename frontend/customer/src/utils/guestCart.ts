import { api } from '../services/api'
import type { Cart, CartItem } from '../types'

const KEY = 'tvt_guest_cart_v2'

export function emptyCart(): Cart {
  return { items: [], total: 0, itemCount: 0 }
}

export function cartFromItems(items: CartItem[]): Cart {
  const total = items.reduce((sum, i) => sum + i.subtotal, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  return { items, total, itemCount }
}

function line(item: Omit<CartItem, 'subtotal'>): CartItem {
  return { ...item, subtotal: Number(item.price) * item.quantity }
}

export function readGuestCart(): Cart {
  const raw = localStorage.getItem(KEY)
  if (!raw) return emptyCart()
  try {
    const items = (JSON.parse(raw) as CartItem[]).map((i) => line(i))
    return cartFromItems(items)
  } catch {
    return emptyCart()
  }
}

function writeGuestItems(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function addGuestItem(input: Omit<CartItem, 'subtotal'>) {
  const cart = readGuestCart()
  const existing = cart.items.find((i) => i.productId === input.productId && i.variantSku === input.variantSku)
  const quantity = (existing?.quantity ?? 0) + input.quantity
  if (quantity > input.stock) {
    throw new Error(`Không đủ tồn kho (còn ${input.stock})`)
  }
  const next = existing
    ? cart.items.map((i) => (i.productId === input.productId && i.variantSku === input.variantSku ? line({ ...i, ...input, id: i.id, quantity }) : i))
    : [...cart.items, line({ ...input, quantity })]
  writeGuestItems(next)
  return cartFromItems(next)
}

export function updateGuestQty(itemId: number, quantity: number) {
  const cart = readGuestCart()
  const item = cart.items.find((i) => i.id === itemId)
  if (!item) throw new Error('Sản phẩm không có trong giỏ')
  if (quantity <= 0) {
    return removeGuestItem(itemId)
  }
  if (quantity > item.stock) {
    throw new Error(`Không đủ tồn kho (còn ${item.stock})`)
  }
  const next = cart.items.map((i) => (i.id === itemId ? line({ ...i, quantity }) : i))
  writeGuestItems(next)
  return cartFromItems(next)
}

export function removeGuestItem(itemId: number) {
  const next = readGuestCart().items.filter((i) => i.id !== itemId)
  writeGuestItems(next)
  return cartFromItems(next)
}

export function clearGuestCart() {
  localStorage.removeItem(KEY)
}

export async function mergeGuestCartToServer() {
  const guest = readGuestCart()
  if (guest.items.length === 0) return
  const retryItems: CartItem[] = []
  for (const item of guest.items) {
    try {
      await api('/api/v1/cart', {
        method: 'POST',
        body: JSON.stringify({ productId: item.productId, variantSku: item.variantSku, quantity: item.quantity }),
      })
    } catch (error) {
      const message = (error as Error).message.toLowerCase()
      const productUnavailable =
        message.includes('không tìm thấy sản phẩm') ||
        message.includes('đã ngừng bán')
      if (!productUnavailable) retryItems.push(item)
    }
  }
  if (retryItems.length) writeGuestItems(retryItems)
  else clearGuestCart()
}
