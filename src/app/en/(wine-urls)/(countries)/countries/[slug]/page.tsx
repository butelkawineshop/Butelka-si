import WineCountryTemplate from '@/components/Templates/WineCountryTemplate'
import { notFound } from 'next/navigation'
import type { WineCountry } from '@butelkawineshop/types'

export default async function EnglishWineCountryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params

  // Get the wine country by slug to check if it exists
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/wineCountries?${new URLSearchParams({
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

  const { docs: wineCountries } = await res.json()

  if (!wineCountries.length) {
    return notFound()
  }

  return (
    <WineCountryTemplate
      slug={resolvedParams.slug}
      locale="en"
      initialData={wineCountries[0] as WineCountry}
      searchParams={await searchParams}
    />
  )
}
