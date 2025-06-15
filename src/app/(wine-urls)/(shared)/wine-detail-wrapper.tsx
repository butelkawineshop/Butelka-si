import { Wine, WineVariant, GrapeVariety, Style, WineCountry } from '@butelkawineshop/types'
import { WineDetail } from './wine-detail'

interface WineDetailWrapperProps {
  wine: Wine
  language: 'sl' | 'en'
}

export async function WineDetailWrapper({ wine, language }: WineDetailWrapperProps) {
  // Get all variants for this wine
  const variantsRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/wine-variants?${new URLSearchParams({
      depth: '3',
      locale: language,
      fallbackLocale: language === 'en' ? 'sl' : 'en',
      where: JSON.stringify({
        wine: { equals: wine.id },
      }),
    })}`,
    {
      next: { revalidate: 600 },
    }
  )

  if (!variantsRes.ok) {
    return null
  }

  const { docs: variants } = await variantsRes.json()

  if (!variants.length) {
    return null
  }

  const currentVariant = variants[0] as WineVariant

  // Get all wines for related wines
  const allWinesRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/wines?${new URLSearchParams({
      depth: '3',
      locale: language,
      fallbackLocale: language === 'en' ? 'sl' : 'en',
      where: JSON.stringify({
        or: [
          // Get wines from same or related wineries
          {
            and: [
              {
                id: {
                  not_equals: wine.id,
                },
              },
              {
                or: [
                  {
                    winery: {
                      equals: typeof wine.winery === 'object' ? wine.winery.id : wine.winery,
                    },
                  },
                  {
                    winery: {
                      in:
                        typeof wine.winery === 'object' && wine.winery.social?.relatedWineries
                          ? wine.winery.social.relatedWineries.map((rw) =>
                              typeof rw === 'object' ? rw.id : rw,
                            )
                          : [],
                    },
                  },
                ],
              },
            ],
          },
          // Get wines from same or related regions
          {
            and: [
              {
                id: {
                  not_equals: wine.id,
                },
              },
              {
                or: [
                  {
                    region: {
                      equals: typeof wine.region === 'object' ? wine.region.id : wine.region,
                    },
                  },
                  {
                    region: {
                      in:
                        typeof wine.region === 'object' && wine.region.general?.neighbours
                          ? wine.region.general.neighbours.map((rr) =>
                              typeof rr === 'object' ? rr.id : rr,
                            )
                          : [],
                    },
                  },
                ],
              },
            ],
          },
          // Get wines with similar grape varieties
          {
            and: [
              {
                id: {
                  not_equals: wine.id,
                },
              },
              {
                'variants.composition.grapeVarieties.variety': {
                  in:
                    currentVariant.composition?.grapeVarieties
                      ?.filter((gv) => typeof gv !== 'number' && typeof gv.variety !== 'number')
                      .map((gv) => (gv.variety as GrapeVariety).id) || [],
                },
              },
            ],
          },
          // Get wines in similar price range
          {
            and: [
              {
                id: {
                  not_equals: wine.id,
                },
              },
              {
                'variants.details.price': {
                  greater_than_equal: Math.floor(currentVariant.details?.price * 0.8),
                  less_than_equal: Math.ceil(currentVariant.details?.price * 1.2),
                },
              },
            ],
          },
        ],
      }),
    })}`,
    {
      next: { revalidate: 600 },
    }
  )

  if (!allWinesRes.ok) {
    return null
  }

  const { docs: allWines } = await allWinesRes.json()

  // Fetch all wine-variants to hydrate allWines with actual variant docs
  const wineVariantsRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/wine-variants?${new URLSearchParams({
      depth: '3',
      limit: '999',
      locale: language,
      fallbackLocale: language === 'en' ? 'sl' : 'en',
      where: JSON.stringify({
        wine: {
          in: allWines.map((wine: Wine) => wine.id),
        },
      }),
    })}`,
    {
      next: { revalidate: 600 },
    }
  )

  if (!wineVariantsRes.ok) {
    return null
  }

  const wineVariants = await wineVariantsRes.json()

  // Fetch all related collections with proper localization
  const [stylesRes, countriesRes] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/styles?${new URLSearchParams({
        depth: '2',
        locale: language,
        fallbackLocale: language === 'en' ? 'sl' : 'en',
        where: JSON.stringify({
          id: {
            in: [
              // Include main wine's style
              typeof wine.style === 'object' ? wine.style.id : wine.style,
              // Include related wines' styles
              ...allWines
                .map((wine: Wine) => (typeof wine.style === 'object' ? wine.style.id : wine.style))
                .filter(Boolean),
            ].filter(Boolean),
          },
        }),
      })}`,
      {
        next: { revalidate: 600 },
      }
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/wineCountries?${new URLSearchParams({
        depth: '2',
        locale: language,
        fallbackLocale: language === 'en' ? 'sl' : 'en',
        where: JSON.stringify({
          id: {
            in: [
              // Include main wine's country
              typeof wine.region === 'object' && typeof wine.region.general?.country === 'object'
                ? wine.region.general.country.id
                : null,
              // Include related wines' countries
              ...allWines
                .map((wine: Wine) =>
                  typeof wine.region === 'object' && typeof wine.region.general?.country === 'object'
                    ? wine.region.general.country.id
                    : null,
                )
                .filter(Boolean),
            ].filter(Boolean),
          },
        }),
      })}`,
      {
        next: { revalidate: 600 },
      }
    ),
  ])

  if (!stylesRes.ok || !countriesRes.ok) {
    return null
  }

  const [styles, countries] = await Promise.all([stylesRes.json(), countriesRes.json()])

  // Create maps for quick lookup
  const styleMap = new Map(styles.docs.map((style: Style) => [style.id, style]))
  const countryMap = new Map(countries.docs.map((country: WineCountry) => [country.id, country]))

  // Hydrate the main wine with localized styles and countries
  const hydratedMainWine = {
    ...wine,
    style: typeof wine.style === 'object' ? styleMap.get(wine.style.id) || wine.style : wine.style,
    region:
      typeof wine.region === 'object'
        ? {
            ...wine.region,
            general: {
              ...wine.region.general,
              country:
                typeof wine.region.general?.country === 'object'
                  ? countryMap.get(wine.region.general.country.id) || wine.region.general.country
                  : wine.region.general?.country,
            },
          }
        : wine.region,
  }

  // Hydrate the wines with localized styles and countries
  const hydratedWines = allWines.map((wine: Wine) => ({
    ...wine,
    style: typeof wine.style === 'object' ? styleMap.get(wine.style.id) || wine.style : wine.style,
    region:
      typeof wine.region === 'object'
        ? {
            ...wine.region,
            general: {
              ...wine.region.general,
              country:
                typeof wine.region.general?.country === 'object'
                  ? countryMap.get(wine.region.general.country.id) || wine.region.general.country
                  : wine.region.general?.country,
            },
          }
        : wine.region,
  }))

  const variantMap = new Map<string, WineVariant[]>()
  for (const variant of wineVariants.docs) {
    const wineId =
      typeof variant.wine === 'string'
        ? variant.wine
        : typeof variant.wine === 'object' && variant.wine
          ? String(variant.wine.id)
          : String(variant.wine)
    if (!variantMap.has(wineId)) {
      variantMap.set(wineId, [])
    }
    variantMap.get(wineId)?.push(variant as WineVariant)
  }

  const allWinesWithVariants = hydratedWines.map((wine: Wine) => ({
    ...wine,
    variants: {
      docs: variantMap.get(String(wine.id)) || [],
    },
  }))

  return (
    <WineDetail
      wine={hydratedMainWine as Wine}
      variants={variants as WineVariant[]}
      allWines={allWinesWithVariants as Wine[]}
      language={language}
    />
  )
}
