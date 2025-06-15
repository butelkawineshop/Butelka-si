'use client'

import Image from 'next/image'
import { getFullVariantName } from '@/utilities/getFullVariantName'
import type { SharedCart } from '@butelkawineshop/types'
import { AddSharedCartToCart } from './AddSharedCartToCart'

interface SharedCartViewProps {
  cart: SharedCart
  title?: string
}

export function SharedCartView({ cart, title = 'Shared Cart' }: SharedCartViewProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <div className="space-y-4">
        {cart.items?.map((item) => {
          const wineVariant = typeof item.wineVariant === 'object' ? item.wineVariant : null
          return (
            <div key={item.id} className="flex gap-4 p-4 border-b border-other-bg/20">
              {/* Wine Image */}
              <div className="w-20 h-20 flex-shrink-0 bg-gradient-cream dark:bg-gradient-black rounded-lg overflow-hidden">
                {wineVariant?.media?.media &&
                  Array.isArray(wineVariant.media.media) &&
                  wineVariant.media.media[0] &&
                  typeof wineVariant.media.media[0] === 'object' && (
                    <Image
                      src={wineVariant.media.media[0].url || ''}
                      alt={wineVariant.media.media[0].alt || ''}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover border-1 border-other-bg rounded-lg"
                    />
                  )}
              </div>

              {/* Wine Details */}
              <div className="flex-1 flex flex-col justify-between">
                {/* Top Row - Wine Name */}
                <h3 className="font-medium text-sm">
                  {wineVariant
                    ? getFullVariantName(wineVariant)
                    : `Wine Variant #${item.wineVariant}`}
                </h3>

                {/* Bottom Row - Price and Quantity */}
                <div className="flex items-center justify-between mt-2">
                  {/* Price */}
                  {wineVariant?.details?.price && (
                    <p className="text-sm font-medium">
                      €{wineVariant.details.price.toFixed(2).replace('.', ',')}
                    </p>
                  )}

                  {/* Quantity */}
                  <span className="text-sm text-foreground/70">Quantity: {item.quantity}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {cart.items && cart.items.length > 0 && (
        <div className="mt-8">
          <AddSharedCartToCart
            items={cart.items.map((item) => ({
              wineVariant:
                typeof item.wineVariant === 'object' ? item.wineVariant.id : item.wineVariant,
              quantity: item.quantity,
              addedAt: item.addedAt,
            }))}
          />
        </div>
      )}
    </div>
  )
}
