import type { ActiveCart } from '@butelkawineshop/types'
import { routeMappings } from '@/utilities/routeMappings'

type CartItem = NonNullable<ActiveCart['items']>[number]

export async function createSharedCart(items: CartItem[]) {
  const shareId = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shared-carts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      shareId,
      items,
      expiresAt,
    }),
  })

  if (!res.ok) {
    throw new Error('Failed to create shared cart')
  }

  const sharedCart = await res.json()

  return {
    shareId: sharedCart.shareId,
    shareUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/${routeMappings.cekar.sl}/${sharedCart.shareId}`,
  }
}
