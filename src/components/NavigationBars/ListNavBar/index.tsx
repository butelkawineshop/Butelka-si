'use client'

import { useMemo } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface ListNavBarProps {
  items: {
    title: string
    href: string
  }[]
}

// Define the order of navigation items
const navigationOrder = [
  'wineshop',
  'styles',
  'countries',
  'regions',
  'wineries',
  'moods',
  'collections',
  'grapeVarieties',
  'dishes',
  'climates',
  'aromas',
]

export default function ListNavBar({ items }: ListNavBarProps) {
  const pathname = usePathname()
  const t = useTranslations('navigation')

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const indexA = navigationOrder.indexOf(a.title)
      const indexB = navigationOrder.indexOf(b.title)
      return indexA - indexB
    })
  }, [items])

  const activeIndex = useMemo(() => {
    return sortedItems.findIndex((item) => pathname.startsWith(item.href))
  }, [sortedItems, pathname])

  return (
    <div className="w-full relative">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />
      <Swiper
        modules={[Navigation, Pagination]}
        centeredSlides={true}
        slideToClickedSlide={true}
        initialSlide={activeIndex}
        spaceBetween={10}
        slidesPerView="auto"
        className="w-full"
      >
        {sortedItems.map((item, index) => (
          <SwiperSlide key={`${item.href}-${index}`} className="!w-auto">
            <Link
              href={item.href}
              className={`group flex items-center justify-center text-center px-4 py-2 ${
                pathname.startsWith(item.href) ? 'text-foreground font-bold' : 'text-foreground/50'
              }`}
            >
              <div className="text-center text-2xl font-accent whitespace-nowrap">
                {t(item.title)}
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
