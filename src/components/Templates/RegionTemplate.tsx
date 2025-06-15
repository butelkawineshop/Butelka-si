import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Locale } from '@/utilities/routeMappings'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingState } from '@/components/LoadingState'
import { Suspense } from 'react'
import type { Region, GrapeVariety, Winery, Media } from '@butelkawineshop/types'
import { getTranslations } from 'next-intl/server'
import { DetailSlideshow } from '@/components/DetailSlideshow'
import CollectionLink from '@/components/WineCard/components/CollectionLink'
import { FilterSortBar } from '@/components/FilterSortBar'

interface Props {
  slug: string
  locale?: Locale
  initialData?: Region
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}

const getNextMedia = (mediaArray: (Media | number)[] | undefined | null, index: number) => {
  if (!mediaArray || !Array.isArray(mediaArray) || mediaArray.length === 0) return null
  const media = mediaArray[index % mediaArray.length]
  return typeof media === 'object' && 'url' in media ? media : null
}

export default async function RegionTemplate({ slug, locale, initialData, searchParams }: Props) {
  const headersList = await headers()
  const resolvedLocale = locale || ((headersList.get('x-locale') || 'sl') as Locale)
  const t = await getTranslations('region')
  let item: Region

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
        whyCool: true,
        priceRange: true,
        climate: true,
        'general.description': true,
        'general.country': {
          title: true,
          media: true,
        },
        'general.neighbours': {
          title: true,
          slug: true,
          media: {
            media: true,
          },
        },
        'general.bestGrapes': {
          title: true,
          slug: true,
          media: true,
        },
        'general.legends': {
          title: true,
          slug: true,
          media: true,
        },
        media: true,
      }),
    })

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/regions?${queryParams.toString()}`,
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

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <div className="flex flex-col gap-8 sm:p-16" role="main" aria-label="Region Details">
          <DetailSlideshow
            title={item.title}
            media={item.media?.media || undefined}
            slides={[
              {
                content: (
                  <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                    <h1 className="text-5xl font-semibold font-accent">{item.title}</h1>
                    <p className="text-lg text-center max-w-2xl">{item.general?.description}</p>
                  </div>
                ),
                className: '',
                media: getNextMedia(item.media?.media, 0),
              },
              {
                content: (
                  <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                    <h2 className="text-4xl font-semibold font-accent">{t('climate')}</h2>
                    {item.climate && typeof item.climate !== 'number' && (
                      <CollectionLink
                        title={item.climate.title}
                        slug={item.climate.slug}
                        collection="climates"
                        language={resolvedLocale}
                        className="text-lg hover:text-primary transition-colors"
                      />
                    )}
                  </div>
                ),
                className: '',
                media:
                  item.climate &&
                  typeof item.climate !== 'number' &&
                  item.climate.media?.media?.[0] &&
                  typeof item.climate.media.media[0] === 'object' &&
                  'url' in item.climate.media.media[0]
                    ? item.climate.media.media[0]
                    : getNextMedia(item.media?.media, 1),
              },
              {
                content: (
                  <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                    <h2 className="text-4xl font-semibold font-accent">{t('priceRange')}</h2>
                    <p className="text-lg text-center max-w-2xl">{item.priceRange} €</p>
                  </div>
                ),
                className: '',
                media: getNextMedia(item.media?.media, 2),
              },
              ...(item.general?.neighbours || [])
                .filter((r): r is Region => typeof r !== 'number')
                .map((region: Region, index: number) => ({
                  content: (
                    <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                      <h2 className="text-4xl font-semibold font-accent">
                        {t('neighboringRegions')}
                      </h2>
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
                      : getNextMedia(item.media?.media, 3 + index),
                })),
              ...(item.general?.bestGrapes || [])
                .filter((g): g is GrapeVariety => typeof g !== 'number')
                .map((grape: GrapeVariety, index: number) => ({
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
                      : getNextMedia(item.media?.media, 3 + index),
                })),
              ...(item.general?.legends || [])
                .filter((w): w is Winery => typeof w !== 'number')
                .map((winery: Winery, index: number) => ({
                  content: (
                    <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                      <h2 className="text-4xl font-semibold font-accent">
                        {t('legendaryWineries')}
                      </h2>
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
                            (item.general?.neighbours?.length || 0) +
                            (item.general?.bestGrapes?.length || 0) +
                            index,
                        ),
                })),
              ...(item.whyCool
                ? [
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
                  ]
                : []),
            ]}
          />

          {/* Wines from this Region */}
          <div className="mt-12" role="complementary" aria-label="Wines from this Region">
            <h2 className="mb-6 text-2xl font-semibold font-accent text-center items-center justify-center">
              {t('winesFrom')}
            </h2>
            <FilterSortBar
              currentCollection={{
                id: String(item.id),
                type: 'regions',
              }}
              searchParams={searchParams || {}}
            />
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
