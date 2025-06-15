import StyleTemplate from '@/components/Templates/StyleTemplate'
import { notFound } from 'next/navigation'
import type { Style } from '@butelkawineshop/types'

export default async function SlovenianStylePage({
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
    `${process.env.NEXT_PUBLIC_API_URL}/api/styles?${queryParams.toString()}`,
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
      locale="sl"
      initialData={styles[0] as Style}
      searchParams={await searchParams}
    />
  )
}
