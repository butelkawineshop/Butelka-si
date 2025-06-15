'use client'

import { useMemo, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
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
  const [isNavigating, setIsNavigating] = useState(false)

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

  const handleNavigation = (_href: string) => {
    if (isNavigating) return
    setIsNavigating(true)
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 500)
  }

  return (
    <div className="space-y-2 w-full items-center justify-center relative">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />
      <Swiper
        centeredSlides={true}
        slideToClickedSlide={true}
        initialSlide={activeIndex}
        spaceBetween={0}
        breakpoints={{
          320: { slidesPerView: 3 },
          480: { slidesPerView: 3 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
          1280: { slidesPerView: 5 },
        }}
        className="w-full flex flex-row"
      >
        {sortedItems.map((item, index) => (
          <SwiperSlide key={`${item.href}-${index}`} className="w-auto flex flex-row">
            <Link
              href={item.href}
              onClick={() => handleNavigation(item.href)}
              className={`group flex flex-row overflow-hidden h-full items-center justify-center text-center ${
                pathname.startsWith(item.href) ? 'text-foreground font-bold' : 'text-foreground/50'
              } ${isNavigating ? 'pointer-events-none opacity-50' : ''}`}
            >
              <div className="text-center p-1 px-4 w-full text-3xl font-accent">
                {t(item.title)}
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
