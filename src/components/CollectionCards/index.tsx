'use client'

import { useMemo, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import CollectionLink from '@/components/WineCard/components/CollectionLink'
import Image from 'next/image'
import type { Media } from '@butelkawineshop/types'
import type { Locale } from '@/utilities/routeMappings'

interface CollectionItem {
  id: string | number
  title: string
  slug?: string | { [key in Locale]?: string } | null
  media?: {
    media?: Media | number | null
  } | null
}

interface CollectionCardsProps {
  items: CollectionItem[]
  collection: string
  locale: Locale
  showPagination?: boolean
}

export default function CollectionCards({
  items,
  collection,
  locale,
  showPagination = false,
}: CollectionCardsProps) {
  const swiperRef = useRef<{ swiper: SwiperType }>(null)

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.title.localeCompare(b.title))
  }, [items])

  const grouped = useMemo(() => {
    const result: { label: string; items: CollectionItem[] }[] = []
    const totalItems = sortedItems.length
    const maxGroups = 5
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

    // Dynamically determine group size based on item count, but max 5 groups
    const groupSize = Math.ceil(alphabet.length / Math.min(maxGroups, Math.ceil(totalItems / 5)))

    for (let i = 0; i < alphabet.length; i += groupSize) {
      const from = alphabet[i]
      const to = alphabet[Math.min(i + groupSize - 1, alphabet.length - 1)]
      if (!from || !to) continue

      const label = from === to ? from : `${from}-${to}`

      const groupItems = sortedItems.filter((item) => {
        if (!item.slug) return false
        const slugValue = typeof item.slug === 'object' ? item.slug[locale] : item.slug
        if (!slugValue) return false
        const firstChar = slugValue[0]?.toUpperCase() || ''
        return firstChar >= from && firstChar <= to
      })

      if (groupItems.length) result.push({ label, items: groupItems })
    }

    return result
  }, [sortedItems, locale])

  const allItems = useMemo(() => grouped.flatMap((g) => g.items), [grouped])

  return (
    <div>
      <Swiper
        ref={swiperRef}
        modules={[Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={5}
        breakpoints={{
          320: {
            slidesPerView: 1,
          },
          480: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 3,
          },
          1024: {
            slidesPerView: 4,
          },
          1280: {
            slidesPerView: 5,
          },
        }}
        className="w-full"
      >
        {allItems.map((item, index) => {
          const itemSlug =
            item.slug && typeof item.slug === 'object' ? item.slug[locale] : item.slug

          return (
            <SwiperSlide key={`${item.id}-${index}`} className="w-full">
              <CollectionLink
                collection={collection}
                title={item.title}
                slug={itemSlug || item.title.toLowerCase().replace(/\s+/g, '-')}
                language={locale}
                className="group relative aspect-square  bg-gradient-hero overflow-hidden block h-full"
              >
                {item.media?.media &&
                  typeof item.media.media === 'object' &&
                  item.media.media.url && (
                    <Image
                      src={item.media.media.url}
                      alt={item.media.media.alt || `${item.title} image`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-60 group-hover:opacity-100"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                      priority
                    />
                  )}
                <div className="absolute inset-0  group-hover:bg-black/0 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-center text-lg font-bold text-white p-1 w-full drop-shadow-lg group-hover:scale-115 transition-scale duration-300">
                    {item.title}
                  </h3>
                </div>
              </CollectionLink>
            </SwiperSlide>
          )
        })}
      </Swiper>
      {showPagination && (
        <Swiper
          className="my-4 flex flex-wrap gap-2 justify-center w-full items-center"
          centeredSlides={true}
          spaceBetween={0}
          slideToClickedSlide={true}
          slidesPerView={3}
        >
          <SwiperSlide className="w-full flex flex-row items-center  justify-center text-center">
            {grouped.map((g) => {
              const firstItem = g.items[0]
              if (!firstItem) return null

              const index = allItems.findIndex((i) => i.id === firstItem.id)
              if (index === -1) return null

              return (
                <button
                  key={g.label}
                  className="px-3 py-1 text-sm text-foreground/80 hover:scale-110 font-bold transition-all duration-300 active:scale-95 cursor-pointer"
                  onClick={() => {
                    swiperRef.current?.swiper?.slideTo(index)
                  }}
                >
                  {g.label}
                </button>
              )
            })}
          </SwiperSlide>
        </Swiper>
      )}
    </div>
  )
}
