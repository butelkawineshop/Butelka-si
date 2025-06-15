import { useCart as useCartContext } from '@/contexts/CartContext'

export const useCart = () => {
  const cartContext = useCartContext()

  const subtotal =
    cartContext.cart?.items?.reduce((sum, item) => {
      const variant = typeof item.wineVariant === 'object' ? item.wineVariant : null
      return sum + (variant?.details?.price || 0) * item.quantity
    }, 0) || 0

  const shipping = subtotal > 100 ? 0 : 5.99 // Free shipping over €100
  const tax = subtotal * 0.22 // 22% VAT
  const total = subtotal + shipping + tax

  return {
    ...cartContext,
    subtotal,
    shipping,
    tax,
    total,
  }
}
