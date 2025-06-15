import Stripe from 'stripe'
import type { Order } from '@butelkawineshop/types'

// Define types for cart items and where clause
type CartItem = {
  id: string;
  quantity: number;
  // Add other fields as needed
};

type WhereClause = {
  or?: Array<{
    user?: { equals: string };
    sessionId?: { equals: string };
  }>;
};

// Define a type for the data passed to payload.update
type UpdateData = {
  paymentIntentId?: string;
  paymentStatus?: string;
  status?: string;
  notes?: string;
  items?: CartItem[];
  updatedAt?: string;
};

// Define a minimal Payload type for this file
type Payload = {
  findByID: (args: { collection: string; id: string }) => Promise<Order | null>;
  update: (args: { collection: string; id: string; data: UpdateData }) => Promise<Order>;
  find: (args: { collection: string; where: WhereClause }) => Promise<{ docs: Array<{ id: string }> }>;
};

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil', // Use the latest stable version
})

export const createStripePaymentIntent = async (
  payload: Payload,
  orderId: string,
): Promise<{ success: boolean; clientSecret?: string; message?: string }> => {
  try {
    // Get the order
    const order = (await payload.findByID({
      collection: 'orders',
      id: orderId,
    })) as Order

    if (!order) {
      return {
        success: false,
        message: 'Order not found',
      }
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'eur', // You can make this configurable
      metadata: {
        orderId: order.id.toString(),
        orderNumber: order.orderNumber,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Update the order with the payment intent ID
    await payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        paymentIntentId: paymentIntent.id,
      },
    })

    if (!paymentIntent.client_secret) {
      return {
        success: false,
        message: 'Failed to create payment intent: No client secret returned',
      }
    }

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create payment intent',
    }
  }
}

export const handleStripeWebhook = async (
  payload: Payload,
  event: Stripe.Event,
): Promise<{ success: boolean; message?: string }> => {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata.orderId

        if (!orderId) {
          return {
            success: false,
            message: 'No order ID found in payment intent metadata',
          }
        }

        // Get the order to find the customer
        const order = await payload.findByID({
          collection: 'orders',
          id: orderId,
        })

        if (!order) {
          return {
            success: false,
            message: 'Order not found',
          }
        }

        // Update order status regardless of previous payment status
        await payload.update({
          collection: 'orders',
          id: orderId,
          data: {
            paymentStatus: 'paid',
            status: 'processing',
            notes: order.paymentStatus === 'failed'
              ? 'Payment succeeded after previous failure'
              : order.notes || undefined,
          },
        })

        // Find and clear the active cart
        const activeCarts = await payload.find({
          collection: 'active-carts',
          where: {
            or: [
              // For logged-in users
              {
                user: {
                  equals: String(order.customer),
                },
              },
              // For guest users
              {
                sessionId: {
                  equals: String(order.sessionId),
                },
              },
            ],
          },
        })

        // Clear all matching carts
        if (activeCarts.docs.length > 0) {
          await Promise.all(
            activeCarts.docs.map((cart: { id: string }) =>
              payload.update({
                collection: 'active-carts',
                id: cart.id,
                data: {
                  items: [],
                  updatedAt: new Date().toISOString(),
                },
              }),
            ),
          )
        }

        return { success: true }
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = paymentIntent.metadata.orderId

        if (!orderId) {
          return {
            success: false,
            message: 'No order ID found in payment intent metadata',
          }
        }

        // Update order status
        await payload.update({
          collection: 'orders',
          id: orderId,
          data: {
            paymentStatus: 'failed',
            notes: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
          },
        })

        return { success: true }
      }

      default:
        return {
          success: true,
          message: `Unhandled event type: ${event.type}`,
        }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to handle webhook',
    }
  }
}
