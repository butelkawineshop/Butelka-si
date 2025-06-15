'use client'

import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { Icon } from '../Icon'
import { useState } from 'react'

interface CartButtonProps {
  wineVariantId: number
  quantity?: number
  className?: string
  label?: string
}

export function CartButton({ wineVariantId, quantity = 1, className }: CartButtonProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const t = useTranslations('cart')
  const [isAnimating, setIsAnimating] = useState(false)

  const handleAddToCart = async () => {
    try {
      setIsAnimating(true)
      await addToCart(wineVariantId, quantity)
      toast({
        title: t('add.success'),
        description: t('add.itemAdded'),
      })
      setTimeout(() => setIsAnimating(false), 500) // Reset after animation
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: t('common.error'),
        description: t('add.error'),
      })
    }
  }

  return (
    <button onClick={handleAddToCart} className={`relative ${className}`}>
      <Icon name="cart" />
      {isAnimating && <Icon name="cart" className="animate-float-cart" />}
    </button>
  )
}
