import WineryTemplate from '@/components/Templates/WineryTemplate'
import { notFound } from 'next/navigation'
import type { Winery } from '@butelkawineshop/types'

export default async function EnglishWineryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params

  // Get the winery by slug to check if it exists
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/wineries?${new URLSearchParams({
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

  const { docs: wineries } = await res.json()

  if (!wineries.length) {
    return notFound()
  }

  return (
    <WineryTemplate
      slug={resolvedParams.slug}
      locale="en"
      initialData={wineries[0] as Winery}
      searchParams={await searchParams}
    />
  )
}
