import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SlovenianFoodsPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="foods"
      description="Raziskujte jedi"
      locale="sl"
      searchParams={await searchParams}
    />
  )
}
