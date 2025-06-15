import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EnglishRegionsPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="regions"
      description="Explore different regions"
      locale="en"
      searchParams={await searchParams}
    />
  )
}
