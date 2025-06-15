import AromaTemplate from '@/components/Templates/AromaTemplate'
import { notFound } from 'next/navigation'
import type { Aroma } from '@butelkawineshop/types'

export default async function EnglishAromaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params

  // Get the aroma by slug to check if it exists
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/aromas?${new URLSearchParams({
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

  const { docs: aromas } = await res.json()

  if (!aromas.length) {
    return notFound()
  }

  return (
    <AromaTemplate
      slug={resolvedParams.slug}
      locale="en"
      initialData={aromas[0] as Aroma}
      searchParams={await searchParams}
    />
  )
}
