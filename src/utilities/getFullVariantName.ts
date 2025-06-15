import type { WineVariant } from '@butelkawineshop/types'

export function getFullVariantName(variant: WineVariant) {
  const wine = typeof variant.wine === 'object' && variant.wine ? variant.wine : null
  const winery = wine?.winery && typeof wine.winery === 'object' ? wine.winery : null
  const region = wine?.region && typeof wine.region === 'object' ? wine.region : null
  const country =
    region?.general?.country && typeof region.general.country === 'object'
      ? region.general.country
      : null

  const parts = [
    winery?.title,
    wine?.title,
    region?.title,
    country?.title,
    variant.vintage,
    `${variant.size}ml`,
  ].filter(Boolean)

  return parts.join(', ')
}
