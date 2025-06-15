'use client'

import type { WineVariant } from '@butelkawineshop/types'
import WineCard from './WineCard'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

interface Props {
  initialVariants: WineVariant[]
}

export default function WineGridClient({ initialVariants }: Props) {
  const t = useTranslations()
  // Set visibleCount based on device width, default to 8 for SSR
  const [visibleCount, setVisibleCount] = useState(
    typeof window !== 'undefined' && window.innerWidth < 640 ? 4 : 8,
  )
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // On mount, update visibleCount for client-side width
    function updateVisibleCount() {
      setVisibleCount(window.innerWidth < 640 ? 4 : 8)
    }
    updateVisibleCount()
    window.addEventListener('resize', updateVisibleCount)
    return () => window.removeEventListener('resize', updateVisibleCount)
  }, [])

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries?.[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 8, initialVariants.length))
        }
      },
      { threshold: 1 },
    )
    const node = loadMoreRef.current
    if (node) observer.observe(node)
    return () => {
      if (node) observer.unobserve(node)
      observer.disconnect()
    }
  }, [initialVariants.length])

  const visibleVariants = initialVariants.slice(0, visibleCount)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-center">
      {visibleVariants.map((variant: WineVariant) => (
        <div key={variant.id} className="w-full h-full">
          <WineCard variant={variant} />
        </div>
      ))}
      {initialVariants.length === 0 && (
        <div className="col-span-full h-20 flex items-center justify-center">
          <p className="text-gray-500">{t('noWinesFound')}</p>
        </div>
      )}
      {visibleCount < initialVariants.length && (
        <div ref={loadMoreRef} className="col-span-full h-10" aria-hidden="true" />
      )}
    </div>
  )
}
