import FoodTemplate from '@/components/Templates/FoodTemplate'
import { notFound } from 'next/navigation'
import type { Food } from '@butelkawineshop/types'

export default async function EnglishFoodPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params

  // Get the food by slug to check if it exists
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/foods?${new URLSearchParams({
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

  const { docs: foods } = await res.json()

  if (!foods.length) {
    return notFound()
  }

  return (
    <FoodTemplate
      slug={resolvedParams.slug}
      locale="en"
      initialData={foods[0] as Food}
      searchParams={await searchParams}
    />
  )
}
