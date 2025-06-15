'use client'

import type { WineVariant } from '@butelkawineshop/types'
import { IconColor } from '@/components/IconColor'
import CollectionLink from './CollectionLink'
import { usePathname } from 'next/navigation'
import { detectLocaleFromPath } from '@/utilities/routeMappings'

interface TitleBarProps {
  variant: WineVariant
}

export function TitleBar({ variant }: TitleBarProps) {
  const pathname = usePathname()
  const language = detectLocaleFromPath(pathname)

  // Get wine information
  const wine = typeof variant.wine !== 'number' ? variant.wine : null
  const winery = wine?.winery && typeof wine.winery !== 'number' ? wine.winery : null
  const style = wine?.style && typeof wine.style !== 'number' ? wine.style : null
  if (!wine) return null

  return (
    <div className="flex w-full py-2  px-2 gap-2 items-center justify-start text-sm relative z-10 bg-background rounded-t-lg">
      <div className="icon-container rounded-full group border border-other-bg/40 bg-gradient-cream dark:bg-gradient-black p-1">
        <CollectionLink
          collection="styles"
          title={style?.title ?? ''}
          slug={style?.slug || {}}
          language={language}
        >
          <IconColor name={style?.iconKey ?? 'red'} className="w-10 h-10 flex" />
        </CollectionLink>
      </div>
      <div className="flex flex-col w-full">
        <CollectionLink
          collection="wines"
          title={wine?.title ?? ''}
          slug={wine?.slug || {}}
          language={language}
        >
          <h3 className="line-clamp-2 text-left text-lg md:text-sm font-accent lowercase hover:text-foreground transition-colors">
            {wine?.title}
          </h3>
        </CollectionLink>
        <div className="flex flex-row gap-1 justify-between w-full text-base md:text-xs text-foreground/90">
          <CollectionLink
            collection="wineries"
            title={winery?.title ?? ''}
            slug={winery?.slug || {}}
            language={language}
          >
            <p className="hover:text-foreground transition-colors">{winery?.title}</p>
          </CollectionLink>
          <p className="">
            {variant.size}ml - {variant.vintage}
          </p>
        </div>
      </div>
    </div>
  )
}
