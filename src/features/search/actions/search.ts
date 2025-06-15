'use server'

import type { SearchResult } from '../types'
import type { Winery, Region, WineCountry, GrapeVariety, Aroma, Climate, Food, Mood, Tag, WineVariant } from '@butelkawineshop/types'
import { transformMedia, transformRelatedItem } from './transformers'
import { isWine, isWinery, isRegion, isWineCountry } from './utils'
import { sortByPriority } from './utils/priority'

export async function search(query: string): Promise<SearchResult[]> {
  if (!query) return []

  const results: SearchResult[] = []

  // Search for aromas
  const aromasResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/aromas?where[title][like]=${encodeURIComponent(query)}&limit=3&depth=2&select[title]=true&select[slug]=true&select[media][media]=true`)
  const { docs: aromas } = await aromasResponse.json()

  // Search for climates
  const climatesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/climates?where[title][like]=${encodeURIComponent(query)}&limit=3&depth=2&select[title]=true&select[slug]=true&select[media][media]=true`)
  const { docs: climates } = await climatesResponse.json()

  // Search for foods
  const foodsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/foods?where[title][like]=${encodeURIComponent(query)}&limit=3&depth=2&select[title]=true&select[slug]=true&select[media][media]=true`)
  const { docs: foods } = await foodsResponse.json()

  // Search for grape varieties
  const grapeVarietiesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grape-varieties?where[title][like]=${encodeURIComponent(query)}&limit=3&depth=3&select[title]=true&select[slug]=true&select[media][media]=true&select[relationships][similarVarieties]=true`)
  const { docs: grapeVarieties } = await grapeVarietiesResponse.json()

  // Search for moods
  const moodsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/moods?where[or][0][title][like]=${encodeURIComponent(query)}&where[or][1][description][like]=${encodeURIComponent(query)}&limit=3&depth=2&select[title]=true&select[slug]=true&select[description]=true&select[media][media]=true`)
  const { docs: moods } = await moodsResponse.json()

  // Search for regions
  const regionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/regions?where[title][like]=${encodeURIComponent(query)}&limit=3&depth=3&select[title]=true&select[slug]=true&select[media][media]=true&select[general][neighbours]=true`)
  const { docs: regions } = await regionsResponse.json()

  // Search for tags
  const tagsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags?where[title][like]=${encodeURIComponent(query)}&limit=3&depth=2&select[title]=true&select[slug]=true&select[media][media]=true`)
  const { docs: tags } = await tagsResponse.json()

  // Search for wine countries
  const wineCountriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wine-countries?where[title][like]=${encodeURIComponent(query)}&limit=3&depth=3&select[title]=true&select[slug]=true&select[media][media]=true&select[regions]=true`)
  const { docs: wineCountries } = await wineCountriesResponse.json()

  // Search for wineries
  const wineriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wineries?where[title][like]=${encodeURIComponent(query)}&limit=3&depth=3&select[title]=true&select[slug]=true&select[media][media]=true&select[social][relatedWineries]=true`)
  const { docs: wineries } = await wineriesResponse.json()

  // Search for wine variants
  const wineVariantsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wine-variants?where[or][0][wine.title][like]=${encodeURIComponent(query)}&where[or][1][tasting.tastingProfile][like]=${encodeURIComponent(query)}&where[or][2][wine.winery.title][like]=${encodeURIComponent(query)}&where[or][3][wine.region.title][like]=${encodeURIComponent(query)}&where[or][4][wine.region.general.country.title][like]=${encodeURIComponent(query)}&where[or][5][vintage][like]=${encodeURIComponent(query)}&where[or][6][tasting.tags.title][like]=${encodeURIComponent(query)}&where[or][7][tasting.moods.title][like]=${encodeURIComponent(query)}&where[or][8][wine.region.climate.title][like]=${encodeURIComponent(query)}&where[or][9][details.foodPairing.title][like]=${encodeURIComponent(query)}&where[or][10][composition.grapeVarieties.variety.title][like]=${encodeURIComponent(query)}&where[or][11][tasting.aromas.title][like]=${encodeURIComponent(query)}&limit=10&depth=4&select[wine]=true&select[size]=true&select[vintage]=true&select[slug]=true&select[media][media]=true`)
  const { docs: wineVariants } = await wineVariantsResponse.json()

  // Transform aromas
  aromas.forEach((aroma: Aroma) => {
    results.push({
      id: String(aroma.id),
      title: aroma.title || '',
      slug: aroma.slug || '',
      media: transformMedia(aroma.media),
      type: 'aroma',
    })
  })

  // Transform climates
  climates.forEach((climate: Climate) => {
    results.push({
      id: String(climate.id),
      title: climate.title || '',
      slug: climate.slug || '',
      media: transformMedia(climate.media),
      type: 'climate',
    })
  })

  // Transform foods
  foods.forEach((food: Food) => {
    results.push({
      id: String(food.id),
      title: food.title || '',
      slug: food.slug || '',
      media: transformMedia(food.media),
      type: 'food',
    })
  })

  // Transform grape varieties
  grapeVarieties.forEach((variety: GrapeVariety) => {
    results.push({
      id: String(variety.id),
      title: variety.title || '',
      slug: variety.slug || '',
      media: transformMedia(variety.media),
      type: 'grapeVariety',
      similarVarieties: variety.relationships?.similarVarieties
        ?.filter((v): v is GrapeVariety => typeof v !== 'number')
        .slice(0, 3)
        .map(transformRelatedItem),
    })
  })

  // Transform moods
  moods.forEach((mood: Mood) => {
    results.push({
      id: String(mood.id),
      title: mood.title || '',
      slug: mood.slug || '',
      media: transformMedia(mood.media),
      description: mood.description || null,
      type: 'mood',
    })
  })

  // Transform regions
  regions.forEach((region: Region) => {
    results.push({
      id: String(region.id),
      title: region.title || '',
      slug: region.slug || '',
      media: transformMedia(region.media),
      type: 'region',
      neighbours: region.general?.neighbours
        ?.filter((n): n is Region => typeof n !== 'number')
        .slice(0, 3)
        .map(transformRelatedItem),
    })
  })

  // Transform tags
  tags.forEach((tag: Tag) => {
    results.push({
      id: String(tag.id),
      title: tag.title || '',
      slug: tag.slug || '',
      media: transformMedia(tag.media),
      type: 'tag',
    })
  })

  // Transform wine countries
  wineCountries.forEach((country: WineCountry) => {
    results.push({
      id: String(country.id),
      title: country.title || '',
      slug: country.slug || '',
      media: transformMedia(country.media),
      type: 'wineCountry',
      regions: country.regions?.docs
        ?.filter((r): r is Region => typeof r !== 'number')
        .slice(0, 3)
        .map(transformRelatedItem),
    })
  })

  // Transform wineries
  wineries.forEach((winery: Winery) => {
    results.push({
      id: String(winery.id),
      title: winery.title || '',
      slug: winery.slug || '',
      media: transformMedia(winery.media),
      type: 'winery',
      similarWineries: winery.social?.relatedWineries
        ?.filter((w): w is Winery => typeof w !== 'number')
        .slice(0, 3)
        .map(transformRelatedItem),
    })
  })

  // Transform wine variants and ensure uniqueness
  const seenVariantIds = new Set<string>()
  wineVariants.forEach((variant: WineVariant) => {
    const wine = typeof variant.wine === 'object' ? variant.wine : null
    if (!wine || !isWine(wine)) return

    const variantId = String(variant.id)
    if (seenVariantIds.has(variantId)) return
    seenVariantIds.add(variantId)

    results.push({
      id: variantId,
      title: wine.title || '',
      slug: variant.slug || '',
      media: transformMedia(variant.media),
      type: 'wineVariant',
      wine: {
        title: wine.title || '',
        media: wine.meta?.image ? transformMedia({ media: wine.meta.image }) : undefined,
        winery: isWinery(wine.winery)
          ? {
              title: wine.winery.title || '',
              media: transformMedia(wine.winery.media),
            }
          : undefined,
        region: isRegion(wine.region)
          ? {
              title: wine.region.title || '',
              media: transformMedia(wine.region.media),
              general: wine.region.general
                ? {
                    country: isWineCountry(wine.region.general.country)
                      ? {
                          title: wine.region.general.country.title || '',
                          media: transformMedia(wine.region.general.country.media),
                        }
                      : undefined,
                  }
                : undefined,
            }
          : undefined,
      },
      vintage: variant.vintage,
      size: variant.size,
    })
  })

  // Sort results by priority
  results.sort(sortByPriority)

  // First limit the main results to 10
  const limitedResults = results.slice(0, 1000)

  // Then add related items only to the limited results, ensuring we don't exceed 1000 total
  let totalResults = 0
  return limitedResults.map((result) => {
    // If we already have 1000 results, don't add any related items
    if (totalResults >= 1000) {
      return result
    }

    // Count the main result
    totalResults++

    // Add related items if they exist, but ensure we don't exceed 1000 total
    if (result.similarVarieties && totalResults < 1000) {
      const remainingSlots = 1000 - totalResults
      result.similarVarieties = result.similarVarieties.slice(0, Math.min(3, remainingSlots))
      totalResults += result.similarVarieties.length
    }
    if (result.neighbours && totalResults < 1000) {
      const remainingSlots = 1000 - totalResults
      result.neighbours = result.neighbours.slice(0, Math.min(3, remainingSlots))
      totalResults += result.neighbours.length
    }
    if (result.regions && totalResults < 1000) {
      const remainingSlots = 1000 - totalResults
      result.regions = result.regions.slice(0, Math.min(3, remainingSlots))
      totalResults += result.regions.length
    }
    if (result.similarWineries && totalResults < 1000) {
      const remainingSlots = 1000 - totalResults
      result.similarWineries = result.similarWineries.slice(0, Math.min(3, remainingSlots))
      totalResults += result.similarWineries.length
    }

    return result
  })
} 