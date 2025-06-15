import { getServerSideSitemap } from 'next-sitemap'
import { unstable_cache } from 'next/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // revalidate every hour

interface WineSitemapItem {
  slug: {
    en: string
    sl: string
  }
  updatedAt: string
}

const getWinesSitemap = unstable_cache(
  async () => {
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/wines?${new URLSearchParams({
        depth: '0',
        limit: '1000',
        where: JSON.stringify({
          _status: {
            equals: 'published',
          },
        }),
        select: JSON.stringify({
          'slug.en': true,
          'slug.sl': true,
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

    const sitemap = docs
      ? docs
          .filter((wine: WineSitemapItem) => Boolean(wine?.slug?.en || wine?.slug?.sl))
          .flatMap((wine: WineSitemapItem) => [
            {
              loc: `${SITE_URL}/en/wineshop/${wine?.slug?.en}`,
              lastmod: wine.updatedAt || dateFallback,
            },
            {
              loc: `${SITE_URL}/vinoteka/${wine?.slug?.sl}`,
              lastmod: wine.updatedAt || dateFallback,
            },
          ])
      : []

    return sitemap
  },
  ['wines-sitemap'],
  {
    tags: ['wines-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getWinesSitemap()

  return getServerSideSitemap(sitemap)
} 