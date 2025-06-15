const PAYLOAD_API_URL = process.env.NEXT_PUBLIC_PAYLOAD_API_URL || 'https://butelka-admin.up.railway.app'

export const payloadClient = {
  async find<T>({
    collection,
    where = {},
    depth = 0,
    page = 1,
    limit = 10,
    sort = '-createdAt',
    locale = 'all',
  }: {
    collection: string
    where?: Record<string, unknown>
    depth?: number
    page?: number
    limit?: number
    sort?: string
    locale?: string
  }) {
    const params = new URLSearchParams({
      depth: depth.toString(),
      page: page.toString(),
      limit: limit.toString(),
      sort,
      locale,
    })

    if (Object.keys(where).length > 0) {
      params.set('where', JSON.stringify(where))
    }

    const response = await fetch(`${PAYLOAD_API_URL}/api/${collection}?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${collection}: ${response.statusText}`)
    }

    return response.json() as Promise<{
      docs: T[]
      totalDocs: number
      totalPages: number
      page: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }>
  },

  async findBySlug<T>({
    collection,
    slug,
    depth = 0,
    locale = 'all',
  }: {
    collection: string
    slug: string
    depth?: number
    locale?: string
  }) {
    const params = new URLSearchParams({
      depth: depth.toString(),
      locale,
      where: JSON.stringify({
        slug: {
          equals: slug,
        },
      }),
    })

    const response = await fetch(`${PAYLOAD_API_URL}/api/${collection}?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${collection} by slug: ${response.statusText}`)
    }

    const data = await response.json()
    return data.docs[0] as T
  },

  async findOne<T>({
    collection,
    where = {},
    depth = 0,
    locale = 'all',
  }: {
    collection: string
    where?: Record<string, unknown>
    depth?: number
    locale?: string
  }) {
    const params = new URLSearchParams({
      depth: depth.toString(),
      locale,
      limit: '1',
      where: JSON.stringify(where),
    })

    const response = await fetch(`${PAYLOAD_API_URL}/api/${collection}?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${collection}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.docs[0] as T
  },
} 