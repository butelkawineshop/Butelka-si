import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Locale } from '@/utilities/routeMappings'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingState } from '@/components/LoadingState'
import { Suspense } from 'react'
import type { WineCountry, Region, GrapeVariety, Winery, Media } from '@butelkawineshop/types'
import { getTranslations } from 'next-intl/server'
import { DetailSlideshow } from '@/components/DetailSlideshow'
import CollectionLink from '@/components/WineCard/components/CollectionLink'
import { FilterSortBar } from '@/components/FilterSortBar'

interface Props {
  slug: string
  locale?: Locale
  initialData?: WineCountry
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}

export default async function WineCountryTemplate({
  slug,
  locale,
  initialData,
  searchParams,
}: Props) {
  const headersList = await headers()
  const resolvedLocale = locale || ((headersList.get('x-locale') || 'sl') as Locale)
  const t = await getTranslations('wineCountry')

  let item: WineCountry

  if (initialData) {
    item = initialData
  } else {
    const queryParams = new URLSearchParams({
      depth: '2',
      locale: resolvedLocale,
      fallbackLocale: resolvedLocale === 'en' ? 'sl' : 'en',
      draft: 'false',
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
        description: true,
        whyCool: true,
        landArea: true,
        wineriesCount: true,
        regions: true,
        bestRegions: {
          title: true,
          slug: true,
          media: {
            media: true,
          },
        },
        bestGrapes: {
          title: true,
          slug: true,
          media: true,
        },
        legends: {
          title: true,
          slug: true,
          media: true,
        },
        media: true,
      }),
    })

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/wineCountries?${queryParams.toString()}`,
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
    if (typeof mediaItem === 'object' && 'url' in mediaItem) {
      // Ensure we're using the winecards variant for the slideshow
      return {
        ...mediaItem,
        url: mediaItem.url?.replace(/\/[^/]+$/, '/') || mediaItem.url,
      }
    }
    return null
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <div className="flex flex-col gap-8 sm:p-16" role="main" aria-label="Wine Country Details">
          <DetailSlideshow
            title={item.title}
            media={Array.isArray(item.media?.media) ? item.media.media : undefined}
            slides={[
              {
                content: (
                  <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                    <h1 className="text-5xl font-semibold font-accent">{item.title}</h1>
                    <p className="text-lg text-center max-w-2xl">{item.description}</p>
                  </div>
                ),
                className: '',
                media: getNextMedia(item.media?.media, 0),
              },
              {
                content: (
                  <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                    <h2 className="text-4xl font-semibold font-accent">{t('stats')}</h2>
                    <div className="flex flex-col items-center gap-2">
                      {item.landArea && (
                        <p className="text-lg text-center">
                          {t('landArea')}: {item.landArea} km²
                        </p>
                      )}
                      {item.wineriesCount && (
                        <p className="text-lg text-center">
                          {t('wineriesCount')}: {item.wineriesCount}
                        </p>
                      )}
                    </div>
                  </div>
                ),
                className: '',
                media: getNextMedia(item.media?.media, 2),
              },
              ...(item.bestRegions || [])
                .filter((r): r is Region => typeof r !== 'number')
                .map((region, index) => ({
                  content: (
                    <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                      <h2 className="text-4xl font-semibold font-accent">{t('bestRegions')}</h2>
                      <CollectionLink
                        title={region.title}
                        slug={region.slug}
                        collection="regions"
                        language={resolvedLocale}
                        className="text-lg hover:text-primary transition-colors"
                      />
                    </div>
                  ),
                  className: '',
                  media:
                    region.media?.media?.[0] &&
                    typeof region.media.media[0] === 'object' &&
                    'url' in region.media.media[0]
                      ? region.media.media[0]
                      : getNextMedia(
                          item.media?.media,
                          3 + (item.regions?.docs?.length || 0) + index,
                        ),
                })),
              ...(item.bestGrapes || [])
                .filter((g): g is GrapeVariety => typeof g !== 'number')
                .map((grape, index) => ({
                  content: (
                    <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                      <h2 className="text-4xl font-semibold font-accent">{t('bestGrapes')}</h2>
                      <CollectionLink
                        title={grape.title}
                        slug={grape.slug}
                        collection="grape-varieties"
                        language={resolvedLocale}
                        className="text-lg hover:text-primary transition-colors"
                      />
                    </div>
                  ),
                  className: '',
                  media:
                    grape.media?.media?.[0] &&
                    typeof grape.media.media[0] === 'object' &&
                    'url' in grape.media.media[0]
                      ? grape.media.media[0]
                      : getNextMedia(
                          item.media?.media,
                          3 +
                            (item.regions?.docs?.length || 0) +
                            (item.bestRegions?.length || 0) +
                            index,
                        ),
                })),
              ...(item.legends || [])
                .filter((w): w is Winery => typeof w !== 'number')
                .map((winery, index) => ({
                  content: (
                    <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                      <h2 className="text-4xl font-semibold font-accent">{t('legends')}</h2>
                      <CollectionLink
                        title={winery.title}
                        slug={winery.slug}
                        collection="wineries"
                        language={resolvedLocale}
                        className="text-lg hover:text-primary transition-colors"
                      />
                    </div>
                  ),
                  className: '',
                  media:
                    winery.media?.media?.[0] &&
                    typeof winery.media.media[0] === 'object' &&
                    'url' in winery.media.media[0]
                      ? winery.media.media[0]
                      : getNextMedia(
                          item.media?.media,
                          3 +
                            (item.regions?.docs?.length || 0) +
                            (item.bestRegions?.length || 0) +
                            (item.bestGrapes?.length || 0) +
                            index,
                        ),
                })),
              {
                content: (
                  <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                    <h2 className="text-4xl font-semibold font-accent">{t('whyCool')}</h2>
                    <p className="text-lg text-center max-w-2xl">{item.whyCool}</p>
                  </div>
                ),
                className: '',
                media: getNextMedia(item.media?.media, 1),
              },
            ]}
          />

          {/* Wines from this Country */}
          <div className="mt-12" role="complementary" aria-label="Wines from this Country">
            <h2 className="mb-6 text-2xl font-semibold font-accent text-center items-center justify-center">
              {t('winesFrom')}
            </h2>
            <FilterSortBar
              currentCollection={{
                id: String(item.id),
                type: 'wine-countries',
              }}
              searchParams={searchParams || {}}
            />
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
