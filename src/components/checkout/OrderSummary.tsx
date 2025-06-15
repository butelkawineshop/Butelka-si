'use client'

import { useTranslations } from 'next-intl'
import type { WineVariant } from '@butelkawineshop/types'
import { getFullVariantName } from '@/utilities/getFullVariantName'
import Image from 'next/image'
import { detectLocaleFromPath } from '@/utilities/routeMappings'
import { usePathname } from 'next/navigation'
import CollectionLink from '@/components/WineCard/components/CollectionLink'

type OrderSummaryProps = {
  items: Array<{
    variant: number | WineVariant
    quantity: number
    price: number
    id?: string | null
  }>
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export const OrderSummary = ({ items, subtotal, shipping, tax, total }: OrderSummaryProps) => {
  const t = useTranslations('checkout')
  const pathname = usePathname()
  const language = detectLocaleFromPath(pathname)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sl-SI', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((item) => {
          const variant = typeof item.variant === 'number' ? null : item.variant
          const media = variant?.media?.media?.[0]
          const imageUrl = typeof media === 'object' ? media.url : null
          const wine = typeof variant?.wine === 'object' ? variant.wine : null
          const region = typeof wine?.region === 'object' ? wine.region : null
          const country = region?.general?.country
          const regionTitle = region?.title || ''
          const countryTitle = typeof country === 'object' ? country.title : ''

          const uniqueKey = item.id || `${variant?.id}-${item.quantity}-${Math.random()}`

          return (
            <div
              key={uniqueKey}
              className="rounded-md bg-muted/10 flex gap-3 border border-border pr-2"
            >
              <div className="w-20 h-20 flex-shrink-0 relative">
                {imageUrl && variant && wine && (
                  <CollectionLink
                    collection="wines"
                    slug={wine.slug || ''}
                    language={language}
                    title={getFullVariantName(variant) || ''}
                    className="relative block w-full h-full"
                  >
                    <Image
                      src={imageUrl}
                      alt={getFullVariantName(variant)}
                      fill
                      sizes="80px"
                      className="object-cover rounded-lg scale-105"
                    />
                  </CollectionLink>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div>
                  <h3 className="text-base font-medium leading-tight">
                    {variant && wine && (
                      <CollectionLink
                        collection="wines"
                        slug={wine.slug || ''}
                        language={language}
                        title={wine.title || ''}
                      >
                        {wine.winery && typeof wine.winery === 'object'
                          ? wine.winery.title + ', '
                          : ''}
                        {wine.title || ''}, {variant.vintage}, {variant.size}ml
                      </CollectionLink>
                    )}
                  </h3>
                  <p className="text-sm text-foreground/60">
                    {regionTitle}
                    {countryTitle ? `, ${countryTitle}` : ''}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground/60">
                      {formatPrice(variant?.details?.price || 0)} x {item.quantity}
                    </p>
                  </div>
                  <p className="text-base font-medium text-right w-20">
                    {formatPrice((variant?.details?.price || 0) * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-base">
          <span className="text-foreground/70">{t('summary.subtotal')}</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-base">
          <span className="text-foreground/70">{t('summary.shipping')}</span>
          <span>{shipping === 0 ? t('summary.free') : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between text-base">
          <span className="text-foreground/70">{t('summary.tax')}</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="h-px bg-foreground/10 my-2" />
        <div className="flex justify-between text-lg font-medium">
          <span>{t('summary.total')}</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
