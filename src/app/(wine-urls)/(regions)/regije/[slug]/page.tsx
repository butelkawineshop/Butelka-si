import RegionTemplate from '@/components/Templates/RegionTemplate'
import { notFound } from 'next/navigation'
import type { Region } from '@butelkawineshop/types'

export default async function SlovenianRegionPage({
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
    `${process.env.NEXT_PUBLIC_API_URL}/api/regions?${queryParams.toString()}`,
    {
      next: { revalidate: 600 },
    }
  )

  if (!res.ok) {
    return notFound()
  }

  const { docs: regions } = await res.json()

  if (!regions.length) {
    return notFound()
  }

  return (
    <RegionTemplate
      slug={resolvedParams.slug}
      locale="sl"
      initialData={regions[0] as Region}
      searchParams={await searchParams}
    />
  )
}
