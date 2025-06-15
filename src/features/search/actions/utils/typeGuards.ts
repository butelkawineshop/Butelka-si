import type { Wine, Winery, Region, WineCountry } from '@butelkawineshop/types'

export const isWine = (wine: unknown): wine is Wine => {
  return typeof wine === 'object' && wine !== null && 'title' in wine
}

export const isWinery = (winery: unknown): winery is Winery => {
  return typeof winery === 'object' && winery !== null && 'title' in winery
}

export const isRegion = (region: unknown): region is Region => {
  return typeof region === 'object' && region !== null && 'title' in region
}

export const isWineCountry = (country: unknown): country is WineCountry => {
  return typeof country === 'object' && country !== null && 'title' in country
} 