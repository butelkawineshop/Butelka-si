import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { WineDetailWrapper } from '@/app/(wine-urls)/(shared)/wine-detail-wrapper'
import type { Wine } from '@butelkawineshop/types'

interface Props {
  params: Promise<{
    slug: string
  }>
}

export default async function EnglishWinePage({ params }: Props) {
  const { slug } = await params
  const headersList = await headers()
  const locale = (headersList.get('x-locale') || 'en') as 'sl' | 'en'

  // Get the wine by slug
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/wines?${new URLSearchParams({
      depth: '2',
      where: JSON.stringify({
        or: [
          { [`slug.${locale}`]: { equals: slug } },
          { [`slug.${locale === 'en' ? 'sl' : 'en'}`]: { equals: slug } },
        ],
      }),
    })}`,
    {
      next: { revalidate: 600 },
    }
  )

  if (!res.ok) {
    return notFound()
  }

  const { docs: wines } = await res.json()

  if (!wines.length) {
    return notFound()
  }

  const wine = wines[0] as Wine

  return <WineDetailWrapper wine={wine} language="en" />
}
