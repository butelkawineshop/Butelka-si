import WineFiltersClient from './WineFilters.client'
import type { CollectionItem } from './types'

type Props = {
  currentCollection?: {
    id: string
    type: string
  }
}

async function fetchCollection(collection: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${collection}?limit=1000`, {
    next: { revalidate: 3600 }, // Revalidate every hour
  })
  
  if (!res.ok) {
    throw new Error(`Failed to fetch ${collection}`)
  }

  return res.json()
}

export default async function WineFilters({ currentCollection }: Props) {
  // Fetch all collections needed for filters
  const [
    aromas,
    climates,
    foods,
    grapeVarieties,
    moods,
    regions,
    styles,
    tags,
    wineCountries,
    wineries,
  ] = await Promise.all([
    fetchCollection('aromas'),
    fetchCollection('climates'),
    fetchCollection('foods'),
    fetchCollection('grape-varieties'),
    fetchCollection('moods'),
    fetchCollection('regions'),
    fetchCollection('styles'),
    fetchCollection('tags'),
    fetchCollection('wineCountries'),
    fetchCollection('wineries'),
  ])

  const mapDocToItem = (doc: any): CollectionItem => ({
    id: doc.id.toString(),
    title: doc.title || '',
    slug: doc.slug || '',
  })

  const collectionItems: Record<string, CollectionItem[]> = {
    aromas: aromas.docs.map(mapDocToItem),
    climates: climates.docs.map(mapDocToItem),
    foods: foods.docs.map(mapDocToItem),
    'grape-varieties': grapeVarieties.docs.map(mapDocToItem),
    moods: moods.docs.map(mapDocToItem),
    regions: regions.docs.map(mapDocToItem),
    styles: styles.docs.map(mapDocToItem),
    tags: tags.docs.map(mapDocToItem),
    wineCountries: wineCountries.docs.map(mapDocToItem),
    wineries: wineries.docs.map(mapDocToItem),
  }

  return (
    <WineFiltersClient collectionItems={collectionItems} currentCollection={currentCollection} />
  )
}
