import RegionTemplate from '@/components/Templates/RegionTemplate'
import { notFound } from 'next/navigation'
import type { Region } from '@butelkawineshop/types'

export default async function EnglishRegionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params

  // Get the region by slug to check if it exists
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/regions?${new URLSearchParams({
      depth: '4',
      locale: 'en',
      where: JSON.stringify({
        'slug.en': { equals: resolvedParams.slug },
      }),
    })}`,
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
      locale="en"
      initialData={regions[0] as Region}
      searchParams={await searchParams}
    />
  )
}
