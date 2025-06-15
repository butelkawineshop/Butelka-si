import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SlovenianClimatesPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="climates"
      description="Raziskujte klime vina"
      locale="sl"
      searchParams={await searchParams}
    />
  )
}
