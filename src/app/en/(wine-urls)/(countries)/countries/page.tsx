import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EnglishCountriesPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="wineCountries"
      description="Explore wines from different countries"
      locale="en"
      searchParams={await searchParams}
    />
  )
}
