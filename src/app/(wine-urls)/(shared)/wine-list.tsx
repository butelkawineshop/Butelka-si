import { FilterSortBar } from '@/components/FilterSortBar'
import 'swiper/css'
import 'swiper/css/effect-cards'
import ContentSlideshow from '@/components/ContentSlideshow'
import type { Slideshow } from '@butelkawineshop/types'
import { headers } from 'next/headers'
import type { Locale } from '@/utilities/routeMappings'

type Props = {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function WineList({ searchParams }: Props) {
  const headersList = await headers()
  const resolvedLocale = (headersList.get('x-locale') || 'sl') as Locale

  const queryParams = new URLSearchParams({
    depth: '2',
    locale: resolvedLocale,
    fallbackLocale: resolvedLocale === 'en' ? 'sl' : 'en',
    draft: 'false',
    where: JSON.stringify({
      key: {
        equals: 'wine-shop',
      },
      _status: {
        equals: 'published'
      }
    })
  })

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/slideshows?${queryParams.toString()}`,
    {
      next: { revalidate: 600 },
    }
  )

  if (!res.ok) {
    return null
  }

  const { docs: slideshows } = await res.json()
  const slideshow = slideshows[0] as Slideshow | undefined

  return (
    <div className="grid grid-cols-1 gap-12 p-12">
      <div className="w-full h-full">
        {slideshow?.slides && <ContentSlideshow slides={slideshow.slides} />}
      </div>

      {/* Wine Grid */}
      <div className="space-y-8">
        <FilterSortBar searchParams={searchParams} />
      </div>
    </div>
  )
}
