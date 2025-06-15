'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { search } from '@/features/search/actions'
import type { SearchResult } from '@/features/search/types'
import { useRouter, useSearchParams } from 'next/navigation'
import CollectionLink from '@/components/WineCard/components/CollectionLink'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/Icon'
import { routeMappings } from '@/utilities/routeMappings'

type SearchPageProps = {
  locale: 'sl' | 'en'
  basePath: string
}

const RESULTS_PER_PAGE = 8

const SearchPage: React.FC<SearchPageProps> = ({ locale, basePath }) => {
  const { setHeaderTheme } = useHeaderTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)
  const debouncedQuery = useDebounce(searchQuery, 300)
  const t = useTranslations('search')

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  const lastResultRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isLoadingMore) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [isLoading, isLoadingMore, hasMore],
  )

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery) {
        setResults([])
        setPage(1)
        setHasMore(true)
        return
      }

      if (page === 1) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }

      try {
        const docs = await search(debouncedQuery)
        const startIndex = (page - 1) * RESULTS_PER_PAGE
        const endIndex = page * RESULTS_PER_PAGE
        const newResults = docs.slice(startIndex, endIndex)

        if (page === 1) {
          setResults(newResults)
        } else {
          setResults((prev) => [...prev, ...newResults])
        }

        setHasMore(endIndex < docs.length)
        router.push(`${basePath}?q=${encodeURIComponent(debouncedQuery)}`, { scroll: false })
      } catch (error) {
        console.error('Search failed:', error)
        if (page === 1) {
          setResults([])
        }
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    }

    performSearch()
  }, [debouncedQuery, router, basePath, page])

  // Reset page when search query changes
  useEffect(() => {
    setPage(1)
    setHasMore(true)
  }, [debouncedQuery])

  const getCategoryName = (type: SearchResult['type']) => {
    const typeToRouteMap: Record<SearchResult['type'], keyof typeof routeMappings> = {
      wineVariant: 'wine',
      winery: 'wineries',
      region: 'regions',
      wineCountry: 'countries',
      grapeVariety: 'grape-varieties',
      tag: 'collections',
      mood: 'moods',
      food: 'dishes',
      aroma: 'aromas',
      climate: 'climates',
    }

    const routeKey = typeToRouteMap[type]
    const mapping = routeKey ? routeMappings[routeKey] : null
    return mapping ? mapping[locale] : ''
  }

  const getWineVariantTitle = (result: SearchResult) => {
    if (result.type !== 'wineVariant') return result.title

    const wine = typeof result.wine === 'object' ? result.wine : null
    if (!wine) return result.title

    const winery = typeof wine.winery === 'object' ? wine.winery : null
    const region = typeof wine.region === 'object' ? wine.region : null
    const country = typeof region?.general?.country === 'object' ? region.general.country : null

    const parts = [
      winery?.title,
      wine.title,
      region?.title,
      country?.title,
      result.vintage,
      `${result.size}ml`,
    ].filter(Boolean)

    return parts.join(', ')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-accent mb-8">{t('search')}</h1>

      {/* Search input */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full px-4 py-2 text-lg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Icon
            name="search"
            width={24}
            height={24}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-8">{t('loading')}</div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {results.map((result, _index) => {
            const typeToRouteMap: Record<SearchResult['type'], keyof typeof routeMappings> = {
              wineVariant: 'wine',
              winery: 'wineries',
              region: 'regions',
              wineCountry: 'countries',
              grapeVariety: 'grape-varieties',
              tag: 'collections',
              mood: 'moods',
              food: 'dishes',
              aroma: 'aromas',
              climate: 'climates',
            }

            const routeKey = typeToRouteMap[result.type]
            const collection = routeKey ? routeMappings[routeKey]?.collection || '' : ''
            const categoryName = getCategoryName(result.type)

            return (
              <CollectionLink
                key={`${result.type}-${result.id}`}
                collection={collection}
                title={result.title}
                slug={result.slug}
                className={`group relative aspect-square border-[1px] border-border overflow-hidden ${!result.media?.media || (Array.isArray(result.media.media) && result.media.media.length === 0) || (typeof result.media.media === 'object' && !('url' in result.media.media)) ? 'bg-background' : ''}`}
              >
                {result.media?.media &&
                  (Array.isArray(result.media.media)
                    ? result.media.media.length > 0
                    : 'url' in result.media.media) && (
                    <div className="absolute inset-0">
                      <Image
                        src={
                          Array.isArray(result.media.media)
                            ? result.media.media[0] &&
                              typeof result.media.media[0] === 'object' &&
                              'url' in result.media.media[0]
                              ? result.media.media[0].url || ''
                              : ''
                            : typeof result.media.media === 'object' && 'url' in result.media.media
                              ? result.media.media.url || ''
                              : ''
                        }
                        alt={result.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-transparent" />
                    </div>
                  )}
                <div className="absolute inset-0 p-4 flex flex-col justify-center items-center text-shadow-lg">
                  <span
                    className={`text-xs  font-medium ${result.media?.media && ((Array.isArray(result.media.media) && result.media.media.length > 0) || (typeof result.media.media === 'object' && 'url' in result.media.media)) ? 'text-white/80' : 'text-foreground'} capitalize mb-1`}
                  >
                    {categoryName}
                  </span>
                  <h3
                    className={`text-sm font-medium text-center ${result.media?.media && ((Array.isArray(result.media.media) && result.media.media.length > 0) || (typeof result.media.media === 'object' && 'url' in result.media.media)) ? 'text-white' : 'text-foreground'} line-clamp-2`}
                  >
                    {getWineVariantTitle(result)}
                  </h3>
                  {result.description && (
                    <p
                      className={`text-xs ${result.media?.media && ((Array.isArray(result.media.media) && result.media.media.length > 0) || (typeof result.media.media === 'object' && 'url' in result.media.media)) ? 'text-white/80' : 'text-foreground'} line-clamp-2 mt-1`}
                    >
                      {result.description}
                    </p>
                  )}
                </div>
              </CollectionLink>
            )
          })}
          {/* Observer element for infinite scroll */}
          <div ref={lastResultRef} className="h-4" />
        </div>
      ) : searchQuery ? (
        <div className="text-center text-foreground/60">{t('noResults')}</div>
      ) : null}

      {/* Loading indicator for infinite scroll */}
      {isLoadingMore && <div className="text-center py-4">{t('loading')}</div>}
    </div>
  )
}

export default SearchPage
