'use client'

import { usePathname } from 'next/navigation'
import { Icon } from '@/components/Icon'
import React from 'react'
import { type Locale, getCollectionForRouteSegment, routeMappings } from '@/utilities/routeMappings'

interface DocumentWithSlug {
  slug: Record<Locale, string>
  [key: string]: unknown
}

export const LanguageSwitcher = () => {
  const pathname = usePathname()
  const currentLocale: Locale = pathname.startsWith('/en') ? 'en' : 'sl'
  const targetLocale: Locale = currentLocale === 'sl' ? 'en' : 'sl'

  const handleClick = async () => {
    try {
      // Handle root path
      if (pathname === '/' || pathname === '/en') {
        const newPath = targetLocale === 'en' ? '/en' : '/'
        document.cookie = `NEXT_LOCALE=${targetLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`
        window.location.href = newPath
        return
      }

      const segments = pathname.split('/').filter(Boolean)
      // Skip route groups (segments in parentheses)
      const validSegments = segments.filter(
        (segment) => !segment.startsWith('(') && !segment.endsWith(')'),
      )

      // Handle paths with no segments
      if (validSegments.length === 0) {
        console.warn('No valid segments found in path:', pathname)
        return
      }

      const base = currentLocale === 'en' ? validSegments[1] : validSegments[0]
      const slug = currentLocale === 'en' ? validSegments[2] : validSegments[1]
      const route = base

      if (!route) {
        console.error('Could not determine route segment for:', pathname)
        return
      }

      // Special case for wine pages - we need to look in the wines collection
      const collection =
        route === 'wine' || route === 'vino' ? 'wines' : getCollectionForRouteSegment(route)
      if (!collection) {
        console.error('Could not determine collection for:', route)
        return
      }

      let translatedSlug: string | null = null

      if (slug) {
        try {
          // Search by exact slug match using local Payload API
          const where = {
            [`slug.${currentLocale}`]: { equals: slug },
          }

          const params = new URLSearchParams()
          params.set('where', JSON.stringify(where))
          params.set('depth', '1')
          params.set('locale', 'all')
          params.set('sort', '-createdAt')
          const url = `/api/${collection}?${params.toString()}`

          const res = await fetch(url)
          if (!res.ok) {
            throw new Error(`API request failed with status ${res.status}`)
          }

          const data = await res.json()

          if (!data.docs || data.docs.length === 0) {
            console.error('No document found with slug', {
              slug,
              currentLocale,
              collection,
            })
            return
          }

          const doc = data.docs.find((doc: DocumentWithSlug) => {
            const docSlug = typeof doc?.slug === 'string' ? doc.slug : doc?.slug?.[currentLocale]
            return docSlug?.toLowerCase?.() === slug.toLowerCase()
          })

          if (!doc) {
            console.error('Exact match for slug not found in returned docs', {
              slug,
              docs: data.docs,
            })
            return
          }

          const slugs = doc.slug
          if (!slugs) {
            console.error('No slug found in document', doc)
            return
          }

          if (!slugs[targetLocale]) {
            console.warn(
              `Translated slug missing for target locale '${targetLocale}', falling back to original slug.`,
              { slugs },
            )
            translatedSlug = slug
          } else {
            translatedSlug = slugs[targetLocale]
          }
        } catch (error) {
          console.error('Slug translation fetch failed:', error)
          translatedSlug = slug // Fallback to original slug if fetch fails
        }
      }

      // Find the translated route segment
      const newBase = Object.entries(routeMappings).find(
        ([, val]) => val[currentLocale] === base && val.collection === collection,
      )?.[1]?.[targetLocale]

      if (!newBase) {
        console.error('Could not find translated route segment for:', base)
        return
      }

      // Construct the new path with the translated slug
      const newPath = `/${targetLocale === 'en' ? 'en/' : ''}${newBase}${translatedSlug ? '/' + translatedSlug : ''}`

      // Set the locale cookie
      document.cookie = `NEXT_LOCALE=${targetLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`

      window.location.href = newPath
    } catch (error) {
      console.error('Language switch failed:', error)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors group cursor-pointer"
      aria-label={`Switch to ${targetLocale === 'en' ? 'English' : 'Slovenščina'}`}
    >
      <Icon name="language" width={12} height={12} />
      <span className="text-xs">{targetLocale === 'en' ? 'English' : 'Slovenščina'}</span>
    </button>
  )
}
