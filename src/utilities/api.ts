import { getClientSideURL } from './getURL'

export const fetchFromAPI = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(`${getClientSideURL()}/api/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`)
  }

  return response.json()
}

export const fetchPosts = async (page = 1, limit = 10) => {
  return fetchFromAPI(`posts?page=${page}&limit=${limit}`)
}

export const fetchPostBySlug = async (slug: string) => {
  return fetchFromAPI(`posts/${slug}`)
}

export const fetchPages = async () => {
  return fetchFromAPI('pages')
}

export const fetchPageBySlug = async (slug: string) => {
  return fetchFromAPI(`pages/${slug}`)
}
