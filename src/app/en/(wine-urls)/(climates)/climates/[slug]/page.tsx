import ClimateTemplate from '@/components/Templates/ClimateTemplate'
import { notFound } from 'next/navigation'
import type { Climate } from '@butelkawineshop/types'

export default async function EnglishClimatePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params

  // Get the climate by slug to check if it exists
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/climates?${new URLSearchParams({
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

  const { docs: climates } = await res.json()

  if (!climates.length) {
    return notFound()
  }

  return (
    <ClimateTemplate
      slug={resolvedParams.slug}
      locale="en"
      initialData={climates[0] as Climate}
      searchParams={await searchParams}
    />
  )
}
