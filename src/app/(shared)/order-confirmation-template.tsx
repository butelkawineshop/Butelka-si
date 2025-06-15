import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { OrderConfirmationClient } from './order-confirmation-client'
import type { Order } from '@butelkawineshop/types'

async function getOrderData(orderId: string): Promise<Order> {
  const queryParams = new URLSearchParams({
    where: JSON.stringify({
      id: {
        equals: orderId,
      },
    }),
    depth: '2',
  })

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/orders?${queryParams.toString()}`,
    {
      next: { revalidate: 600 },
    }
  )

  if (!res.ok) {
    return notFound()
  }

  const { docs: orders } = await res.json()
  const order = orders[0]

  if (!order) {
    return notFound()
  }

  return order as Order
}

export default async function OrderConfirmationTemplate({ orderId }: { orderId: string }) {
  const t = await getTranslations('orderConfirmation')
  const order = await getOrderData(orderId)

  // Convert translations to a plain object
  const translations = {
    orderConfirmed: t('orderConfirmed'),
    thankYou: t('thankYou'),
    orderNumber: t('orderNumber'),
    orderDate: t('orderDate'),
    paymentStatus: t('paymentStatus'),
    orderStatus: t('orderStatus'),
    shippingAddress: t('shippingAddress'),
    orderSummary: t('orderSummary'),
    continueShopping: t('continueShopping'),
    refreshStatus: t('refreshStatus'),
    paymentProcessing: t('paymentProcessing'),
    checkingStatus: t('checkingStatus'),
    status: {
      pending: t('status.pending'),
      processing: t('status.processing'),
      shipped: t('status.shipped'),
      delivered: t('status.delivered'),
      cancelled: t('status.cancelled'),
      paid: t('status.paid'),
      failed: t('status.failed'),
      refunded: t('status.refunded'),
    },
  }

  return <OrderConfirmationClient order={order} translations={translations} orderId={orderId} />
}
