import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import React from 'react'
import PageClient from './page.client'
import type { CardPostData } from '@/components/Card'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const queryParams = new URLSearchParams({
    depth: '1',
    limit: '12',
    select: JSON.stringify({
      title: true,
      slug: true,
      categories: true,
      meta: true,
    }),
  })

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts?${queryParams.toString()}`, {
    next: { revalidate: 600 },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch posts')
  }

  const posts = await res.json()

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Posts</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs as CardPostData[]} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Posts',
}
