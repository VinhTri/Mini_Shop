import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { api } from '../services/api'
import type { Cart, Product, ProductVariant } from '../types'
import {
  addGuestItem,
  emptyCart,
  readGuestCart,
  removeGuestItem,
  updateGuestQty,
} from '../utils/guestCart'

type CartCtx = {
  cart: Cart
  addProduct: (product: Product, quantity: number, variant: ProductVariant) => Promise<void>
  setQty: (itemId: number, quantity: number) => Promise<void>
  remove: (itemId: number) => Promise<void>
  refresh: () => Promise<void>
}

const Ctx = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const loc = useLocation()
  const [cart, setCart] = useState<Cart>(emptyCart)

  async function refresh() {
    if (user) {
      try {
        setCart(await api<Cart>('/api/v1/cart'))
      } catch {
        setCart(emptyCart())
      }
      return
    }
    setCart(readGuestCart())
  }

  useEffect(() => {
    void refresh()
  }, [user, loc.pathname])

  const value = useMemo<CartCtx>(
    () => ({
      cart,
      refresh,
      async addProduct(product, quantity, variant) {
        if (user) {
          setCart(
            await api<Cart>('/api/v1/cart', {
              method: 'POST',
              body: JSON.stringify({ productId: product.id, variantSku: variant.sku, quantity }),
            }),
          )
          return
        }
        setCart(
          addGuestItem({
            id: Date.now(),
            productId: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            variantSku: variant.sku,
            variantName: variant.weight,
            price: variant.salePrice ?? variant.price,
            quantity,
            stock: variant.stock,
          }),
        )
      },
      async setQty(itemId, quantity) {
        if (user) {
          setCart(
            await api<Cart>(`/api/v1/cart/${itemId}`, {
              method: 'PUT',
              body: JSON.stringify({ quantity }),
            }),
          )
          return
        }
        setCart(updateGuestQty(itemId, quantity))
      },
      async remove(itemId) {
        if (user) {
          setCart(await api<Cart>(`/api/v1/cart/${itemId}`, { method: 'DELETE' }))
          return
        }
        setCart(removeGuestItem(itemId))
      },
    }),
    [cart, user],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('CartProvider missing')
  return ctx
}
