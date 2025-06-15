import type { Locale } from '@/utilities/routeMappings'
import WineGridClient from './WineGrid.Client'
import type { WineVariant } from '@butelkawineshop/types'

// A minimal recursive type for Payload-style filters
export type Where = {
  [key: string]: unknown | Where;
}

type Props = {
  locale: Locale
  where?: Where
  sort?: string
}

async function fetchWineVariants(locale: Locale, where?: Where, sort?: string) {
  const queryParams = new URLSearchParams({
    depth: '2',
    locale,
    fallbackLocale: locale === 'en' ? 'sl' : 'en',
    sort: sort || 'title',
    limit: '24',
    page: '1',
    ...(where && { where: JSON.stringify(where) }),
  })

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/wine-variants?${queryParams.toString()}`,
    {
      next: { revalidate: 3600 }, // Revalidate every hour
    }
  )

  if (!res.ok) {
    throw new Error('Failed to fetch wine variants')
  }

  return res.json()
}

export default async function WineGrid({ locale, where, sort }: Props) {
  const { docs: wineVariants } = await fetchWineVariants(locale, where, sort)

  return <WineGridClient initialVariants={wineVariants as WineVariant[]} />
}
