'use client'

import type { WineVariant } from '@butelkawineshop/types'
import { usePathname } from 'next/navigation'
import { detectLocaleFromPath } from '@/utilities/routeMappings'
import { getSafeSlug } from '@/utilities/getSafeSlug'
import CollectionLink from '@/components/WineCard/components/CollectionLink'
import { DescriptionToggle } from '../DescriptionToggle'
import { TitleBar } from './components/TitleBar'
import { Icon } from '@/components/Icon'
import { IconActive } from '@/components/IconActive'

import { TastingNotes } from './components/TastingNotes'

import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import { useRef, useState } from 'react'
import 'swiper/css'
import { CartButton } from '@/components/Cart/CartButton'
import { useToast } from '@/components/ui/toast'
import Image from 'next/image'

interface WineCardProps {
  variant: WineVariant
  discountedPrice?: number
}

export default function WineCard({ variant, discountedPrice }: WineCardProps) {
  const pathname = usePathname()
  const language = detectLocaleFromPath(pathname)
  const swiperRef = useRef<{ swiper: SwiperType }>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const { toast } = useToast()

  const wine = typeof variant.wine === 'object' && variant.wine ? variant.wine : null
  const style = wine && typeof wine.style === 'object' && wine.style ? wine.style : null
  const region = wine && typeof wine.region === 'object' && wine.region ? wine.region : null
  const country =
    region && typeof region.general.country === 'object' && region.general.country
      ? region.general.country
      : null
  const grapeVariety =
    variant.composition?.grapeVarieties &&
    typeof variant.composition.grapeVarieties[0] === 'object' &&
    variant.composition.grapeVarieties[0].variety &&
    typeof variant.composition.grapeVarieties[0].variety === 'object'
      ? variant.composition.grapeVarieties[0].variety
      : null

  if (!wine) return null

  const formattedPrice = variant?.details?.price?.toFixed(2).replace('.', ',') || '0,00'
  const formattedDiscountedPrice = discountedPrice?.toFixed(2).replace('.', ',')
  const hasDiscount =
    discountedPrice !== undefined && discountedPrice < (variant?.details?.price || 0)

  // Build wine detail link (same as TitleBar)
  const wineSlug = wine?.slug || {}
  const wineDetailUrl = `/${language}/vino/${getSafeSlug(wineSlug, language)}?variant=${variant.id}`

  const handleShareWine = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + wineDetailUrl)
      toast({
        title: 'Povezava do vina',
        description: 'Povezava do tega vina je bila kopirana v odložišče.',
      })
    } catch (_err) {
      toast({
        title: 'Napaka',
        description: 'Kopiranje povezave ni uspelo.',
      })
    }
  }

  return (
    <div className="flex flex-col items-center w-full h-full">
      <TitleBar variant={variant} />
      <Swiper
        ref={swiperRef}
        nested={true}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        className="w-full  bg-background"
      >
        <SwiperSlide>
          <div className="w-full flex items-start relative">
            {variant.media?.media && typeof variant.media.media !== 'number' && (
              <div className="w-full overflow-hidden">
                {variant.media?.media &&
                  typeof variant.media.media[0] === 'object' &&
                  'url' in variant.media.media[0] &&
                  typeof variant.media.media[0].url === 'string' && (
                    <Image
                      src={variant.media.media[0].url}
                      alt={wine.title}
                      width={variant.media.media[0].width || 800}
                      height={variant.media.media[0].height || 800}
                      className="object-cover w-full h-full"
                    />
                  )}
                {hasDiscount ? (
                  <div className="absolute w-[300px] top-5 -right-20 rotate-30 z-50 items-center justify-center text-center transform  border rounded px-4 py-1">
                    <div className="flex flex-row items-center justify-center gap-1">
                      <span className="text-3xl md:text-xl font-accent text-white z-50">
                        {formattedDiscountedPrice} €
                      </span>
                      <span className="text-3xl md:text-xl font-accent text-red-300 z-50 line-through">
                        {formattedPrice} €
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="absolute top-5 -right-20 w-[300px] items-center justify-center text-center transform rotate-30 bg-background border border-black px-4 py-1">
                    <span className="text-3xl md:text-xl font-accent">{formattedPrice} €</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="w-full h-full flex ">
            <TastingNotes variant={variant} page={1} />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="w-full h-full flex ">
            <TastingNotes variant={variant} page={2} />
          </div>
        </SwiperSlide>
      </Swiper>
      <div className="bg-background flex flex-col w-full">
        {/* Actions */}
        <div className="grid grid-cols-3 w-full py-2 px-1">
          <div className="flex items-center">
            <div className="flex gap-2">
              <button className="icon-container rounded-full p-1">
                <IconActive name="like" />
              </button>
              <button onClick={handleShareWine} className="icon-container rounded-full p-1">
                <Icon name="share" />
              </button>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="flex gap-2">
              <button
                onClick={() => swiperRef.current?.swiper?.slideTo(0)}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  activeIndex === 0 ? 'bg-other-bg' : 'bg-foreground/20'
                }`}
              />
              <button
                onClick={() => swiperRef.current?.swiper?.slideTo(1)}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  activeIndex === 1 ? 'bg-other-bg' : 'bg-foreground/20'
                }`}
              />
              <button
                onClick={() => swiperRef.current?.swiper?.slideTo(2)}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  activeIndex === 2 ? 'bg-other-bg' : 'bg-foreground/20'
                }`}
              />
            </div>
          </div>
          <div className="flex justify-end items-center">
            <CartButton wineVariantId={variant.id} />
          </div>
        </div>

        {/* Description based on active slide */}
        <div className="px-2 pb-2 w-full">
          <DescriptionToggle description={wine?.description} />
          <div className="flex flex-row gap-1 text-sm md:text-xs text-foreground/60 lowercase">
            {region && (
              <CollectionLink
                key="region"
                collection="regions"
                showHashtag={true}
                title={region.title ?? ''}
                slug={getSafeSlug(region.slug, language)}
                language={language}
              />
            )}
            {country && (
              <CollectionLink
                key="country"
                collection="wineCountries"
                showHashtag={true}
                title={country.title ?? ''}
                slug={getSafeSlug(country.slug, language)}
                language={language}
              />
            )}
            {style && (
              <CollectionLink
                key="style"
                collection="styles"
                showHashtag={true}
                title={style.title ?? ''}
                slug={getSafeSlug(style.slug, language)}
                language={language}
              />
            )}
            {grapeVariety && typeof grapeVariety === 'object' && (
              <CollectionLink
                key="grapeVariety"
                collection="grape-varieties"
                showHashtag={true}
                title={grapeVariety.title ?? ''}
                slug={getSafeSlug(grapeVariety.slug, language)}
                language={language}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
