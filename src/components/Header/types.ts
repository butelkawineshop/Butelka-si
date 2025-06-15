import type { Media } from '@butelkawineshop/types'

export type SearchResultType =
  | 'aroma'
  | 'climate'
  | 'food'
  | 'grapeVariety'
  | 'mood'
  | 'region'
  | 'tag'
  | 'wineCountry'
  | 'winery'
  | 'wineVariant'

export type RelatedItem = {
  id: string
  title: string
  slug: string
  meta: {
    title: string | null
    description: string | null
    image: Media | null | undefined
  }
}

export type SearchResult = {
  id: string
  title: string
  slug: string
  media?:
    | {
        media?: Media | Media[] | null | undefined
      }
    | undefined
  description?: string | null
  type: SearchResultType
  similarVarieties?: RelatedItem[]
  neighbours?: RelatedItem[]
  regions?: RelatedItem[]
  similarWineries?: RelatedItem[]
  wine?:
    | {
        title: string
        media?:
          | {
              media?: Media | Media[] | null | undefined
            }
          | undefined
        winery?:
          | {
              title: string
              media?:
                | {
                    media?: Media | Media[] | null | undefined
                  }
                | undefined
            }
          | undefined
        region?:
          | {
              title: string
              media?:
                | {
                    media?: Media | Media[] | null | undefined
                  }
                | undefined
              general?:
                | {
                    country?:
                      | {
                          title: string
                          media?:
                            | {
                                media?: Media | Media[] | null | undefined
                              }
                            | undefined
                        }
                      | undefined
                  }
                | undefined
            }
          | undefined
      }
    | undefined
  vintage?: string | null
  size?: string | null
}
