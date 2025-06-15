import type { Locale } from './routeMappings'
import { routeMappings } from './routeMappings'
import type {
  Region,
  WineCountry,
  Winery,
  GrapeVariety,
  Tag,
  Aroma,
  Style,
  Mood,
  Food,
  Climate,
} from '@butelkawineshop/types'

interface NavigationItem {
  title: string
  href: string
}

export function getMainNavigationItems(locale: Locale): NavigationItem[] {
  return [
    {
      title: 'wineshop',
      href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.vinoteka[locale]}`,
    },
    {
      title: 'styles',
      href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.stili[locale]}`,
    },
    {
      title: 'moods',
      href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.filing[locale]}`,
    },
    {
      title: 'dishes',
      href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.jedi[locale]}`,
    },
    {
      title: 'regions',
      href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.regije[locale]}`,
    },
    {
      title: 'countries',
      href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.drzave[locale]}`,
    },
    {
      title: 'wineries',
      href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.kleti[locale]}`,
    },
    {
      title: 'grapeVarieties',
      href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.sorte[locale]}`,
    },
    {
      title: 'collections',
      href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.zbirke[locale]}`,
    },
    {
      title: 'aromas',
      href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.arome[locale]}`,
    },
    {
      title: 'climates',
      href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.podnebja[locale]}`,
    },
  ]
}

export function getRegionsNavigationItems(regions: Region[], locale: Locale): NavigationItem[] {
  return regions.map((region) => ({
    title: region.title || '',
    href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.regije[locale]}/${region.slug}`,
  }))
}

export function getCountriesNavigationItems(
  countries: WineCountry[],
  locale: Locale,
): NavigationItem[] {
  return countries.map((country) => ({
    title: country.title || '',
    href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.drzave[locale]}/${country.slug}`,
  }))
}

export function getWineriesNavigationItems(wineries: Winery[], locale: Locale): NavigationItem[] {
  return wineries.map((winery) => ({
    title: winery.title || '',
    href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.kleti[locale]}/${winery.slug}`,
  }))
}

export function getGrapeVarietiesNavigationItems(
  varieties: GrapeVariety[],
  locale: Locale,
): NavigationItem[] {
  return varieties.map((variety) => ({
    title: variety.title || '',
    href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.sorte[locale]}/${variety.slug}`,
  }))
}

export function getTagsNavigationItems(tags: Tag[], locale: Locale): NavigationItem[] {
  return tags.map((tag) => ({
    title: tag.title || '',
    href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.zbirke[locale]}/${tag.slug}`,
  }))
}

export function getAromasNavigationItems(aromas: Aroma[], locale: Locale): NavigationItem[] {
  return aromas.map((aroma) => ({
    title: aroma.title || '',
    href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.arome[locale]}/${aroma.slug}`,
  }))
}

export function getStylesNavigationItems(styles: Style[], locale: Locale): NavigationItem[] {
  return styles.map((style) => ({
    title: style.title || '',
    href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.stili[locale]}/${style.slug}`,
  }))
}

export function getClimatesNavigationItems(climates: Climate[], locale: Locale): NavigationItem[] {
  return climates.map((climate) => ({
    title: climate.title || '',
    href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.podnebja[locale]}/${climate.slug}`,
  }))
}

export function getMoodsNavigationItems(moods: Mood[], locale: Locale): NavigationItem[] {
  return moods.map((mood) => ({
    title: mood.title || '',
    href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.filing[locale]}/${mood.slug}`,
  }))
}

export function getFoodsNavigationItems(foods: Food[], locale: Locale): NavigationItem[] {
  return foods.map((food) => ({
    title: food.title || '',
    href: `/${locale === 'sl' ? '' : 'en/'}${routeMappings.jedi[locale]}/${food.slug}`,
  }))
}
