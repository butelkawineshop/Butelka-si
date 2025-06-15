'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { formatDate } from '@/utilities/formatDate'
import type { Order } from '@butelkawineshop/types'

type OrderConfirmationClientProps = {
  order: Order
  orderId: string
  translations: {
    orderConfirmed: string
    thankYou: string
    orderNumber: string
    orderDate: string
    paymentStatus: string
    orderStatus: string
    shippingAddress: string
    orderSummary: string
    continueShopping: string
    refreshStatus: string
    paymentProcessing: string
    checkingStatus: string
    status: {
      pending: string
      processing: string
      shipped: string
      delivered: string
      cancelled: string
      paid: string
      failed: string
      refunded: string
    }
  }
}

export function OrderConfirmationClient({
  order: initialOrder,
  orderId,
  translations: t,
}: OrderConfirmationClientProps) {
  const [order, setOrder] = useState(initialOrder)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)

  const handleRefreshStatus = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.order) {
          setOrder(data.order)
        }
      }
    } catch (error) {
      console.error('Failed to refresh order status:', error)
    } finally {
      setIsRefreshing(false)
      setRefreshCount((prev) => prev + 1)
    }
  }, [orderId])

  // Auto-refresh payment status a few times if payment is pending
  useEffect(() => {
    if (
      (order.paymentStatus === 'pending' || order.paymentStatus === 'failed') &&
      refreshCount < 5
    ) {
      const timer = setTimeout(() => {
        handleRefreshStatus()
      }, 3000) // Check every 3 seconds, up to 5 times

      return () => clearTimeout(timer)
    }
  }, [order.paymentStatus, refreshCount, handleRefreshStatus])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.orderConfirmed}</h1>
          <p className="text-gray-600">{t.thankYou}</p>

          {(order.paymentStatus === 'pending' || order.paymentStatus === 'failed') && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-700">
                {order.paymentStatus === 'failed' ? t.status.failed : t.paymentProcessing}
              </p>
              <button
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
                className="mt-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md transition-colors"
              >
                {isRefreshing ? t.checkingStatus : t.refreshStatus}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">{t.orderNumber}</p>
              <p className="font-medium">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.orderDate}</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.paymentStatus}</p>
              <p className="font-medium">{t.status[order.paymentStatus]}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t.orderStatus}</p>
              <p className="font-medium">{t.status[order.status]}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">{t.shippingAddress}</h2>
            <div className="text-gray-600">
              <p>
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.address1}</p>
              {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-2">{t.orderSummary}</h2>
            <OrderSummary
              items={order.items.map((item) => ({
                variant: item.variant,
                quantity: item.quantity,
                price: item.price,
                id: item.id,
              }))}
              subtotal={order.subtotal}
              shipping={order.shipping}
              tax={order.tax}
              total={order.total}
            />
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors"
          >
            {t.continueShopping}
          </Link>
        </div>
      </div>
    </div>
  )
}
