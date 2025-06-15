import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SlovenianStylesPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="styles"
      description="Odkrijte različne stile vina"
      locale="sl"
      searchParams={await searchParams}
    />
  )
}
