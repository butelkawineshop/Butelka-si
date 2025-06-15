import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CollectionsListPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="tags"
      description="Raziskujte naše zbirke vin"
      locale="sl"
      searchParams={await searchParams}
    />
  )
}
