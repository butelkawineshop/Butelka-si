import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SlovenianAromasPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="aromas"
      description="Raziskujte arome vina"
      locale="sl"
      searchParams={await searchParams}
    />
  )
}
