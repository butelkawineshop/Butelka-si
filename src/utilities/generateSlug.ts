import { slugify } from '@/utilities/slugify'

type GenerateWineSlugProps = {
  wineryName: string
  wineName: string
  regionName: string
  countryName: string
}

type GenerateWineVariantSlugProps = GenerateWineSlugProps & {
  vintage: string
  size: string
}

export const generateWineSlug = ({
  wineryName,
  wineName,
  regionName,
  countryName,
}: GenerateWineSlugProps): string => {
  return slugify(`${wineryName} ${wineName} ${regionName} ${countryName}`)
}

export const generateWineVariantSlug = ({
  wineryName,
  wineName,
  regionName,
  countryName,
  vintage,
  size,
}: GenerateWineVariantSlugProps): string => {
  const baseSlug = generateWineSlug({
    wineryName,
    wineName,
    regionName,
    countryName,
  })

  // Convert size to a URL-friendly format (e.g., "750ml" -> "750ml")
  const sizeSlug = size.toLowerCase()

  return `${baseSlug}-${vintage}-${sizeSlug}`
}
