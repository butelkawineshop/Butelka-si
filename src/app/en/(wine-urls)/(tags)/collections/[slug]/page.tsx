import TagTemplate from '@/components/Templates/TagTemplate'
import { notFound } from 'next/navigation'
import type { Tag } from '@butelkawineshop/types'

export default async function EnglishTagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params

  // Get the tag by slug to check if it exists
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/tags?${new URLSearchParams({
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

  const { docs: tags } = await res.json()

  if (!tags.length) {
    return notFound()
  }

  return (
    <TagTemplate
      slug={resolvedParams.slug}
      locale="en"
      initialData={tags[0] as Tag}
      searchParams={await searchParams}
    />
  )
}
