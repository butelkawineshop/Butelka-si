'use client'

import type { WineVariant } from '@butelkawineshop/types'
import { IconColor } from '@/components/IconColor'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { useTranslations } from 'next-intl'
import { cn } from '@/utilities/ui'
import CollectionLink from '@/components/WineCard/components/CollectionLink'
import { detectLocaleFromPath } from '@/utilities/routeMappings'
import { usePathname } from 'next/navigation'

interface TastingNotesProps {
  variant: WineVariant
  showDescription?: boolean
  showAromas?: boolean
  page?: 1 | 2
}

type TastingNotePair = {
  key: string
  left: {
    key: string
    icon: string
    translationKey: string
  }
  right: {
    key: string
    icon: string
    translationKey: string
  }
}

const TASTING_NOTE_PAIRS: TastingNotePair[] = [
  {
    key: 'dry',
    left: { key: 'dry', icon: 'dry', translationKey: 'dry' },
    right: { key: 'dry', icon: 'sweetness', translationKey: 'sweet' },
  },
  {
    key: 'light',
    left: { key: 'light', icon: 'skinny', translationKey: 'light' },
    right: { key: 'light', icon: 'fat', translationKey: 'rich' },
  },
  {
    key: 'smooth',
    left: { key: 'smooth', icon: 'soft', translationKey: 'smooth' },
    right: { key: 'smooth', icon: 'sharp', translationKey: 'austere' },
  },
  {
    key: 'creamy',
    left: { key: 'creamy', icon: 'crisp', translationKey: 'crisp' },
    right: { key: 'creamy', icon: 'cream', translationKey: 'creamy' },
  },
  {
    key: 'alcohol',
    left: { key: 'alcohol', icon: 'water', translationKey: 'noAlcohol' },
    right: { key: 'alcohol', icon: 'alcohol', translationKey: 'highAlcohol' },
  },
  {
    key: 'ripe',
    left: { key: 'ripe', icon: 'fruit', translationKey: 'freshFruit' },
    right: { key: 'ripe', icon: 'jam', translationKey: 'ripeFruit' },
  },
  {
    key: 'oaky',
    left: { key: 'oaky', icon: 'steel', translationKey: 'noOak' },
    right: { key: 'oaky', icon: 'oak', translationKey: 'oaky' },
  },
  {
    key: 'complex',
    left: { key: 'complex', icon: 'simple', translationKey: 'simple' },
    right: { key: 'complex', icon: 'complex', translationKey: 'complex' },
  },
  {
    key: 'youthful',
    left: { key: 'youthful', icon: 'baby', translationKey: 'youthful' },
    right: { key: 'youthful', icon: 'old', translationKey: 'mature' },
  },
  {
    key: 'energetic',
    left: { key: 'energetic', icon: 'calm', translationKey: 'restrained' },
    right: { key: 'energetic', icon: 'energy', translationKey: 'energetic' },
  },
]

export function TastingNotes({
  variant,
  showDescription = false,
  showAromas = true,
  page = 1,
}: TastingNotesProps) {
  const t = useTranslations('tasting.notes')
  const d = useTranslations('tasting.descriptions')
  const pathname = usePathname()
  const language = detectLocaleFromPath(pathname)

  // Get the appropriate slice of pairs based on the page
  const startIndex = (page - 1) * 5
  const endIndex = startIndex + 5
  const currentPagePairs = TASTING_NOTE_PAIRS.slice(startIndex, endIndex)

  return (
    <div className={cn('bg-background flex flex-col w-full h-full pb-2 pt-2 gap-2 px-2')}>
      <div className="text-center px-4 text-xl font-accent font-bold">
        {page === 1 ? t('titlePage1') : t('titlePage2')}
      </div>
      <div className="grid grid-cols-1 gap-4 px-2 sm:px-0">
        {currentPagePairs.map(({ key, left, right }) => {
          const value =
            variant?.tasting?.tastingNotes?.[key as keyof typeof variant.tasting.tastingNotes] ?? 0
          // For alcohol, the max is 20 instead of 10
          const maxValue = key === 'alcohol' ? 20 : 10
          const percentage = (value / maxValue) * 100

          return (
            <Tooltip key={key} translationKey={`tasting.descriptions.${key}`}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-foreground/60">
                  <div className="flex items-center gap-2">
                    <IconColor name={left.icon} width={20} height={20} className="flex-shrink-0" />
                    <span>{t(left.translationKey)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{t(right.translationKey)}</span>
                    <IconColor name={right.icon} width={20} height={20} className="flex-shrink-0" />
                  </div>
                </div>
                <div className="h-2 w-full bg-other-bg/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {showDescription && (
                  <div className="flex justify-between text-xs text-foreground/60">
                    <span>{d(left.key)}</span>
                    <span>{d(right.key)}</span>
                  </div>
                )}
              </div>
            </Tooltip>
          )
        })}
      </div>
      {showAromas && page === 2 && (
        <div className="flex flex-wrap justify-center gap-1 text-xs text-foreground/60 px-4">
          {variant?.tasting?.aromas?.map((aroma, index) => {
            const aromaTitle = typeof aroma === 'number' ? String(aroma) : aroma.title
            const aromaSlug =
              typeof aroma === 'number'
                ? ''
                : aroma.slug && typeof aroma.slug === 'object'
                  ? aroma.slug[language]
                  : aroma.slug || ''
            return (
              <CollectionLink
                key={`aroma-bottom-${index}`}
                collection="aromas"
                showHashtag={true}
                title={aromaTitle || ''}
                slug={aromaSlug}
                language={language}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
