import { getClientSideURL } from '@/utilities/getURL'
import type { CloudflareVariant } from '@/components/Media/types'

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @param variant Optional Cloudflare Images variant
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (
  url: string | null | undefined,
  cacheTag?: string | null,
  variant?: CloudflareVariant,
): string => {
  if (!url) return ''

  // Check if URL already has http/https protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If it's a Cloudflare Images URL and we want a variant
    if (url.includes('imagedelivery.net') && variant) {
      // Remove any existing variant
      const baseUrl = url.split('/').slice(0, -1).join('/')
      return cacheTag ? `${baseUrl}/${variant}?${cacheTag}` : `${baseUrl}/${variant}`
    }
    return cacheTag ? `${url}?${cacheTag}` : url
  }

  // Otherwise prepend client-side URL
  const baseUrl = getClientSideURL()
  return cacheTag ? `${baseUrl}${url}?${cacheTag}` : `${baseUrl}${url}`
}
