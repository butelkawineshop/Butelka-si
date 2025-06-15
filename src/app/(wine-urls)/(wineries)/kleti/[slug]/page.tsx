import WineryTemplate from '@/components/Templates/WineryTemplate'
import { notFound } from 'next/navigation'
import type { Winery } from '@butelkawineshop/types'

export default async function SlovenianWineryPage({
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
    `${process.env.NEXT_PUBLIC_API_URL}/api/wineries?${queryParams.toString()}`,
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
      locale="sl"
      initialData={wineries[0] as Winery}
      searchParams={await searchParams}
    />
  )
}
