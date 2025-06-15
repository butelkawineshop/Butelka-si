'use client'

import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { Icon } from '../Icon'

interface AddSharedCartToCartProps {
  items: Array<{
    wineVariant: number
    quantity: number
    addedAt: string
  }>
  className?: string
}

export function AddSharedCartToCart({ items, className }: AddSharedCartToCartProps) {
  const { addToCart, clearCart } = useCart()
  const { toast } = useToast()
  const t = useTranslations('cart')

  const handleAddToCart = async () => {
    try {
      await clearCart()
      for (const item of items) {
        await addToCart(item.wineVariant, item.quantity)
      }
      toast({
        title: t('add.success'),
        description: t('add.itemsAdded'),
      })
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: t('common.error'),
        description: t('add.error'),
      })
    }
  }

  return (
    <Button onClick={handleAddToCart} className={className}>
      <Icon name="cart" className="mr-2 h-4 w-4" />
      {t('add.allToCart')}
    </Button>
  )
}
