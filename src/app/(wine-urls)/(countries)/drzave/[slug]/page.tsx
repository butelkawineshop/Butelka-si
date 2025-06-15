import WineCountryTemplate from '@/components/Templates/WineCountryTemplate'
import { notFound } from 'next/navigation'
import type { WineCountry } from '@butelkawineshop/types'

export default async function SlovenianWineCountryPage({
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
    `${process.env.NEXT_PUBLIC_API_URL}/api/wine-countries?${queryParams.toString()}`,
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
      locale="sl"
      initialData={wineCountries[0] as WineCountry}
      searchParams={await searchParams}
    />
  )
}
