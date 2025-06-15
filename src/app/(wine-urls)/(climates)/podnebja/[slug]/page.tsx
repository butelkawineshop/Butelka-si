import ClimateTemplate from '@/components/Templates/ClimateTemplate'
import { notFound } from 'next/navigation'
import type { Climate } from '@butelkawineshop/types'

export default async function SlovenianClimatePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params

  const queryParams = new URLSearchParams({
    where: JSON.stringify({
      [`slug.sl`]: {
        equals: resolvedParams.slug,
      },
    }),
    depth: '4',
    locale: 'sl',
  })

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/climates?${queryParams.toString()}`,
    {
      next: { revalidate: 600 },
    }
  )

  if (!res.ok) {
    return notFound()
  }

  const { docs: climates } = await res.json()

  if (!climates.length) {
    return notFound()
  }

  return (
    <ClimateTemplate
      slug={resolvedParams.slug}
      locale="sl"
      initialData={climates[0] as Climate}
      searchParams={await searchParams}
    />
  )
}
