import type { Media } from '@butelkawineshop/types'

export const getImage = (image: number | Media | null | undefined): Media | null | undefined => {
  if (typeof image === 'number') return null
  return image
}

export const transformMedia = (
  media: { media?: (number | Media)[] | number | Media | null | undefined } | null | undefined,
): { media?: Media | Media[] | null | undefined } | undefined => {
  if (!media?.media) return undefined
  if (Array.isArray(media.media)) {
    const filteredMedia = media.media
      .map((m) => getImage(m))
      .filter((m): m is Media => m !== null && m !== undefined)
    return filteredMedia.length > 0 ? { media: filteredMedia } : undefined
  }
  const singleMedia = getImage(media.media)
  return singleMedia ? { media: singleMedia } : undefined
} 