'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { detectLocaleFromPath, Locale, routeMappings } from '@/utilities/routeMappings'
import { cn } from '@/utilities/ui'

interface CollectionLinkProps {
  collection: string
  title: string
  slug: string | { [key: string]: string }
  language?: string
  className?: string
  children?: React.ReactNode
  showHashtag?: boolean
}

export default function CollectionLink({
  collection,
  title,
  slug,
  language,
  className,
  children,
  showHashtag,
}: CollectionLinkProps) {
  const pathname = usePathname()
  const resolvedLanguage: Locale = (language as Locale) || detectLocaleFromPath(pathname)

  // Find the route segment for this collection in the current language
  const routeSegment = Object.entries(routeMappings).find(
    ([_, mapping]) => mapping.collection === collection,
  )?.[1]?.[resolvedLanguage]

  if (!routeSegment) {
    console.error('Could not find route segment for collection:', collection)
    return null
  }

  // Handle slug resolution with better fallback logic
  let resolvedSlug = ''
  if (typeof slug === 'object') {
    // Try to get the slug in the current language
    const currentLangSlug = slug[resolvedLanguage]
    if (currentLangSlug) {
      resolvedSlug = currentLangSlug
    } else {
      // If not found, try the other language
      const otherLanguage = resolvedLanguage === 'en' ? 'sl' : 'en'
      const otherLangSlug = slug[otherLanguage]
      if (otherLangSlug) {
        resolvedSlug = otherLangSlug
      } else {
        // If still not found, use the first available slug
        const firstSlug = Object.values(slug)[0]
        if (firstSlug) {
          resolvedSlug = firstSlug
        }
      }
    }
  } else {
    resolvedSlug = slug
  }

  if (!resolvedSlug) {
    return (
      <span className={cn(className)}>
        {showHashtag && <span className="text-xs">#</span>}
        {children || (showHashtag ? title.toLowerCase() : title)}
      </span>
    )
  }

  // For hashtags, just replace spaces with hyphens and make lowercase
  const finalSlug = showHashtag
    ? resolvedSlug
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, '') // Remove any non-alphanumeric characters except hyphens
    : resolvedSlug

  const href =
    resolvedLanguage === 'en' ? `/en/${routeSegment}/${finalSlug}` : `/${routeSegment}/${finalSlug}`

  return (
    <Link href={href} className={cn(' hover:text-foreground link-container', className)}>
      {showHashtag && <span className="text-xs">#</span>}
      {children || (showHashtag ? title.toLowerCase().replace(/\s+/g, '-') : title)}
    </Link>
  )
}
