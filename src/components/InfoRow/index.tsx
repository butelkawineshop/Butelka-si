import { IconColor } from '@/components/IconColor'
import CollectionLink from '@/components/WineCard/components/CollectionLink'
import { Tooltip } from '@/components/Tooltip/Tooltip'

interface InfoRowProps {
  icon: string
  value?: string | number
  collection?: string
  title?: string
  slug?: Record<string, string> | string
  language: string
  tooltipKey?: string
}

export function InfoRow({
  icon,
  value,
  collection,
  title,
  slug,
  language,
  tooltipKey,
}: InfoRowProps) {
  return (
    <Tooltip translationKey={tooltipKey || ''}>
      <div className="flex justify-between group">
        <span className="text-foreground/60 flex items-center gap-2">
          <IconColor name={icon} className="w-4 h-4" />
        </span>
        {collection && title && slug ? (
          <CollectionLink
            collection={collection}
            title={title}
            slug={typeof slug === 'string' ? { [language]: slug } : slug}
            language={language}
          />
        ) : (
          <span>{value}</span>
        )}
      </div>
    </Tooltip>
  )
}
