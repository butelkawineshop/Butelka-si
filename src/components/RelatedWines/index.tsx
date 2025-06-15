'use client'

import type { Wine, WineVariant, Winery, Region, GrapeVariety } from '@butelkawineshop/types'
import WineCard from '@/components/WineCard/WineCard'
import { useTranslations } from 'next-intl'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCards } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-cards'

interface RelatedWinesProps {
  currentWine: Wine
  currentVariant: WineVariant
  allWines: Wine[]
}

type RelationType = 'winery' | 'region' | 'grapeVariety' | 'price'

interface RelatedWineGroup {
  type: RelationType
  title: string
  wines: Wine[]
}

function pickBestVariant(
  variants: (WineVariant | number)[] | undefined,
  currentPrice: number,
  currentVariantId?: number,
): WineVariant | null {
  if (!variants || variants.length === 0) return null

  return variants
    .filter(
      (v): v is WineVariant =>
        typeof v !== 'number' && !!v.details?.price && !!v.slug && v.id !== currentVariantId,
    )
    .reduce<WineVariant | null>((best, curr) => {
      if (!best) return curr
      const currDiff = Math.abs(curr.details.price - currentPrice)
      const bestDiff = Math.abs(best.details.price - currentPrice)
      return currDiff < bestDiff ? curr : best
    }, null)
}

