import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EnglishClimatesPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="climates"
      description="Explore wines from different climates"
      locale="en"
      searchParams={await searchParams}
    />
  )
}
