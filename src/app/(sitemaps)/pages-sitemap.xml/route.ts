import { getServerSideSitemap } from 'next-sitemap'
import { unstable_cache } from 'next/cache'
import type { Page } from '@butelkawineshop/types'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // revalidate every hour

type PageSitemapItem = Pick<Page, 'slug' | 'updatedAt'>

const getPagesSitemap = unstable_cache(
  async () => {
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/pages?${new URLSearchParams({
        depth: '0',
        limit: '1000',
        where: JSON.stringify({
          _status: {
            equals: 'published',
          },
        }),
        select: JSON.stringify({
          slug: true,
          updatedAt: true,
        }),
      })}`,
      {
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) {
      return []
    }

    const { docs } = await res.json()
    const dateFallback = new Date().toISOString()

    const defaultSitemap = [
      {
        loc: `${SITE_URL}/search`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/posts`,
        lastmod: dateFallback,
      },
    ]

    const sitemap = docs
      ? docs
          .filter((page: PageSitemapItem) => Boolean(page?.slug))
          .map((page: PageSitemapItem) => {
            return {
              loc: page?.slug === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${page?.slug}`,
              lastmod: page.updatedAt || dateFallback,
            }
          })
      : []

    return [...defaultSitemap, ...sitemap]
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
