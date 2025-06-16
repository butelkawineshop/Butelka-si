import { headers } from 'next/headers'
import type { Locale } from '@/utilities/routeMappings'
import CollectionCards from '@/components/CollectionCards'
import { FilterSortBar } from '@/components/FilterSortBar'
import { getSafeSlug } from '@/utilities/getSafeSlug'
import type { Media } from '@butelkawineshop/types'

type CollectionType =
  | 'wineries'
  | 'regions'
  | 'wineCountries'
  | 'grape-varieties'
  | 'tags'
  | 'aromas'
  | 'styles'
  | 'climates'
  | 'moods'
  | 'foods'

interface CollectionItem {
  id: string
  title?: string
  slug: Record<string, string>
  media?: {
    media: Media | Media[] | null
  } | null
}

interface Props {
  collection: CollectionType
  description?: string
  locale: Locale
  _filters?: {
    [key: string]: string | string[]
  }
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function ListTemplate({
  collection,
  description,
  _filters,
  searchParams,
}: Props) {
  const headersList = await headers()
  const resolvedLocale = (headersList.get('x-locale') || 'sl') as Locale

  const queryParams = new URLSearchParams({
    depth: '2',
    locale: resolvedLocale,
    fallbackLocale: resolvedLocale === 'en' ? 'sl' : 'en',
    draft: 'false',
    limit: '100',
    page: '1',
    where: JSON.stringify({
      _status: {
        equals: 'published'
      },
      ...(_filters || {})
    })
  })

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${collection}?${queryParams.toString()}`,
      {
        next: { revalidate: 600 },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!res.ok) {
      console.error('API Error:', res.status, res.statusText)
      throw new Error(`API request failed with status ${res.status}`)
    }

    const data = await res.json()
    const { docs: items, totalDocs, totalPages } = data

    if (!items || !Array.isArray(items)) {
      console.error('Invalid API response format:', data)
      throw new Error('Invalid API response format')
    }

    return (
      <div className="mx-auto px-4 py-8 w-full items-center justify-center container">
        <div className="space-y-8">
          {description && (
            <div className="space-y-6 w-full flex flex-col items-center justify-center">
              {description && <p className="text-lg text-foreground/70">{description}</p>}
            </div>
          )}

          <div className="mt-8 items-center justify-center">
            <CollectionCards
              items={items.map((item: CollectionItem) => ({
                id: item.id,
                title: item.title || '',
                slug: getSafeSlug(item.slug, resolvedLocale),
                media: item.media?.media
                  ? {
                      media: Array.isArray(item.media.media) ? item.media.media[0] : item.media.media,
                    }
                  : null,
              }))}
              collection={collection}
              locale={resolvedLocale}
              showPagination={true}
            />
          </div>
          <div className="mt-8">
            <FilterSortBar searchParams={searchParams} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching data:', error)
    return (
      <div className="mx-auto px-4 py-8 w-full items-center justify-center container">
        <div className="text-center text-red-500">
          Error loading content. Please try again later.
        </div>
      </div>
    )
  }
}
