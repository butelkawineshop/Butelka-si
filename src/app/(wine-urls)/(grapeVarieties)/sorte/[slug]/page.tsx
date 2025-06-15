import GrapeVarietyTemplate from '@/components/Templates/GrapeVarietyTemplate'
import { notFound } from 'next/navigation'
import type { GrapeVariety } from '@butelkawineshop/types'

export default async function SlovenianGrapeVarietyPage({
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
    `${process.env.NEXT_PUBLIC_API_URL}/api/grape-varieties?${queryParams.toString()}`,
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
      locale="sl"
      initialData={grapeVarieties[0] as GrapeVariety}
      searchParams={await searchParams}
    />
  )
}
