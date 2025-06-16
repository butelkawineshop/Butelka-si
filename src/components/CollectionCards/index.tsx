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
  currentPage?: number
  totalPages?: number
  totalItems?: number
}

export default function CollectionCards({
  items,
  collection,
  locale,
  showPagination = false,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
}: CollectionCardsProps) {
  const swiperRef = useRef<{ swiper: SwiperType }>(null)

  // Memoize the sorted items and groups together to avoid multiple recalculations
  const { sortedItems, grouped } = useMemo(() => {
    const sorted = [...items].sort((a, b) => a.title.localeCompare(b.title))
    const result: { label: string; items: CollectionItem[] }[] = []
    const totalItems = sorted.length
    const maxGroups = 5
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    const groupSize = Math.ceil(alphabet.length / Math.min(maxGroups, Math.ceil(totalItems / 5)))

    for (let i = 0; i < alphabet.length; i += groupSize) {
      const from = alphabet[i]
      const to = alphabet[Math.min(i + groupSize - 1, alphabet.length - 1)]
      if (!from || !to) continue

      const label = from === to ? from : `${from}-${to}`

      const groupItems = sorted.filter((item) => {
        if (!item.slug) return false
        const slugValue = typeof item.slug === 'object' ? item.slug[locale] : item.slug
        if (!slugValue) return false
        const firstChar = slugValue[0]?.toUpperCase() || ''
        return firstChar >= from && firstChar <= to
      })

      if (groupItems.length) result.push({ label, items: groupItems })
    }

    return { sortedItems: sorted, grouped: result }
  }, [items, locale])

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
                className="group relative aspect-square bg-gradient-hero overflow-hidden block h-full"
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
                      priority={index < 5}
                      loading={index < 5 ? 'eager' : 'lazy'}
                    />
                  )}
                <div className="absolute inset-0 group-hover:bg-black/0 transition-colors duration-300" />
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
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex flex-wrap gap-2 justify-center w-full items-center">
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
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const prevPage = currentPage - 1
                  if (prevPage >= 1) {
                    window.location.href = `?page=${prevPage}`
                  }
                }}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => {
                  const nextPage = currentPage + 1
                  if (nextPage <= totalPages) {
                    window.location.href = `?page=${nextPage}`
                  }
                }}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
