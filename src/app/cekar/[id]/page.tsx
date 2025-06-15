import { notFound } from 'next/navigation'
import { SharedCartView } from '@/components/Cart/SharedCartView'
import type { SharedCart } from '@butelkawineshop/types'

type Props = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SharedCartPage({ params }: Props) {
  const { id } = await params

  const queryParams = new URLSearchParams({
    where: JSON.stringify({
      shareId: {
        equals: id,
      },
    }),
    depth: '2',
  })

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/shared-carts?${queryParams.toString()}`,
    {
      next: { revalidate: 600 },
    }
  )

  if (!res.ok) {
    return notFound()
  }

  const { docs: sharedCarts } = await res.json()

  if (!sharedCarts.length) {
    return notFound()
  }

  const cart = sharedCarts[0] as SharedCart

  return <SharedCartView cart={cart} title="Shared Cart" />
}
