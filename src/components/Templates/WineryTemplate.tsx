import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Locale } from '@/utilities/routeMappings'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingState } from '@/components/LoadingState'
import { Suspense } from 'react'
import type { Winery, Tag, Media } from '@butelkawineshop/types'
import { getTranslations } from 'next-intl/server'
import { DetailSlideshow } from '@/components/DetailSlideshow'
import CollectionLink from '@/components/WineCard/components/CollectionLink'
import { FilterSortBar } from '@/components/FilterSortBar'

interface Props {
  slug: string
  locale?: Locale
  initialData?: Winery
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}

export default async function WineryTemplate({ slug, locale, initialData, searchParams }: Props) {
  const headersList = await headers()
  const resolvedLocale = locale || ((headersList.get('x-locale') || 'sl') as Locale)
  const t = await getTranslations('winery')

  let item: Winery

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
        wineryCode: true,
        'general.description': true,
        'general.whyCool': true,
        'general.tags': {
          title: true,
          slug: true,
          media: true,
        },
        'social.social.website': true,
        'social.social.instagram': true,
        'social.relatedWineries': {
          title: true,
          slug: true,
          media: true,
        },
        media: true,
      }),
    })

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/wineries?${queryParams.toString()}`,
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

  const getNextMedia = (media: (number | Media)[] | null | undefined, index: number) => {
    if (!media || !media.length) return undefined
    const mediaItem = media[index % media.length]
    return typeof mediaItem === 'object' && 'url' in mediaItem ? mediaItem : undefined
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <div className="flex flex-col gap-8 sm:p-16" role="main" aria-label="Winery Details">
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
                    <h2 className="text-4xl font-semibold font-accent">{t('whyCool')}</h2>
                    <p className="text-lg text-center max-w-2xl">{item.general?.whyCool}</p>
                  </div>
                ),
                className: '',
                media: getNextMedia(item.media?.media, 1),
              },
              {
                content: (
                  <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                    <h2 className="text-4xl font-semibold font-accent">{t('social')}</h2>
                    <div className="flex flex-col items-center gap-2">
                      {item.social?.social?.website && (
                        <a
                          href={`https://${item.social.social.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg hover:text-primary transition-colors"
                        >
                          {item.social.social.website}
                        </a>
                      )}
                      {item.social?.social?.instagram && (
                        <a
                          href={`https://instagram.com/${item.social.social.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg hover:text-primary transition-colors"
                        >
                          @{item.social.social.instagram}
                        </a>
                      )}
                    </div>
                  </div>
                ),
                className: '',
                media: getNextMedia(item.media?.media, 2),
              },
              ...(item.general?.tags || [])
                .filter((t): t is Tag => typeof t !== 'number')
                .map((tag, index) => ({
                  content: (
                    <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                      <h2 className="text-4xl font-semibold font-accent">{t('tags')}</h2>
                      <CollectionLink
                        title={tag.title}
                        slug={tag.slug}
                        collection="tags"
                        language={resolvedLocale}
                        className="text-lg hover:text-primary transition-colors"
                      />
                    </div>
                  ),
                  className: '',
                  media:
                    Array.isArray(tag.media?.media) &&
                    tag.media.media[0] &&
                    typeof tag.media.media[0] === 'object' &&
                    'url' in tag.media.media[0]
                      ? tag.media.media[0]
                      : getNextMedia(item.media?.media, 2 + index),
                })),
              ...(item.social?.relatedWineries || [])
                .filter((w): w is Winery => typeof w !== 'number')
                .map((winery, index) => ({
                  content: (
                    <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                      <h2 className="text-4xl font-semibold font-accent">{t('relatedWineries')}</h2>
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
                    Array.isArray(winery.media?.media) &&
                    winery.media.media[0] &&
                    typeof winery.media.media[0] === 'object' &&
                    'url' in winery.media.media[0]
                      ? winery.media.media[0]
                      : getNextMedia(
                          item.media?.media,
                          2 + (item.general?.tags?.length || 0) + index,
                        ),
                })),
            ]}
          />

          {/* Wines from this Winery */}
          <div className="mt-12" role="complementary" aria-label="Wines from this Winery">
            <h2 className="mb-6 text-2xl font-semibold font-accent text-center items-center justify-center">
              {t('winesFrom')}
            </h2>
            <FilterSortBar
              currentCollection={{
                id: String(item.id),
                type: 'wineries',
              }}
              searchParams={searchParams || {}}
            />
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
