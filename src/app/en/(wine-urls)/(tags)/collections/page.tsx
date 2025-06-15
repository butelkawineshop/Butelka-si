import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EnglishCollectionsPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="tags"
      description="Explore our collections"
      locale="en"
      searchParams={await searchParams}
    />
  )
}
