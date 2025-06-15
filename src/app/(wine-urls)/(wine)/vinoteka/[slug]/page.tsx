import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { WineDetailWrapper } from '@/app/(wine-urls)/(shared)/wine-detail-wrapper'
import type { Wine } from '@butelkawineshop/types'

interface Props {
  params: Promise<{
    slug: string
  }>
}

export default async function SlovenianWinePage({ params }: Props) {
  const { slug } = await params
  const headersList = await headers()
  const locale = (headersList.get('x-locale') || 'sl') as 'sl' | 'en'

  const queryParams = new URLSearchParams({
    where: JSON.stringify({
      or: [
        { [`slug.${locale}`]: { equals: slug } },
        { [`slug.${locale === 'en' ? 'sl' : 'en'}`]: { equals: slug } },
      ],
    }),
    depth: '2',
    locale: 'undefined',
    fallbackLocale: 'undefined',
  })

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/wines?${queryParams.toString()}`,
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

  return <WineDetailWrapper wine={wine} language="sl" />
}
