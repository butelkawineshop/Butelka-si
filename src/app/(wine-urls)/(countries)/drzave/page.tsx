import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SlovenianCountriesPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="wineCountries"
      description="Raziskujte vina iz različnih držav"
      locale="sl"
      searchParams={await searchParams}
    />
  )
}
