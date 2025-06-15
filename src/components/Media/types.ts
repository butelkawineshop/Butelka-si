import type { StaticImageData } from 'next/image'
import type { ElementType, Ref } from 'react'

import type { Media as MediaType } from '@butelkawineshop/types'

export type CloudflareVariant = 
  | 'card'      // 768x576
  | 'feature'   // 1366x768
  | 'hero'      // 1920x1080
  | 'public'    // 1920x1080
  | 'square'    // 800x800
  | 'thumbnail' // 400x300
  | 'winecards' // 400x400

export interface Props {
  alt?: string
  className?: string
  fill?: boolean // for NextImage only
  htmlElement?: ElementType | null
  pictureClassName?: string
  imgClassName?: string
  onClick?: () => void
  onLoad?: () => void
  loading?: 'lazy' | 'eager' // for NextImage only
  priority?: boolean // for NextImage only
  ref?: Ref<HTMLImageElement | null>
  resource?: MediaType | string | number | null // for Payload media
  size?: string // for NextImage only
  src?: StaticImageData // for static media
  variant?: CloudflareVariant // which Cloudflare variant to use
}
