import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Locale } from '@/utilities/routeMappings'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingState } from '@/components/LoadingState'
import { Suspense } from 'react'
import type { Tag, Media } from '@butelkawineshop/types'
import { getTranslations } from 'next-intl/server'
import { DetailSlideshow } from '@/components/DetailSlideshow'
import { FilterSortBar } from '@/components/FilterSortBar'

interface Props {
  slug: string
  locale?: Locale
  initialData?: Tag
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}

export default async function TagTemplate({ slug, locale, initialData, searchParams }: Props) {
  const headersList = await headers()
  const resolvedLocale = locale || ((headersList.get('x-locale') || 'sl') as Locale)
  const t = await getTranslations('tag')

  let item: Tag

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
        media: true,
      }),
    })

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tags?${queryParams.toString()}`,
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
        <div className="flex flex-col gap-8 sm:p-16" role="main" aria-label="Tag Details">
          <DetailSlideshow
            title={item.title || ''}
            media={Array.isArray(item.media?.media) ? item.media.media : undefined}
            slides={[
              {
                content: (
                  <div className="flex flex-col items-center justify-center gap-4 p-4 max-h-3/4 overflow-auto">
                    <h1 className="text-5xl font-semibold font-accent">{item.title}</h1>
                    {item.description && (
                      <p className="text-lg text-center max-w-2xl">{item.description}</p>
                    )}
                  </div>
                ),
                className: '',
                media: getNextMedia(
                  Array.isArray(item.media?.media) ? item.media.media : undefined,
                  0,
                ),
              },
            ]}
          />

          {/* Wines with this Tag */}
          <div className="mt-12" role="complementary" aria-label="Wines with this Tag">
            <h2 className="mb-6 text-2xl font-semibold font-accent text-center items-center justify-center">
              {t('winesWith')}
            </h2>
            <FilterSortBar
              currentCollection={{
                id: String(item.id),
                type: 'tags',
              }}
              searchParams={searchParams || {}}
            />
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
