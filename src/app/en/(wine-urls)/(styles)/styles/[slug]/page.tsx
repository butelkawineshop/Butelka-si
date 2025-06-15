import StyleTemplate from '@/components/Templates/StyleTemplate'
import { notFound } from 'next/navigation'
import type { Style } from '@butelkawineshop/types'

export default async function EnglishStylePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params

  // Get the style by slug to check if it exists
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/styles?${new URLSearchParams({
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

  const { docs: styles } = await res.json()

  if (!styles.length) {
    return notFound()
  }

  return (
    <StyleTemplate
      slug={resolvedParams.slug}
      locale="en"
      initialData={styles[0] as Style}
      searchParams={await searchParams}
    />
  )
}
