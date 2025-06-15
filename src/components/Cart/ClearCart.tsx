'use client'

import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/Icon'

interface ClearCartProps {
  className?: string
}

export function ClearCart({ className }: ClearCartProps) {
  const { clearCart } = useCart()
  const { toast } = useToast()
  const t = useTranslations('cart')

  const handleClearCart = async () => {
    try {
      await clearCart()
      toast({
        title: t('clear.success'),
        description: t('clear.cartCleared'),
      })
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast({
        title: t('common.error'),
        description: t('clear.error'),
        variant: 'destructive',
      })
    }
  }

  return (
    <button
      onClick={handleClearCart}
      className={`flex-1 h-12 px-4 py-2 font-accent text-foreground icon-container hover:bg-other-bg/10 rounded-md gap-2 flex items-center justify-center ${className}`}
      aria-label="Clear cart"
    >
      <Icon name="trash" className="w-4 h-4" />
      {t('clear.button')}
    </button>
  )
}
