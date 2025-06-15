import ListTemplate from '@/app/(wine-urls)/(shared)/list-template'

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EnglishAromasPage({ searchParams }: PageProps) {
  return (
    <ListTemplate
      collection="aromas"
      description="Explore wines from different aromas"
      locale="en"
      searchParams={await searchParams}
    />
  )
}
