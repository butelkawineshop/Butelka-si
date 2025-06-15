import type { FilterState } from '@/store/slices/filterSlice'

// Define our own Where type that matches Payload's structure
export type PayloadWhere = {
  [key: string]: {
    equals?: string | number
    in?: (string | number)[]
    greater_than_equal?: number
    less_than_equal?: number
  } | PayloadWhere
}

const fieldPathMap: Record<string, string> = {
  wineries: 'wine.winery',
  'wine-countries': 'wine.region.general.country',
  regions: 'wine.region',
  styles: 'wine.style',
  'grape-varieties': 'composition.grapeVarieties.variety',
  aromas: 'tasting.aromas',
  moods: 'tasting.moods',
  foods: 'details.foodPairing',
  tags: 'tasting.tags',
  climates: 'wine.region.climate',
}

export const filterToWhere = (filterState: FilterState): PayloadWhere => {
  const where: PayloadWhere = {}

  // Handle current collection
  if (filterState.currentCollection) {
    const fieldPath = fieldPathMap[filterState.currentCollection.type]
    if (fieldPath) {
      where[fieldPath] = { equals: filterState.currentCollection.id }
    }
  }

  // Handle filters
  Object.entries(filterState.filters).forEach(([type, values]) => {
    if (values && values.length > 0) {
      const fieldPath = fieldPathMap[type]
      if (fieldPath) {
        // Convert string IDs to numbers for specific fields
        const processedValues = ['wine-countries', 'grape-varieties'].includes(type)
          ? values.map((id) => parseInt(id, 10))
          : values

        where[fieldPath] = { in: processedValues }
      }
    }
  })

  // Handle price range
  if (filterState.priceRange.minPrice || filterState.priceRange.maxPrice) {
    where['details.price'] = {}
    if (filterState.priceRange.minPrice !== undefined) {
      where['details.price'].greater_than_equal = filterState.priceRange.minPrice
    }
    if (filterState.priceRange.maxPrice !== undefined) {
      where['details.price'].less_than_equal = filterState.priceRange.maxPrice
    }
  }

  // Handle tasting notes
  Object.entries(filterState.tastingNotes).forEach(([note, range]) => {
    if (range?.min !== undefined || range?.max !== undefined) {
      where[`tasting.tastingNotes.${note}`] = {
        ...(range.min !== undefined && { greater_than_equal: range.min }),
        ...(range.max !== undefined && { less_than_equal: range.max }),
      }
    }
  })

  return where
}

export const getSortString = (filterState: FilterState): string => {
  const { field, direction } = filterState.sort
  const sortField = field === 'price' ? 'details.price' : field === 'name' ? 'slug' : field
  return direction === 'desc' ? `-${sortField}` : sortField
} 