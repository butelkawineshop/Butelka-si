import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Locale } from '@/utilities/routeMappings'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingState } from '@/components/LoadingState'
import { Suspense } from 'react'
import type { Climate, Media, Region, GrapeVariety } from '@butelkawineshop/types'
import { DetailSlideshow } from '@/components/DetailSlideshow'
import { getTranslations } from 'next-intl/server'
import CollectionLink from '@/components/WineCard/components/CollectionLink'
import { FilterSortBar } from '@/components/FilterSortBar'

interface Props {
  slug: string
  locale?: Locale
  initialData?: Climate
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}

export default async function ClimateTemplate({ slug, locale, initialData, searchParams }: Props) {
  const headersList = await headers()
  const resolvedLocale = locale || ((headersList.get('x-locale') || 'sl') as Locale)
  const t = await getTranslations('climate')

  let item: Climate

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
        description: true,
        climate: true,
        climateTemperature: true,
        diurnalTemperatureRange: true,
        climateHumidity: true,
        bestRegions: true,
        bestGrapes: true,
        media: true,
      }),
    })

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/climates?${queryParams.toString()}`,
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
    media: (Media | number)[] | null | undefined,
    index: number,
  ): Media | undefined => {
    if (!media || !Array.isArray(media)) return undefined
    const filteredMedia = media.filter((m): m is Media => typeof m !== 'number')
    return filteredMedia[index % filteredMedia.length]
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <div className="flex flex-col gap-8 sm:p-8" role="main" aria-label="Climate Details">
          <DetailSlideshow
            title={item.title}
            slides={[
              {
                content: (
                  <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                    <h2 className="text-4xl font-semibold font-accent">{item.title}</h2>
                    <p className="text-lg text-center max-w-2xl">{item.description}</p>
                  </div>
                ),
                className: '',
                media: getNextMedia(item.media?.media, 0),
              },
              {
                content: (
                  <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                    <h2 className="text-4xl font-semibold font-accent">{t('details')}</h2>
                    <div className="flex flex-col gap-2 text-center max-w-2xl">
                      <p className="text-lg">
                        {t('typeLabel')}: {t(`type.${item.climate}`)}
                      </p>
                      <p className="text-lg">
                        {t('temperatureLabel')}: {t(`temperature.${item.climateTemperature}`)}
                      </p>
                      <p className="text-lg">
                        {t('diurnalRangeLabel')}:{' '}
                        {t(`diurnalRange.${item.diurnalTemperatureRange}`)}
                      </p>
                      <p className="text-lg">
                        {t('humidityLabel')}: {t(`humidity.${item.climateHumidity}`)}
                      </p>
                    </div>
                  </div>
                ),
                className: '',
                media: getNextMedia(item.media?.media, 1),
              },
              ...(item.bestRegions || [])
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
                      : getNextMedia(item.media?.media, 2 + index),
                })),
              ...(item.bestGrapes || [])
                .filter((g): g is GrapeVariety => typeof g !== 'number')
                .map((grape, index) => ({
                  content: (
                    <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                      <h2 className="text-4xl font-semibold font-accent">{t('bestGrapes')}</h2>
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
                          2 + (item.bestRegions?.length || 0) + index,
                        ),
                })),
            ]}
          />

          {/* Wines from this Climate */}
          <div className="mt-12" role="complementary" aria-label="Wines from this Climate">
            <h2 className="mb-6 text-2xl font-semibold font-accent text-center items-center justify-center">
              {t('winesFrom')}
            </h2>
            <FilterSortBar
              currentCollection={{
                id: String(item.id),
                type: 'climates',
              }}
              searchParams={searchParams || {}}
            />
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
