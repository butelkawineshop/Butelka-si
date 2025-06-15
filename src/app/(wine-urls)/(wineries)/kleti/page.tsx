import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SlovenianWineriesPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="wineries"
      description="Raziskujte našo zbirko kleti"
      locale="sl"
      searchParams={await searchParams}
    />
  )
}
