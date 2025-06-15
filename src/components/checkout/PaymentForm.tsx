'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useToast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { useCart } from '@/contexts/CartContext'

export const PaymentForm = ({ orderId }: { orderId: string }) => {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const t = useTranslations('checkout')
  const { clearCart } = useCart()
  const locale = pathname.startsWith('/en') ? 'en' : 'sl'
  const confirmationPath = locale === 'en' ? '/en/confirmation' : '/potrditev'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}${confirmationPath}?orderId=${orderId}`,
        },
        redirect: 'if_required',
      })

      if (submitError) {
        setError(submitError.message || 'An error occurred')
        toast({
          title: t('error.paymentFailed'),
          description: submitError.message || t('error.unknownError'),
          variant: 'destructive',
        })
      } else {
        // Payment succeeded
        await clearCart()
        toast({
          title: t('success.paymentSuccessful'),
          description: t('success.redirectingToConfirmation'),
        })
        router.push(`${confirmationPath}?orderId=${orderId}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast({
        title: t('error.paymentFailed'),
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">{t('paymentMethod.paymentDetails')}</h3>
        <PaymentElement />
      </div>

      {error && <div className="text-error text-sm">{error}</div>}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-accent text-black py-2 px-4 rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50"
      >
        {isLoading ? t('processing') : t('paymentMethod.payNow')}
      </button>
    </form>
  )
}
