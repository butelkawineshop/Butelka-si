import TagTemplate from '@/components/Templates/TagTemplate'
import { notFound } from 'next/navigation'
import type { Tag } from '@butelkawineshop/types'

export default async function SlovenianTagPage({
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
    `${process.env.NEXT_PUBLIC_API_URL}/api/tags?${queryParams.toString()}`,
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
      locale="sl"
      initialData={tags[0] as Tag}
      searchParams={await searchParams}
    />
  )
}
