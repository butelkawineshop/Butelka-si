import type { Locale } from '@/utilities/routeMappings'

export const resolveLocale = (locale: string): Locale => {
  // Default to 'sl' if the provided locale is not supported
  return (locale === 'en' ? 'en' : 'sl') as Locale
}
