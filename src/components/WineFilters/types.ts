export type CollectionItem = {
  id: string
  title: string
  slug: string
}

export type CollectionDoc = {
  id: string | number
  title?: string
  slug?: string
  [key: string]: any
} 