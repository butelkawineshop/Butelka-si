import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SlovenianMoodsPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="moods"
      description="Raziskujte filinge"
      locale="sl"
      searchParams={await searchParams}
    />
  )
}
