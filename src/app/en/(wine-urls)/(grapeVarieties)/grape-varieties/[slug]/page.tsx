import GrapeVarietyTemplate from '@/components/Templates/GrapeVarietyTemplate'
import { notFound } from 'next/navigation'
import type { GrapeVariety } from '@butelkawineshop/types'

export default async function EnglishGrapeVarietyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params

  // Get the grape variety by slug to check if it exists
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/grape-varieties?${new URLSearchParams({
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

  const { docs: grapeVarieties } = await res.json()

  if (!grapeVarieties.length) {
    return notFound()
  }

  return (
    <GrapeVarietyTemplate
      slug={resolvedParams.slug}
      locale="en"
      initialData={grapeVarieties[0] as GrapeVariety}
      searchParams={await searchParams}
    />
  )
}
