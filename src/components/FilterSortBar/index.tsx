'use client'

import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { Locale } from '@/utilities/routeMappings'
import dynamic from 'next/dynamic'
import Sorting from '@/components/Sorting'
import WineGrid from '@/components/WineCard/WineGrid'
import { filterToWhere, getSortString } from '@/utilities/filterToWhere'
import { setCurrentCollection, setFilter, setPriceRange, setTastingNoteRange, setSort } from '@/store/slices/filterSlice'
import type { RootState } from '@/store'
import type { FilterType } from '@/store/slices/filterSlice'

// Dynamically import WineFilters with no SSR
const WineFilters = dynamic(() => import('@/components/WineFilters'), { ssr: false })

type Props = {
  currentCollection?: {
    id: string
    type: FilterType
  }
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}

export default function FilterSortBar({ currentCollection, searchParams = {} }: Props) {
  const dispatch = useDispatch()
  const filterState = useSelector((state: RootState) => state.filter)
  const resolvedLocale: Locale = 'sl'

  // Initialize filters from URL params
  useEffect(() => {
    if (currentCollection) {
      dispatch(setCurrentCollection(currentCollection))
    }

    // Parse collection filters
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        if (key === 'minPrice' || key === 'maxPrice') {
          dispatch(setPriceRange({
            ...filterState.priceRange,
            [key]: Number(value)
          }))
        } else if (key.endsWith('Min') || key.endsWith('Max')) {
          const note = key.slice(0, -3) as 'dry' | 'ripe' | 'creamy' | 'oaky' | 'complex' | 'light' | 'smooth' | 'youthful' | 'energetic' | 'alcohol'
          dispatch(setTastingNoteRange({
            note,
            range: {
              ...filterState.tastingNotes[note],
              [key.endsWith('Min') ? 'min' : 'max']: Number(value)
            }
          }))
        } else {
          dispatch(setFilter({
            type: key as FilterType,
            values: value.split(',')
          }))
        }
      }
    })
  }, [searchParams, currentCollection, dispatch, filterState.priceRange, filterState.tastingNotes])

  // Handle sorting
  const handleSort = useCallback((field: string, direction: 'asc' | 'desc') => {
    dispatch(setSort({ field, direction }))
  }, [dispatch])

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
