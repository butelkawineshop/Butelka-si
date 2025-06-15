import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/Icon'
import { useDebounce } from '@/utilities/useDebounce'
import CollectionLink from '@/components/WineCard/components/CollectionLink'
import type { SearchResult } from '@/features/search/types'
import { search } from '@/features/search/actions'
import Image from 'next/image'
import { routeMappings } from '@/utilities/routeMappings'
import { usePathname } from 'next/navigation'
import { detectLocaleFromPath } from '@/utilities/routeMappings'

type SearchPopupProps = {
  isOpen: boolean
  onClose: () => void
}

const SearchImage = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
        <Icon name="image" width={24} height={24} className="text-gray-400" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt || 'Search result image'}
      width={48}
      height={48}
      className="w-12 h-12 object-cover rounded"
      onError={() => setError(true)}
    />
  )
}

export const SearchPopup: React.FC<SearchPopupProps> = ({ isOpen, onClose }) => {
  const t = useTranslations('header.search')
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(searchQuery, 300)
  const pathname = usePathname()
  const locale = detectLocaleFromPath(pathname)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const docs = await search(debouncedQuery)
        setResults(docs)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  const getCategoryName = (type: SearchResult['type']) => {
    const typeToCollection: Record<SearchResult['type'], string> = {
      aroma: 'aromas',
      climate: 'climates',
      food: 'foods',
      grapeVariety: 'grape-varieties',
      mood: 'moods',
      region: 'regions',
      tag: 'tags',
      wineCountry: 'wineCountries',
      winery: 'wineries',
      wineVariant: 'wines',
    }

    const collection = typeToCollection[type]
    if (type === 'wineCountry' && locale === 'sl') {
      return 'države'
    }
    const mapping = Object.entries(routeMappings).find(([, m]) => m.collection === collection)?.[1]
    if (!mapping) return ''
    return mapping[locale]
  }

  const renderResult = (result: SearchResult) => {
    const collectionMap: Record<SearchResult['type'], string> = {
      aroma: 'aromas',
      climate: 'climates',
      food: 'dishes',
      grapeVariety: 'grape-varieties',
      mood: 'moods',
      region: 'regions',
      tag: 'tags',
      wineCountry: 'wineCountries',
      winery: 'wineries',
      wineVariant: 'wines',
    }

    const collection = collectionMap[result.type]

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
      <div key={`${result.type}-${result.id}`} className="space-y-2">
        {/* Main result */}
        <div className="flex items-center  gap-4 p-2 hover:bg-blue-400 w-fit ml-auto rounded-xl transition-colors bg-blue-300">
          <CollectionLink
            collection={collection}
            title={result.title || ''}
            slug={result.slug}
            className="flex items-center gap-4"
          >
            {result.media?.media &&
              typeof result.media.media !== 'number' &&
              'url' in result.media.media && (
                <SearchImage
                  src={
                    typeof result.media.media === 'object' &&
                    result.media.media &&
                    'url' in result.media.media
                      ? result.media.media.url || ''
                      : ''
                  }
                  alt={result.title || ''}
                />
              )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm text-black">{getWineVariantTitle(result)}</h3>
              </div>
              {result.description && <p className="text-sm text-black">{result.description}</p>}
            </div>
          </CollectionLink>
        </div>

        {/* Related items */}
        {result.similarVarieties && result.similarVarieties.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-black bg-green-400 w-fit rounded-xl p-2">
              {t('also')} {t('similarVarieties')}
            </div>
            {result.similarVarieties.map((variety) => (
              <div
                key={`variety-${variety.id}`}
                className="flex items-center gap-4 p-2 hover:bg-blue-400 w-fit ml-auto rounded-xl transition-colors bg-blue-300"
              >
                <CollectionLink
                  collection="grape-varieties"
                  title={variety.title || ''}
                  slug={variety.slug}
                  className="flex items-center gap-4"
                >
                  {variety.meta?.image &&
                    typeof variety.meta.image !== 'number' &&
                    variety.meta.image.url && (
                      <SearchImage
                        src={variety.meta.image.url}
                        alt={variety.meta.title || 'Search result image'}
                      />
                    )}
                  <div>
                    <h4 className="text-sm text-black">{variety.title || ''}</h4>
                  </div>
                </CollectionLink>
              </div>
            ))}
          </div>
        )}

        {result.neighbours && result.neighbours.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-black bg-green-400 w-fit rounded-xl p-2">
              {t('also')} {t('neighboringRegions')}
            </div>
            {result.neighbours.map((neighbour) => (
              <div
                key={`neighbour-${neighbour.id}`}
                className="flex items-center gap-4 p-2 hover:bg-blue-400 w-fit ml-auto rounded-xl transition-colors bg-blue-300"
              >
                <CollectionLink
                  collection="regions"
                  title={neighbour.title || ''}
                  slug={neighbour.slug}
                  className="flex items-center gap-4"
                >
                  {neighbour.meta?.image &&
                    typeof neighbour.meta.image !== 'number' &&
                    neighbour.meta.image.url && (
                      <SearchImage
                        src={neighbour.meta.image.url}
                        alt={neighbour.meta.title || 'Search result image'}
                      />
                    )}
                  <div>
                    <h4 className="text-sm text-black">{neighbour.title || ''}</h4>
                  </div>
                </CollectionLink>
              </div>
            ))}
          </div>
        )}

        {result.regions && result.regions.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-black bg-green-400 w-fit rounded-xl p-2">
              {t('also')} {t('regions')}
            </div>
            {result.regions.map((region) => (
              <div
                key={`region-${region.id}`}
                className="flex items-center gap-4 p-2 hover:bg-blue-400 w-fit ml-auto rounded-xl transition-colors bg-blue-300"
              >
                <CollectionLink
                  collection="regions"
                  title={region.title || ''}
                  slug={region.slug}
                  className="flex items-center gap-4"
                >
                  {region.meta?.image &&
                    typeof region.meta.image !== 'number' &&
                    region.meta.image.url && (
                      <SearchImage
                        src={region.meta.image.url}
                        alt={region.meta.title || 'Search result image'}
                      />
                    )}
                  <div>
                    <h4 className="text-sm text-black">{region.title || ''}</h4>
                  </div>
                </CollectionLink>
              </div>
            ))}
          </div>
        )}

        {result.similarWineries && result.similarWineries.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-black bg-green-400 w-fit rounded-xl p-2">
              {t('also')} {t('similarWineries')}
            </div>
            {result.similarWineries.map((winery) => (
              <div
                key={`winery-${winery.id}`}
                className="flex items-center gap-4 p-2 hover:bg-blue-400 w-fit ml-auto rounded-xl transition-colors bg-blue-300"
              >
                <CollectionLink
                  collection="wineries"
                  title={winery.title || ''}
                  slug={winery.slug}
                  className="flex items-center gap-4"
                >
                  {winery.meta?.image &&
                    typeof winery.meta.image !== 'number' &&
                    winery.meta.image.url && (
                      <SearchImage
                        src={winery.meta.image.url}
                        alt={winery.meta.title || 'Search result image'}
                      />
                    )}
                  <div>
                    <h4 className="text-sm text-black">{winery.title || ''}</h4>
                  </div>
                </CollectionLink>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center   bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-full max-w-2xl px-8 pt-40"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Speech bubble */}
            <div className="relative bg-white text-black rounded-3xl p-6 shadow-xl">
              {/* Speech bubble tail pointing up */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[20px] border-l-transparent border-r-transparent border-b-white" />

              <div className="flex flex-col gap-4 max-h-[350px] sm:max-h-[500px] overflow-y-auto">
                {/* Question message */}
                <div className="flex flex-row items-center justify-between">
                  <div className="font-accent text-2xl w-full">{t('search')}</div>
                  <button
                    onClick={onClose}
                    className="p-2 icon-container rounded-full transition-colors"
                  >
                    <Icon name="close" width={24} height={24} />
                  </button>
                </div>

                {/* Messages and Results Container */}
                <div className="flex-1 overflow-y-auto space-y-2 px-2">
                  <div className="text-sm text-black bg-green-400 w-fit rounded-xl p-2 mb-2">
                    {t('question')}
                  </div>
                  {isLoading ? (
                    <div className="text-center py-4 text-black">{t('loading')}</div>
                  ) : results.length > 0 ? (
                    // Group results by category
                    Object.entries(
                      results.reduce(
                        (acc, result) => {
                          const categoryName = getCategoryName(result.type)
                          if (!acc[categoryName]) {
                            acc[categoryName] = []
                          }
                          acc[categoryName].push(result)
                          return acc
                        },
                        {} as Record<string, SearchResult[]>,
                      ),
                    ).map(([categoryName, categoryResults], categoryIndex) => (
                      <div key={categoryName} className="space-y-2 w-full flex flex-col">
                        {/* Response message - only once per category */}
                        <div className="text-sm text-black bg-green-400 w-fit rounded-xl p-2">
                          {categoryIndex === 0
                            ? `${t('didYouMean')} ${categoryName}?`
                            : `${t('orThis')} ${categoryName}?`}
                        </div>

                        {/* Results for this category */}
                        {categoryResults.map((result) => renderResult(result))}
                      </div>
                    ))
                  ) : searchQuery ? (
                    <div className="text-sm text-black bg-green-400 w-fit rounded-xl p-2">
                      {t('noResults')}
                    </div>
                  ) : null}

                  {/* View all results link */}
                  {results.length > 0 && (
                    <div className="text-sm text-black bg-green-400 hover:bg-green-500 w-fit underline rounded-xl p-2">
                      <a
                        href={`/${locale === 'en' ? 'en/' : ''}${routeMappings.search[locale]}?q=${encodeURIComponent(
                          searchQuery,
                        )}`}
                        className="text-black hover:text-black/80"
                      >
                        {t('viewAllResults')}
                      </a>
                    </div>
                  )}
                </div>

                {/* Search input - always at bottom */}
                <div className="flex items-center gap-4 border px-8 py-4 rounded-full border-border">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('placeholder')}
                    className="flex-1 text-lg outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
