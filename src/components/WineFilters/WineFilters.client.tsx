'use client'

import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Icon } from '@/components/Icon'
import { IconColor } from '@/components/IconColor'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useState, useEffect, useCallback } from 'react'
import { Accordion } from '@/components/Accordion'
import debounce from 'lodash/debounce'

type FilterCollection = {
  key: string
  icon: string
  translationKey: string
  collection: string
}

const FILTER_COLLECTIONS: FilterCollection[] = [
  { key: 'aromas', icon: 'aroma', translationKey: 'filters.aromas', collection: 'aromas' },
  { key: 'climates', icon: 'climate', translationKey: 'filters.climates', collection: 'climates' },
  { key: 'foods', icon: 'pairing', translationKey: 'filters.foods', collection: 'foods' },
  {
    key: 'grapeVarieties',
    icon: 'grape',
    translationKey: 'filters.grapeVarieties',
    collection: 'grape-varieties',
  },
  { key: 'moods', icon: 'mood', translationKey: 'filters.moods', collection: 'moods' },
  { key: 'regions', icon: 'region', translationKey: 'filters.regions', collection: 'regions' },
  { key: 'styles', icon: 'style', translationKey: 'filters.styles', collection: 'styles' },
  { key: 'tags', icon: 'tags', translationKey: 'filters.tags', collection: 'tags' },
  {
    key: 'wineCountries',
    icon: 'country',
    translationKey: 'filters.countries',
    collection: 'wineCountries',
  },
  { key: 'wineries', icon: 'winery', translationKey: 'filters.wineries', collection: 'wineries' },
]

type TastingNote = {
  key: string
  left: {
    icon: string
    translationKey: string
  }
  right: {
    icon: string
    translationKey: string
  }
  maxValue: number
}

const TASTING_NOTES: TastingNote[] = [
  {
    key: 'dry',
    left: { icon: 'dry', translationKey: 'dry' },
    right: { icon: 'sweetness', translationKey: 'sweet' },
    maxValue: 10,
  },
  {
    key: 'light',
    left: { icon: 'skinny', translationKey: 'light' },
    right: { icon: 'fat', translationKey: 'rich' },
    maxValue: 10,
  },
  {
    key: 'smooth',
    left: { icon: 'soft', translationKey: 'smooth' },
    right: { icon: 'sharp', translationKey: 'austere' },
    maxValue: 10,
  },
  {
    key: 'creamy',
    left: { icon: 'crisp', translationKey: 'crisp' },
    right: { icon: 'cream', translationKey: 'creamy' },
    maxValue: 10,
  },
  {
    key: 'alcohol',
    left: { icon: 'water', translationKey: 'noAlcohol' },
    right: { icon: 'alcohol', translationKey: 'highAlcohol' },
    maxValue: 20,
  },
  {
    key: 'ripe',
    left: { icon: 'fruit', translationKey: 'freshFruit' },
    right: { icon: 'jam', translationKey: 'ripeFruit' },
    maxValue: 10,
  },
  {
    key: 'oaky',
    left: { icon: 'steel', translationKey: 'noOak' },
    right: { icon: 'oak', translationKey: 'oaky' },
    maxValue: 10,
  },
  {
    key: 'complex',
    left: { icon: 'simple', translationKey: 'simple' },
    right: { icon: 'complex', translationKey: 'complex' },
    maxValue: 10,
  },
  {
    key: 'youthful',
    left: { icon: 'baby', translationKey: 'youthful' },
    right: { icon: 'old', translationKey: 'mature' },
    maxValue: 10,
  },
  {
    key: 'energetic',
    left: { icon: 'calm', translationKey: 'restrained' },
    right: { icon: 'energy', translationKey: 'energetic' },
    maxValue: 10,
  },
]

type CollectionItem = {
  id: string
  title: string
  slug: string
}

interface WineFiltersClientProps {
  collectionItems: Record<string, CollectionItem[]>
  currentCollection?: {
    id: string
    type: string
  }
}

