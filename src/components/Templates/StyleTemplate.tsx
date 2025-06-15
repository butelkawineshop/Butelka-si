import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Locale } from '@/utilities/routeMappings'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingState } from '@/components/LoadingState'
import { Suspense } from 'react'
import type { Style, Media } from '@butelkawineshop/types'
import { getTranslations } from 'next-intl/server'
import { DetailSlideshow } from '@/components/DetailSlideshow'
import { FilterSortBar } from '@/components/FilterSortBar'

interface Props {
  slug: string
  locale?: Locale
  initialData?: Style
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}

export default async function StyleTemplate({ slug, locale, initialData, searchParams }: Props) {
  const headersList = await headers()
  const resolvedLocale = locale || ((headersList.get('x-locale') || 'sl') as Locale)
  const t = await getTranslations('style')

  let item: Style

  if (initialData) {
    item = initialData
  } else {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/styles?${new URLSearchParams({
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
      })}`,
      {
        next: { revalidate: 600 },
      }
    )

    if (!res.ok) {
      return notFound()
    }

    const { docs } = await res.json()

    if (!docs.length) {
      return notFound()
    }

    item = docs[0] as Style
  }

  const getNextMedia = (media: (number | Media)[] | null | undefined, index: number) => {
    if (!media || !media.length) return undefined
    const mediaItem = media[index % media.length]
    return typeof mediaItem === 'object' && 'url' in mediaItem ? mediaItem : undefined
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <div className="flex flex-col gap-8 sm:p-16" role="main" aria-label="Style Details">
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

          {/* Wines of this Style */}
          <div className="mt-12" role="complementary" aria-label="Wines of this Style">
            <h2 className="mb-6 text-2xl font-semibold font-accent text-center items-center justify-center">
              {t('winesOf')}
            </h2>
            <FilterSortBar
              currentCollection={{
                id: String(item.id),
                type: 'styles',
              }}
              searchParams={searchParams || {}}
            />{' '}
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
