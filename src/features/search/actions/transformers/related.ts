import type { Media } from '@butelkawineshop/types'
import type { RelatedItem } from '../../types'
import { getImage } from './media'

export const transformRelatedItem = (item: {
  id: number | string
  title?: string
  slug?: string
  meta?: { image?: Media | number | null }
}): RelatedItem => ({
  id: String(item.id),
  title: item.title || '',
  slug: item.slug || '',
  meta: {
    title: item.title || null,
    description: null,
    image: getImage(item.meta?.image),
  },
}) 