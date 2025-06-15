import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EnglishStylesPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="styles"
      description="Explore wines from different styles"
      locale="en"
      searchParams={await searchParams}
    />
  )
}
