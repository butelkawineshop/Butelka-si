import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Locale } from '@/utilities/routeMappings'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingState } from '@/components/LoadingState'
import { Suspense } from 'react'
import type { GrapeVariety, Media, Aroma, Region } from '@butelkawineshop/types'
import { getTranslations } from 'next-intl/server'
import { DetailSlideshow } from '@/components/DetailSlideshow'
import CollectionLink from '@/components/WineCard/components/CollectionLink'
import { FilterSortBar } from '@/components/FilterSortBar'

interface Props {
  slug: string
  locale?: Locale
  initialData?: GrapeVariety
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}

export default async function GrapeVarietyTemplate({
  slug,
  locale,
  initialData,
  searchParams,
}: Props) {
  const headersList = await headers()
  const resolvedLocale = locale || ((headersList.get('x-locale') || 'sl') as Locale)
  const t = await getTranslations('grapeVariety')

  let item: GrapeVariety

  if (initialData) {
    item = initialData
  } else {
    const queryParams = new URLSearchParams({
      depth: '2',
      locale: resolvedLocale,
      fallbackLocale: resolvedLocale === 'en' ? 'sl' : 'en',
      where: JSON.stringify({
        or: [
          {
            [`slug.${resolvedLocale}`]: {
              equals: slug,
            },
          },
          {
            [`slug.${resolvedLocale === 'en' ? 'sl' : 'en'}`]: {
              equals: slug,
            },
          },
        ],
      }),
      select: JSON.stringify({
        title: true,
        general: {
          description: true,
          typicalStyle: true,
          whyCool: true,
          character: true,
          synonyms: true,
          skin: true,
        },
        relationships: {
          distinctiveAromas: true,
          bestRegions: true,
          blendingPartners: true,
          similarVarieties: true,
        },
        media: true,
      }),
    })

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/grape-varieties?${queryParams.toString()}`,
      {
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) {
      return notFound()
    }

    const { docs } = await res.json()
    if (!docs.length) {
      return notFound()
    }

    item = docs[0]
  }

  const getNextMedia = (
    media: (number | Media)[] | null | undefined,
    index: number,
  ): Media | null => {
    if (!media || !media.length) return null
    const mediaItem = media[index % media.length]
    return typeof mediaItem === 'object' && 'url' in mediaItem ? mediaItem : null
  }

  // Build where clause for wine grid
  const where = {
    'composition.grapeVarieties.variety': { equals: item.id },
  }

  // Add filters from search params
  if (searchParams) {
    const filterKeys = [
      'aromas',
      'climates',
      'foods',
      'grapeVarieties',
      'moods',
      'regions',
      'styles',
      'tags',
      'wineCountry',
      'winery',
    ]

    filterKeys.forEach((key) => {
      const value = searchParams[key]
      if (value) {
        if (Array.isArray(value)) {
          // @ts-expect-error: dynamic key assignment
          where[`wine.${key}`] = { in: value }
        } else {
          // @ts-expect-error: dynamic key assignment
          where[`wine.${key}`] = { equals: value }
        }
      }
    })

    // Handle price range
    if (searchParams.minPrice || searchParams.maxPrice) {
      // @ts-expect-error: dynamic key assignment
      where['details.price'] = {
        ...(searchParams.minPrice && { greater_than_equal: Number(searchParams.minPrice) }),
        ...(searchParams.maxPrice && { less_than_equal: Number(searchParams.maxPrice) }),
      }
    }

    // Handle tasting notes
    const tastingNotes = [
      'dry',
      'light',
      'smooth',
      'creamy',
      'alcohol',
      'ripe',
      'oaky',
      'complex',
      'youthful',
      'energetic',
    ]

    tastingNotes.forEach((note) => {
      const min = searchParams[`${note}Min`]
      const max = searchParams[`${note}Max`]
      if (min || max) {
        // @ts-expect-error: dynamic key assignment
        where[`tasting.${note}`] = {
          ...(min && { greater_than_equal: Number(min) }),
          ...(max && { less_than_equal: Number(max) }),
        }
      }
    })
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <div className="flex flex-col gap-8 sm:p-16" role="main" aria-label="Grape Variety Details">
          <DetailSlideshow
            title={item.title}
            media={item.media?.media || undefined}
            slides={[
              {
                content: (
                  <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                    <h2 className="text-4xl font-semibold font-accent">{item.title}</h2>
                    <p className="text-lg text-center max-w-2xl">{item.general?.description}</p>
                  </div>
                ),
                className: '',
                media: getNextMedia(item.media?.media, 0),
              },
              {
                content: (
                  <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                    <h2 className="text-4xl font-semibold font-accent">{t('style')}</h2>
                    <div className="flex flex-col gap-2 text-center max-w-2xl">
                      <p className="text-lg font-bold">
                        {t('skin')}:{' '}
                        {item.general?.skin === 'red' ? t('redGrape') : t('whiteGrape')}
                      </p>
                      <p className="text-lg">{item.general?.typicalStyle}</p>
                      <p className="text-lg">{item.general?.character}</p>

                      <div className="flex flex-col gap-2">
                        <h3 className="text-4xl font-accent mt-2">{t('distinctiveAromas')}</h3>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {item.relationships?.distinctiveAromas
                            ?.filter((a): a is Aroma => typeof a !== 'number')
                            .map((aroma, index) => (
                              <span key={index} className="text-lg">
                                {aroma.title}
                                {index <
                                (item.relationships?.distinctiveAromas?.filter(
                                  (a): a is Aroma => typeof a !== 'number',
                                ).length || 0) -
                                  1
                                  ? ', '
                                  : ''}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
                className: '',
                media: getNextMedia(item.media?.media, 1),
              },
              {
                content: (
                  <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                    <h2 className="text-4xl font-semibold font-accent">{t('synonyms')}</h2>
                    <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                      {item.general?.synonyms?.map((synonym, index) => (
                        <span key={index} className="text-lg">
                          {synonym.title}
                          {index < (item.general?.synonyms?.length || 0) - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                ),
                className: '',
                media: getNextMedia(item.media?.media, 2),
              },

              ...(item.relationships?.bestRegions || [])
                .filter((r): r is Region => typeof r !== 'number')
                .map((region, index) => ({
                  content: (
                    <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                      <h2 className="text-4xl font-semibold font-accent">{t('bestRegions')}</h2>
                      <CollectionLink
                        title={region.title || ''}
                        slug={
                          region.slug && typeof region.slug === 'object'
                            ? region.slug[resolvedLocale] || ''
                            : ''
                        }
                        collection="regions"
                        language={resolvedLocale}
                        className="text-lg hover:text-primary transition-colors"
                      />
                    </div>
                  ),
                  className: '',
                  media:
                    Array.isArray(region.media?.media) &&
                    region.media.media[0] &&
                    typeof region.media.media[0] === 'object' &&
                    'url' in region.media.media[0]
                      ? region.media.media[0]
                      : getNextMedia(item.media?.media, 4 + index),
                })),
              ...(item.relationships?.blendingPartners || [])
                .filter((g): g is GrapeVariety => typeof g !== 'number')
                .map((grape, index) => ({
                  content: (
                    <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                      <h2 className="text-4xl font-semibold font-accent">
                        {t('blendingPartners')}
                      </h2>
                      <CollectionLink
                        title={grape.title || ''}
                        slug={
                          grape.slug && typeof grape.slug === 'object'
                            ? grape.slug[resolvedLocale] || ''
                            : ''
                        }
                        collection="grape-varieties"
                        language={resolvedLocale}
                        className="text-lg hover:text-primary transition-colors"
                      />
                    </div>
                  ),
                  className: '',
                  media:
                    Array.isArray(grape.media?.media) &&
                    grape.media.media[0] &&
                    typeof grape.media.media[0] === 'object' &&
                    'url' in grape.media.media[0]
                      ? grape.media.media[0]
                      : getNextMedia(
                          item.media?.media,
                          4 + (item.relationships?.bestRegions?.length || 0) + index,
                        ),
                })),
              ...(item.relationships?.similarVarieties || [])
                .filter((g): g is GrapeVariety => typeof g !== 'number')
                .map((grape, index) => ({
                  content: (
                    <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                      <h2 className="text-4xl font-semibold font-accent">
                        {t('similarVarieties')}
                      </h2>
                      <CollectionLink
                        title={grape.title || ''}
                        slug={
                          grape.slug && typeof grape.slug === 'object'
                            ? grape.slug[resolvedLocale] || ''
                            : ''
                        }
                        collection="grape-varieties"
                        language={resolvedLocale}
                        className="text-lg hover:text-primary transition-colors"
                      />
                    </div>
                  ),
                  className: '',
                  media:
                    Array.isArray(grape.media?.media) &&
                    grape.media.media[0] &&
                    typeof grape.media.media[0] === 'object' &&
                    'url' in grape.media.media[0]
                      ? grape.media.media[0]
                      : getNextMedia(
                          item.media?.media,
                          4 +
                            (item.relationships?.bestRegions?.length || 0) +
                            (item.relationships?.blendingPartners?.length || 0) +
                            index,
                        ),
                })),
              {
                content: (
                  <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                    <h2 className="text-4xl font-semibold font-accent">{t('whyCool')}</h2>
                    <p className="text-lg text-center max-w-2xl">{item.general?.whyCool}</p>
                  </div>
                ),
                className: '',
                media: getNextMedia(item.media?.media, 3),
              },
            ]}
          />

          {/* Wines for this Grape Variety */}
          <div className="mt-12" role="complementary" aria-label="Wines for this Grape Variety">
            <h2 className="mb-6 text-2xl font-semibold font-accent text-center items-center justify-center">
              {t('winesFrom')}
            </h2>
            <FilterSortBar
              currentCollection={{
                id: String(item.id),
                type: 'grape-varieties',
              }}
              searchParams={searchParams || {}}
            />
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
