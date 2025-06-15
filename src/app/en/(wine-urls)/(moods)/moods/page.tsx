import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EnglishMoodsPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="moods"
      description="Explore moods"
      locale="en"
      searchParams={await searchParams}
    />
  )
}
