'use client'

import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { Locale } from '@/utilities/routeMappings'
import WineFilters from '@/components/WineFilters'
import Sorting from '@/components/Sorting'
import WineGrid from '@/components/WineCard/WineGrid'
import { filterToWhere, getSortString } from '@/utilities/filterToWhere'
import { setCurrentCollection, setFilter, setPriceRange, setTastingNoteRange, setSort } from '@/store/slices/filterSlice'
import type { RootState } from '@/store'
import type { FilterType } from '@/store/slices/filterSlice'

type Props = {
  currentCollection?: {
    id: string
    type: FilterType
  }
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}

export function FilterSortBar({ currentCollection, searchParams = {} }: Props) {
  const dispatch = useDispatch()
  const filterState = useSelector((state: RootState) => state.filter)
  const resolvedLocale: Locale = 'sl'

  const processSearchParams = useCallback(() => {
    if (!searchParams) return

    // Set current collection
    if (currentCollection) {
      dispatch(setCurrentCollection(currentCollection))
    }

    // Process search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (!value) return

      // Handle array parameters
      if (['wine-countries', 'aromas', 'climates', 'foods', 'grape-varieties', 'moods', 'regions', 'styles', 'tags', 'wineries'].includes(key)) {
        const values = Array.isArray(value) ? value : value.split(',').map(id => id.trim())
        dispatch(setFilter({ type: key as FilterType, values }))
      }

      // Handle price range
      if (key === 'minPrice' || key === 'maxPrice') {
        const numValue = Number(value)
        if (!isNaN(numValue)) {
          dispatch(setPriceRange({
            ...filterState.priceRange,
            [key]: numValue
          }))
        }
      }

      // Handle tasting notes
      const tastingNotes = ['dry', 'ripe', 'creamy', 'oaky', 'complex', 'light', 'smooth', 'youthful', 'energetic', 'alcohol'] as const
      for (const note of tastingNotes) {
        if (key === `${note}Min` || key === `${note}Max`) {
          const numValue = Number(value)
          if (!isNaN(numValue)) {
            dispatch(setTastingNoteRange({
              note,
              range: {
                ...filterState.tastingNotes[note],
                [key.endsWith('Min') ? 'min' : 'max']: numValue
              }
            }))
          }
        }
      }

      // Handle sorting
      if (key === 'sort') {
        const direction = searchParams.direction === 'desc' ? 'desc' : 'asc'
        dispatch(setSort({ field: value as string, direction }))
      }
    })
  }, [currentCollection, searchParams, dispatch])

  useEffect(() => {
    processSearchParams()
  }, [processSearchParams])

  const where = filterToWhere(filterState)
  const sort = getSortString(filterState)

  return (
    <div className="flex flex-col gap-4 w-full">
      <WineFilters currentCollection={currentCollection} />
      <Sorting />
      <WineGrid locale={resolvedLocale} where={where} sort={sort} />
    </div>
  )
}
