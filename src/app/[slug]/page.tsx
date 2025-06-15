import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { generateMeta } from '@/utilities/generateMeta'
import { headers } from 'next/headers'
import type { Locale } from '@/utilities/routeMappings'
import { notFound } from 'next/navigation'

const queryPage = cache(async (slug: string) => {
  const { isEnabled: draft } = await draftMode()
  const headersList = await headers()
  const resolvedLocale = (headersList.get('x-locale') || 'sl') as Locale

  const queryParams = new URLSearchParams({
    where: JSON.stringify({
      [`slug.${resolvedLocale}`]: {
        equals: slug,
      },
    }),
    limit: '1',
    draft: draft ? 'true' : 'false',
    locale: resolvedLocale,
    fallbackLocale: resolvedLocale === 'en' ? 'sl' : 'en',
  })

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/pages?${queryParams.toString()}`,
    {
      next: { revalidate: 600 },
    }
  )

  if (!res.ok) {
    return null
  }

  const result = await res.json()
  return result.docs?.[0] || null
})

interface PageParams {
  slug: string
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params
  const page = await queryPage(resolvedParams.slug)

  if (!page) {
    return notFound()
  }

  return (
    <article className="pt-16 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{page.title}</h1>
          {page.content && <div dangerouslySetInnerHTML={{ __html: page.content }} />}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const resolvedParams = await params
  const page = await queryPage(resolvedParams.slug)
  if (!page) return { title: 'Not found' }
  return generateMeta({ doc: page })
}
