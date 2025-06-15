import { getServerSideSitemap } from 'next-sitemap'
import { unstable_cache } from 'next/cache'
import type { Post } from '@butelkawineshop/types'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // revalidate every hour

type PostSitemapItem = Pick<Post, 'slug' | 'updatedAt'>

const getPostsSitemap = unstable_cache(
  async () => {
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts?${new URLSearchParams({
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

    const sitemap = docs
      ? docs
          .filter((post: PostSitemapItem) => Boolean(post?.slug))
          .map((post: PostSitemapItem) => ({
            loc: `${SITE_URL}/posts/${post?.slug}`,
            lastmod: post.updatedAt || dateFallback,
          }))
      : []

    return sitemap
  },
  ['posts-sitemap'],
  {
    tags: ['posts-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPostsSitemap()

  return getServerSideSitemap(sitemap)
}
