import MoodTemplate from '@/components/Templates/MoodTemplate'
import { notFound } from 'next/navigation'
import type { Mood } from '@butelkawineshop/types'

export default async function EnglishMoodPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params

  // Get the mood by slug to check if it exists
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/moods?${new URLSearchParams({
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

  const { docs: moods } = await res.json()

  if (!moods.length) {
    return notFound()
  }

  return (
    <MoodTemplate
      slug={resolvedParams.slug}
      locale="en"
      initialData={moods[0] as Mood}
      searchParams={await searchParams}
    />
  )
}
