import FoodTemplate from '@/components/Templates/FoodTemplate'
import { notFound } from 'next/navigation'
import type { Food } from '@butelkawineshop/types'

export default async function SlovenianFoodPage({
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
    `${process.env.NEXT_PUBLIC_API_URL}/api/foods?${queryParams.toString()}`,
    {
      next: { revalidate: 600 },
    }
  )

  if (!res.ok) {
    return notFound()
  }

  const { docs: foods } = await res.json()

  if (!foods.length) {
    return notFound()
  }

  return (
    <FoodTemplate
      slug={resolvedParams.slug}
      locale="sl"
      initialData={foods[0] as Food}
      searchParams={await searchParams}
    />
  )
}
