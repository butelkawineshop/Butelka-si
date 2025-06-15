import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'
import type { Post } from '@butelkawineshop/types'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://butelka-admin.up.railway.app'
  const res = await fetch(`${apiUrl}/api/posts?limit=1000&select=slug`, {
    next: { revalidate: 600 },
  })
  if (!res.ok) return []
  const posts = await res.json()
  return posts.docs.map(({ slug }: { slug: string }) => ({ slug }))
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const post = await queryPostBySlug({ slug, draft })

  if (!post) return notFound()

  return (
    <article className="pt-16 pb-16">
      <PageClient />
      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <RichText className="max-w-[48rem] mx-auto" content={post.markdown || ''} />
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const post = await queryPostBySlug({ slug, draft: false })
  if (!post) return { title: 'Not found' }
  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug, draft = false }: { slug: string; draft?: boolean }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://butelka-admin.up.railway.app'
  const queryParams = new URLSearchParams({
    where: JSON.stringify({ slug: { equals: slug } }),
    limit: '1',
    draft: draft ? 'true' : 'false',
    depth: '2',
  })
  const res = await fetch(`${apiUrl}/api/posts?${queryParams.toString()}`, {
    next: { revalidate: 600 },
  })
  if (!res.ok) return null
  const result = await res.json()
  return result.docs?.[0] || null
})