export default function WineFiltersClient({
  collectionItems,
  currentCollection,
}: WineFiltersClientProps) {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State for active filters
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [tastingNoteRanges, setTastingNoteRanges] = useState<Record<string, [number, number]>>({})
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({})
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize filters from URL params and current collection
  useEffect(() => {
    if (isInitialized) return

    const newActiveFilters: Record<string, string[]> = {}
    const newTastingNoteRanges: Record<string, [number, number]> = {}

    // If we have a current collection, set it as the initial filter
    if (currentCollection) {
      newActiveFilters[currentCollection.type] = [currentCollection.id]
    }

    // Parse collection filters
    FILTER_COLLECTIONS.forEach(({ key }) => {
      const values = searchParams.get(key)?.split(',') || []
      if (values.length > 0) {
        newActiveFilters[key] = values
      }
    })

    // Parse price range
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (minPrice && maxPrice) {
      setPriceRange([Number(minPrice), Number(maxPrice)])
    }

    // Parse tasting note ranges
    TASTING_NOTES.forEach(({ key }) => {
      const min = searchParams.get(`${key}Min`)
      const max = searchParams.get(`${key}Max`)
      if (min && max) {
        newTastingNoteRanges[key] = [Number(min), Number(max)]
      }
    })

    setActiveFilters(newActiveFilters)
    setTastingNoteRanges(newTastingNoteRanges)
    setIsInitialized(true)
  }, [searchParams, currentCollection, isInitialized])

  // Debounced update function with inline function
  const debouncedUpdate = useCallback(
    (params: URLSearchParams) => {
      const updateURL = () => {
        router.replace(`${pathname}?${params.toString()}`)
      }
      debounce(updateURL, 300)()
    },
    [pathname, router],
  )

  // Update URL when filters change
  const updateURL = useCallback(
    (
      newFilters: Record<string, string[]>,
      newPriceRange: [number, number],
      newTastingNoteRanges: Record<string, [number, number]>,
    ) => {
      if (!isInitialized) return

      const params = new URLSearchParams(searchParams.toString())

      // Update collection filters
      Object.entries(newFilters).forEach(([key, values]) => {
        if (values.length > 0) {
          params.set(key, values.join(','))
        } else {
          params.delete(key)
        }
      })

      // Update price range
      if (newPriceRange[0] > 0 || newPriceRange[1] < 1000) {
        params.set('minPrice', String(newPriceRange[0]))
        params.set('maxPrice', String(newPriceRange[1]))
      } else {
        params.delete('minPrice')
        params.delete('maxPrice')
      }

      // Update tasting note ranges
      Object.entries(newTastingNoteRanges).forEach(([key, [min, max]]) => {
        if (min > 0 || max < 10) {
          params.set(`${key}Min`, String(min))
          params.set(`${key}Max`, String(max))
        } else {
          params.delete(`${key}Min`)
          params.delete(`${key}Max`)
        }
      })

      debouncedUpdate(params)
    },
    [searchParams, debouncedUpdate, isInitialized],
  )

  // Update URL when filters change
  useEffect(() => {
    if (!isInitialized) return
    updateURL(activeFilters, priceRange, tastingNoteRanges)
  }, [activeFilters, priceRange, tastingNoteRanges, updateURL, isInitialized])

  const toggleFilter = (collection: string, value: string) => {
    // Calculate new values first
    const current = activeFilters[collection] || []
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]

    // Update URL with properly formatted parameters
    const params = new URLSearchParams(searchParams)
    if (newValues.length > 0) {
      // Convert collection key to match FilterSortBar's expected format
      const paramKey =
        FILTER_COLLECTIONS.find((fc) => fc.key === collection)?.collection || collection
      params.set(paramKey, newValues.join(','))
    } else {
      params.delete(collection)
    }

    // Preserve other parameters
    const currentParams = new URLSearchParams(searchParams)
    for (const [key, value] of currentParams.entries()) {
      if (key !== collection && !params.has(key)) {
        params.set(key, value)
      }
    }
    router.push(`?${params.toString()}`, { scroll: false })

    // Then update state
    setActiveFilters((prev) => ({
      ...prev,
      [collection]: newValues,
    }))
  }

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value)
  }

  const handleTastingNoteChange = (key: string, value: [number, number]) => {
    setTastingNoteRanges((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSearchChange = (collection: string, value: string) => {
    setSearchQueries((prev) => ({
      ...prev,
      [collection]: value,
    }))
  }

  const getFilteredItems = (collection: string) => {
    const items = collectionItems[collection] || []
    const query = searchQueries[collection]?.toLowerCase() || ''
    return items.filter((item) => item.title.toLowerCase().includes(query))
  }

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => (prev === key ? null : key))
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Combined Filters Section */}
      <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
        <Accordion
          title={t('filters.collections')}
          isOpen={openAccordion === 'collections'}
          onToggle={() => toggleAccordion('collections')}
          icon="filters"
          className="rounded-t-lg border-0"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {FILTER_COLLECTIONS.map(({ key, icon, translationKey, collection }) => {
              const items = getFilteredItems(collection)
              const selectedCount = activeFilters[key]?.length || 0
              const isCurrentCollection = currentCollection?.type === key

              return (
                <DropdownMenu key={key}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Icon name={icon} className="w-5 h-5" />
                      <span className="flex-1 text-left">{t(translationKey)}</span>
                      {selectedCount > 0 && (
                        <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                          {selectedCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[300px] p-2 bg-background">
                    <div className="flex flex-col gap-2">
                      <Input
                        placeholder={t('filters.search')}
                        value={searchQueries[collection] || ''}
                        onChange={(e) => handleSearchChange(collection, e.target.value)}
                        className="mb-2"
                      />
                      <div className="max-h-[300px] overflow-y-auto">
                        {items.map((item) => {
                          const isSelected = activeFilters[key]?.includes(item.id) || false
                          const isLocked = isCurrentCollection && item.id === currentCollection.id

                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                            >
                              <Checkbox
                                id={`${key}-${item.id}`}
                                checked={isSelected}
                                onCheckedChange={() => !isLocked && toggleFilter(key, item.id)}
                                disabled={isLocked}
                              />
                              <label
                                htmlFor={`${key}-${item.id}`}
                                className="flex-1 cursor-pointer text-sm"
                              >
                                {item.title}
                              </label>
                              {isLocked && (
                                <Icon name="lock" className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            })}
          </div>
        </Accordion>

        <Accordion
          title={t('filters.tastingNotes')}
          isOpen={openAccordion === 'tastingNotes'}
          onToggle={() => toggleAccordion('tastingNotes')}
          icon="tastings"
          className="rounded-b-lg border-0"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TASTING_NOTES.map(({ key, left, right, maxValue }) => (
              <div key={key} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-foreground/60">
                  <div className="flex items-center gap-2">
                    <IconColor name={left.icon} width={20} height={20} className="flex-shrink-0" />
                    <span>{t(`tasting.notes.${left.translationKey}`)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{t(`tasting.notes.${right.translationKey}`)}</span>
                    <IconColor name={right.icon} width={20} height={20} className="flex-shrink-0" />
                  </div>
                </div>
                <Slider
                  value={tastingNoteRanges[key] || [0, maxValue]}
                  onValueChange={(value: [number, number]) => handleTastingNoteChange(key, value)}
                  min={0}
                  max={maxValue}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </Accordion>
      </div>
      {/* Price Range Filter */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Icon name="price" className="w-5 h-5" />
          <span className="font-medium">{t('filters.price')}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">€{priceRange[0]}</span>
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            min={0}
            max={1000}
            step={1}
            className="w-full"
          />
          <span className="text-sm text-muted-foreground">€{priceRange[1]}</span>
        </div>
      </div>
    </div>
  )
}
