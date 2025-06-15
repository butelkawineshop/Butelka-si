import WineList from '@/app/(wine-urls)/(shared)/wine-list'

type PageProps = {
  params: Promise<{ [key: string]: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function WinePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  return <WineList searchParams={resolvedSearchParams} />
}
