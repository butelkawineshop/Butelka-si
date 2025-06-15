export type Locale = 'sl' | 'en'

export const routeMappings = {
  vinoteka: { sl: 'vinoteka', en: 'wineshop', collection: 'wines' },
  wineshop: { sl: 'vinoteka', en: 'wineshop', collection: 'wines' },

  vino: { sl: 'vino', en: 'wine', collection: 'wines' },
  wine: { sl: 'vino', en: 'wine', collection: 'wines' },

  kleti: { sl: 'kleti', en: 'wineries', collection: 'wineries' },
  wineries: { sl: 'kleti', en: 'wineries', collection: 'wineries' },

  regije: { sl: 'regije', en: 'regions', collection: 'regions' },
  regions: { sl: 'regije', en: 'regions', collection: 'regions' },

  drzave: { sl: 'drzave', en: 'countries', collection: 'wineCountries' },
  countries: { sl: 'drzave', en: 'countries', collection: 'wineCountries' },

  sorte: { sl: 'sorte', en: 'grape-varieties', collection: 'grape-varieties' },
  'grape-varieties': { sl: 'sorte', en: 'grape-varieties', collection: 'grape-varieties' },

  zbirke: { sl: 'zbirke', en: 'collections', collection: 'tags' },
  collections: { sl: 'zbirke', en: 'collections', collection: 'tags' },

  storija: { sl: 'storija', en: 'story', collection: 'pages' },
  story: { sl: 'storija', en: 'story', collection: 'pages' },

  tejstingi: { sl: 'tejstingi', en: 'tastings', collection: 'tastings' },
  tastings: { sl: 'tejstingi', en: 'tastings', collection: 'tastings' },

  'darilni-boni': { sl: 'darilni-boni', en: 'gift-cards', collection: 'gift-cards' },
  'gift-cards': { sl: 'darilni-boni', en: 'gift-cards', collection: 'gift-cards' },

  arome: { sl: 'arome', en: 'aromas', collection: 'aromas' },
  aromas: { sl: 'arome', en: 'aromas', collection: 'aromas' },

  stili: { sl: 'stili', en: 'styles', collection: 'styles' },
  styles: { sl: 'stili', en: 'styles', collection: 'styles' },

  pravno: { sl: 'pravno', en: 'legal', collection: 'pages' },
  legal: { sl: 'pravno', en: 'legal', collection: 'pages' },

  blagajna: { sl: 'blagajna', en: 'checkout', collection: 'pages' },
  checkout: { sl: 'blagajna', en: 'checkout', collection: 'pages' },

  cekar: { sl: 'cekar', en: 'hamper', collection: 'pages' },
  hamper: { sl: 'cekar', en: 'hamper', collection: 'pages' },

  profil: { sl: 'profil', en: 'profile', collection: 'pages' },
  profile: { sl: 'profil', en: 'profile', collection: 'pages' },

  enciklopedija: { sl: 'enciklopedija', en: 'encyclopedia', collection: 'posts' },
  encyclopedia: { sl: 'enciklopedija', en: 'encyclopedia', collection: 'posts' },

  roba: { sl: 'roba', en: 'merch', collection: 'merch' },
  merch: { sl: 'roba', en: 'merch', collection: 'merch' },

  podnebja: { sl: 'podnebja', en: 'climates', collection: 'climates' },
  climates: { sl: 'podnebja', en: 'climates', collection: 'climates' },

  filing: { sl: 'filing', en: 'moods', collection: 'moods' },
  moods: { sl: 'filing', en: 'moods', collection: 'moods' },

  jedi: { sl: 'jedi', en: 'dishes', collection: 'foods' },
  dishes: { sl: 'jedi', en: 'dishes', collection: 'foods' },

  iskanje: { sl: 'iskanje', en: 'search', collection: 'pages' },
  search: { sl: 'iskanje', en: 'search', collection: 'pages' },

  potrditev: { sl: 'potrditev', en: 'confirmation', collection: 'pages' },
  confirmation: { sl: 'potrditev', en: 'confirmation', collection: 'pages' },
} as const

export function getTranslatedSegment(segment: string, targetLocale: Locale): string | null {
  const mapping = routeMappings[segment as keyof typeof routeMappings]
  return mapping?.[targetLocale] ?? null
}

export function getCollectionForRouteSegment(segment: string): string | null {
  const mapping = routeMappings[segment as keyof typeof routeMappings]
  return mapping?.collection ?? null
}

export function detectLocaleFromPath(path: string): Locale {
  return path.startsWith('/en') ? 'en' : 'sl'
}

export function getLocalizedRouteSegment(segment: string, locale: Locale): string {
  return getTranslatedSegment(segment, locale) ?? segment
}

export async function getAlternatePathWithSlug(
  path: string,
  targetLocale: Locale,
  fetchSlugTranslation: (
    slug: string,
    sourceLocale: Locale,
    targetLocale: Locale,
    collection: string,
  ) => Promise<string | null>,
): Promise<string | null> {
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) return null

  if (targetLocale === 'en') {
    if (segments[0] === 'en') return path
    const baseSegment = segments[0]
    const mapping = routeMappings[baseSegment as keyof typeof routeMappings]
    if (!mapping) return null
    const newBase = mapping[targetLocale]
    const collection = mapping.collection
    const originalSlug = segments[1]
    if (!originalSlug) return `/en/${newBase}`
    const translatedSlug = await fetchSlugTranslation(originalSlug, 'sl', 'en', collection)
    if (!translatedSlug) return null
    return `/en/${newBase}/${translatedSlug}`
  }

  if (targetLocale === 'sl') {
    if (segments[0] !== 'en') return path
    const baseSegment = segments[1]
    const mapping = routeMappings[baseSegment as keyof typeof routeMappings]
    if (!mapping) return null
    const newBase = mapping[targetLocale]
    const collection = mapping.collection
    const originalSlug = segments[2]
    if (!originalSlug) return `/${newBase}`
    const translatedSlug = await fetchSlugTranslation(originalSlug, 'en', 'sl', collection)
    if (!translatedSlug) return null
    return `/${newBase}/${translatedSlug}`
  }

  return null
}
