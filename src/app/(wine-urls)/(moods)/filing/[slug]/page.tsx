import MoodTemplate from '@/components/Templates/MoodTemplate'
import { notFound } from 'next/navigation'
import type { Mood } from '@butelkawineshop/types'

export default async function SlovenianMoodPage({
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
    `${process.env.NEXT_PUBLIC_API_URL}/api/moods?${queryParams.toString()}`,
    {
      next: { revalidate: 600 },
    }
  )

  if (!res.ok) {
    return notFound()
  }

  const { docs: moods } = await res.json()

  if (!moods.length) {
    return notFound()
  }

  return (
    <MoodTemplate
      slug={resolvedParams.slug}
      locale="sl"
      initialData={moods[0] as Mood}
      searchParams={await searchParams}
    />
  )
}