export function RelatedWines({ currentWine, currentVariant, allWines }: RelatedWinesProps) {
  const t = useTranslations('wine.detail')

  const getRelatedBy = {
    winery: (): Wine[] => {
      if (!currentWine.winery || typeof currentWine.winery === 'number') return []
      return allWines.filter((wine) => {
        if (!wine.winery || typeof wine.winery === 'number') return false
        const winery = currentWine.winery as Winery
        const wineWinery = wine.winery as Winery
        return (
          wineWinery.id === winery.id ||
          (winery.social?.relatedWineries || []).some(
            (rw) => (typeof rw === 'object' ? rw.id : rw) === wineWinery.id,
          )
        )
      })
    },
    region: (): Wine[] => {
      if (!currentWine.region || typeof currentWine.region === 'number') return []
      const region = currentWine.region as Region
      const regionId = region.id
      const relatedRegionIds = new Set<number>()

      if (region.general?.neighbours) {
        region.general.neighbours.forEach((relatedRegion) => {
          if (typeof relatedRegion === 'number') {
            relatedRegionIds.add(relatedRegion)
          } else if (relatedRegion && typeof relatedRegion === 'object') {
            relatedRegionIds.add(relatedRegion.id)
          }
        })
      }

      return allWines.filter((wine) => {
        if (!wine.region || typeof wine.region === 'number') return false
        const wineRegionId = (wine.region as Region).id
        return wineRegionId === regionId || relatedRegionIds.has(wineRegionId)
      })
    },
    grapeVariety: (): Wine[] => {
      const currentGrapes =
        currentVariant.composition?.grapeVarieties
          ?.filter((gv) => typeof gv !== 'number' && typeof gv.variety !== 'number')
          .map((gv) => {
            const variety = gv.variety as GrapeVariety
            const relatedIds = new Set<number>()

            // Add related varieties
            variety.relationships?.similarVarieties?.forEach((rv) => {
              if (typeof rv === 'number') {
                relatedIds.add(rv)
              } else if (rv && typeof rv === 'object') {
                relatedIds.add(rv.id)
              }
            })

            // Add style compatible varieties
            variety.relationships?.similarVarieties?.forEach((sc) => {
              if (typeof sc === 'number') {
                relatedIds.add(sc)
              } else if (sc && typeof sc === 'object') {
                relatedIds.add(sc.id)
              }
            })

            return {
              id: variety.id,
              relatedIds: Array.from(relatedIds),
              percentage: gv.percentage || 0,
            }
          }) || []

      return allWines.filter((wine) => {
        if (wine.id === currentWine.id) return false
        return wine.variants?.docs?.some((v) => {
          if (typeof v === 'number') return false
          const grapes = v.composition?.grapeVarieties || []
          return grapes.some(
            (gv) =>
              typeof gv !== 'number' &&
              typeof gv.variety !== 'number' &&
              currentGrapes.some(
                (cg) =>
                  cg.id === (gv.variety as GrapeVariety).id ||
                  cg.relatedIds.includes((gv.variety as GrapeVariety).id),
              ),
          )
        })
      })
    },
    price: (): Wine[] => {
      const currentPrice = currentVariant?.details?.price || 0
      const min = currentPrice * 0.8
      const max = currentPrice * 1.2
      return allWines.filter((wine) => {
        if (wine.id === currentWine.id) return false
        const variants = (wine.variants?.docs || []).filter(
          (v): v is WineVariant => typeof v !== 'number',
        )
        return variants.some(
          (v) => (v.details?.price || 0) >= min && (v.details?.price || 0) <= max,
        )
      })
    },
  }

  const seenWineIds = new Set<number>()

  const filteredGroups: RelatedWineGroup[] = []

  const priorityOrder: RelationType[] = ['winery', 'region', 'grapeVariety', 'price']

  // First pass: collect all wines for each type
  const winesByType = priorityOrder.reduce(
    (acc, type) => {
      acc[type] = getRelatedBy[type]()
      return acc
    },
    {} as Record<RelationType, Wine[]>,
  )

  // Second pass: apply style-based prioritization
  priorityOrder.forEach((type) => {
    const wines = winesByType[type].filter((wine) => {
      // Skip if already included in a higher priority group
      if (seenWineIds.has(wine.id)) return false

      // Special handling for region and grape variety overlap
      if (type === 'region') {
        const isInGrapeVariety = winesByType.grapeVariety.some((w) => w.id === wine.id)
        if (isInGrapeVariety) {
          // If wine is in both region and grape variety, check style match
          const styleMatches = wine.style === currentWine.style
          if (!styleMatches) return false // Skip from region if style doesn't match
        }
      }

      // Special handling for grape variety and price overlap
      if (type === 'grapeVariety') {
        const isInPrice = winesByType.price.some((w) => w.id === wine.id)
        if (isInPrice) {
          // If wine is in both grape variety and price, check style match
          const styleMatches = wine.style === currentWine.style
          if (!styleMatches) return false // Skip from grape variety if style doesn't match
        }
      }

      seenWineIds.add(wine.id)
      return true
    })

    // Limit the number of wines per group
    const MAX_WINES_PER_GROUP = 5
    const limitedWines = wines.slice(0, MAX_WINES_PER_GROUP)

    if (limitedWines.length > 0) {
      filteredGroups.push({
        type,
        title: t(
          type === 'winery'
            ? 'relatedByWinery'
            : type === 'region'
              ? 'relatedByRegion'
              : type === 'grapeVariety'
                ? 'relatedByGrapeVariety'
                : 'relatedByPrice',
        ),
        wines: limitedWines,
      })
    }
  })

  if (filteredGroups.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-accent mb-8">{t('relatedWines')}</h2>
        <p className="text-muted">
          {t(
            currentWine.winery && typeof currentWine.winery !== 'number'
              ? 'noRelatedByWinery'
              : currentWine.region && typeof currentWine.region !== 'number'
                ? 'noRelatedByRegion'
                : currentVariant.composition?.grapeVarieties?.length
                  ? 'noRelatedByGrapeVariety'
                  : 'noRelatedByPrice',
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-accent mb-8">{t('relatedWines')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredGroups.map((group) => (
          <div key={`${group.type}-${group.title}`} className="">
            <h3 className="text-lg font-accent mb-4">{group.title}</h3>
            <div className="relative h-auto">
              <Swiper
                effect="cards"
                grabCursor={true}
                modules={[EffectCards]}
                cardsEffect={{
                  perSlideOffset: 7,
                  perSlideRotate: 1,
                  rotate: true,
                  slideShadows: true,
                }}
                className="h-full"
              >
                {group.wines.map((wine, wineIndex) => {
                  const variant =
                    pickBestVariant(
                      wine?.variants?.docs,
                      currentVariant?.details?.price || 0,
                      currentVariant.id,
                    ) ||
                    (wine?.variants?.docs?.[0] && typeof wine.variants.docs[0] !== 'number'
                      ? wine.variants.docs[0]
                      : null)

                  if (!variant) return null

                  return (
                    <SwiperSlide
                      key={`${group.type}-${wine.id}-${wineIndex}`}
                      className="border border-border rounded-lg overflow-hidden"
                    >
                      <WineCard variant={variant} />
                    </SwiperSlide>
                  )
                })}
              </Swiper>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
