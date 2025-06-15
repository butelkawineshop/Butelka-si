import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function RegionsListPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="regions"
      description="Raziskujte vina iz različnih regij"
      locale="sl"
      searchParams={await searchParams}
    />
  )
}
