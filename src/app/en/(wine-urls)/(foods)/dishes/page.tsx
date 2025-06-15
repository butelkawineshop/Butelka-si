import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EnglishFoodsPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="foods"
      description="Explore dishes"
      locale="en"
      searchParams={await searchParams}
    />
  )
}
