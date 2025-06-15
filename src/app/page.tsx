import { headers } from 'next/headers'
import type { Locale } from '@/utilities/routeMappings'
import CollectionCards from '@/components/CollectionCards'
import { getSafeSlug } from '@/utilities/getSafeSlug'

interface CollectionItem {
  id: string
  title?: string
  slug: Record<string, string>
  media?: {
    media: Array<{
      url: string
      alt?: string
    }> | {
      url: string
      alt?: string
    }
  }
}

export default async function HomePage() {
  const headersList = await headers()
  const resolvedLocale = (headersList.get('x-locale') || 'sl') as Locale

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/wines?${new URLSearchParams({
    depth: '2',
    locale: resolvedLocale,
    fallbackLocale: resolvedLocale === 'en' ? 'sl' : 'en',
    sort: '-createdAt',
    limit: '6',
  })}`

  console.log('Fetching from:', apiUrl)

  // Fetch latest wines
  const res = await fetch(apiUrl, {
    next: { revalidate: 600 },
  })

  if (!res.ok) {
    console.error('Failed to fetch wines:', res.status, res.statusText)
    return (
      <div className="flex flex-col min-h-screen">
        <section className="relative h-[80vh] flex items-center justify-center bg-gradient-cream dark:bg-gradient-black">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {resolvedLocale === 'en' ? 'Welcome to Butelka' : 'Dobrodošli v Butelki'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
              {resolvedLocale === 'en'
                ? 'Discover our carefully curated selection of fine wines'
                : 'Odkrijte naš skrbno izbrani izbor finih vin'}
            </p>
            <a
              href={`/${resolvedLocale}/wines`}
              className="inline-block bg-foreground text-background px-8 py-3 rounded-lg hover:bg-foreground/90 transition-colors"
            >
              {resolvedLocale === 'en' ? 'Explore Wines' : 'Raziskujte vina'}
            </a>
          </div>
        </section>
      </div>
    )
  }

  const data = await res.json()
  console.log('Wines data:', JSON.stringify(data, null, 2))

  const { docs: items } = data

  if (!items || items.length === 0) {
    console.log('No wines found')
    return (
      <div className="flex flex-col min-h-screen">
        <section className="relative h-[80vh] flex items-center justify-center bg-gradient-cream dark:bg-gradient-black">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {resolvedLocale === 'en' ? 'Welcome to Butelka' : 'Dobrodošli v Butelki'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
              {resolvedLocale === 'en'
                ? 'Discover our carefully curated selection of fine wines'
                : 'Odkrijte naš skrbno izbrani izbor finih vin'}
            </p>
            <a
              href={`/${resolvedLocale}/wines`}
              className="inline-block bg-foreground text-background px-8 py-3 rounded-lg hover:bg-foreground/90 transition-colors"
            >
              {resolvedLocale === 'en' ? 'Explore Wines' : 'Raziskujte vina'}
            </a>
          </div>
        </section>
      </div>
    )
  }

  console.log('Processed items:', items.map((item: CollectionItem) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    media: item.media?.media
  })))

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-gradient-cream dark:bg-gradient-black">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {resolvedLocale === 'en' ? 'Welcome to Butelka' : 'Dobrodošli v Butelki'}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            {resolvedLocale === 'en'
              ? 'Discover our carefully curated selection of fine wines'
              : 'Odkrijte naš skrbno izbrani izbor finih vin'}
          </p>
          <a
            href={`/${resolvedLocale}/wines`}
            className="inline-block bg-foreground text-background px-8 py-3 rounded-lg hover:bg-foreground/90 transition-colors"
          >
            {resolvedLocale === 'en' ? 'Explore Wines' : 'Raziskujte vina'}
          </a>
        </div>
      </section>

      {/* Latest Wines Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {resolvedLocale === 'en' ? 'Latest Wines' : 'Najnovejša vina'}
          </h2>
          <CollectionCards
            items={items.map((item: CollectionItem) => ({
              id: item.id,
              title: item.title || '',
              slug: getSafeSlug(item.slug, resolvedLocale),
              media: item.media?.media
                ? {
                    media: Array.isArray(item.media.media) ? item.media.media[0] : item.media.media,
                  }
                : null,
            }))}
            collection="wines"
            locale={resolvedLocale}
            showPagination={false}
          />
        </div>
      </section>
    </div>
  )
}
