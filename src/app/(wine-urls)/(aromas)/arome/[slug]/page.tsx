import AromaTemplate from '@/components/Templates/AromaTemplate'
import { notFound } from 'next/navigation'
import type { Aroma } from '@butelkawineshop/types'

export default async function SlovenianAromaPage({
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
    `${process.env.NEXT_PUBLIC_API_URL}/api/aromas?${queryParams.toString()}`,
    {
      next: { revalidate: 600 },
    }
  )

  if (!res.ok) {
    return notFound()
  }

  const { docs: aromas } = await res.json()

  if (!aromas.length) {
    return notFound()
  }

  return (
    <AromaTemplate
      slug={resolvedParams.slug}
      locale="sl"
      initialData={aromas[0] as Aroma}
      searchParams={await searchParams}
    />
  )
}
