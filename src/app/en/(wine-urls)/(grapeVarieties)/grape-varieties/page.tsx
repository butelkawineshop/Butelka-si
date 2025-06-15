import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EnglishGrapeVarietiesPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="grape-varieties"
      description="Explore our collection of grape varieties"
      locale="en"
      searchParams={await searchParams}
    />
  )
}
