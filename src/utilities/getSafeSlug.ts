import type { Locale } from '@/utilities/routeMappings'

export function getSafeSlug(slug: unknown, language: Locale = 'sl'): string {
  if (!slug) return ''
  if (typeof slug === 'string') return slug
  if (typeof slug === 'object' && slug !== null) {
    const localized = slug as Record<string, string>
    return localized[language] || localized['sl'] || ''
  }
  return ''
}
