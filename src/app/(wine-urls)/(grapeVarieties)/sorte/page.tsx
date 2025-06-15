import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function GrapeVarietiesListPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="grape-varieties"
      description="Raziskujte našo zbirko sort"
      locale="sl"
      searchParams={await searchParams}
    />
  )
}
