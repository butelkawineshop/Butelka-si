import type { SearchResultType } from '../../types'

export const typePriority: Record<SearchResultType, number> = {
  wineVariant: 1,
  winery: 2,
  region: 3,
  wineCountry: 4,
  grapeVariety: 5,
  tag: 6,
  mood: 7,
  food: 8,
  aroma: 9,
  climate: 10,
}

export const sortByPriority = (a: { type: SearchResultType }, b: { type: SearchResultType }) => {
  const priorityA = typePriority[a.type] || 999
  const priorityB = typePriority[b.type] || 999
  return priorityA - priorityB
} 