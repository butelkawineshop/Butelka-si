import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EnglishWineriesPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="wineries"
      description="Explore our collection of wineries"
      locale="en"
      searchParams={await searchParams}
    />
  )
}
