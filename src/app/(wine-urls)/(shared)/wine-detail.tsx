'use client'

import type { Wine, WineVariant, GrapeVariety } from '@butelkawineshop/types'
import CollectionLink from '@/components/WineCard/components/CollectionLink'
import RichText from '@/components/RichText'
import { Icon } from '@/components/Icon'
import { IconActive } from '@/components/IconActive'
import { useState, useEffect, useRef } from 'react'
import { TastingNotes } from '@/components/WineCard/components/TastingNotes'
import { Accordion } from '@/components/Accordion'
import { useTranslations } from 'next-intl'
import { InfoRow } from '@/components/InfoRow'
import { RelatedWines } from '@/components/RelatedWines'
import { CartButton } from '@/components/Cart/CartButton'
import Image from 'next/image'

interface WineDetailProps {
  wine: Wine
  variants: WineVariant[]
  allWines: Wine[]
  language: 'sl' | 'en'
}

type AccordionSection = 'description' | 'tasting' | 'food' | null

export function WineDetail({ wine, variants, allWines, language }: WineDetailProps) {
  const t = useTranslations('wine.detail')
  const [selectedVariant, setSelectedVariant] = useState<WineVariant | undefined>(variants[0])
  const [isVariantOpen, setIsVariantOpen] = useState(false)
  const [openSection, setOpenSection] = useState<AccordionSection>('description')
  const [isEndOfContent, setIsEndOfContent] = useState(false)
  const endOfContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) {
          setIsEndOfContent(entry.isIntersecting)
        }
      },
      {
        threshold: 0,
        rootMargin: '100px',
      },
    )

    const currentRef = endOfContentRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  // Get related information
  const winery = wine.winery && typeof wine.winery !== 'number' ? wine.winery : null
  const region = wine.region && typeof wine.region !== 'number' ? wine.region : null
  const style = wine.style && typeof wine.style !== 'number' ? wine.style : null
  const country =
    region?.general?.country && typeof region.general.country !== 'number'
      ? region.general.country
      : null

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8 w-full items-center justify-center text-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Media */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="aspect-square bg-gradient-cream dark:bg-gradient-black rounded-lg overflow-hidden">
                {selectedVariant?.media?.media &&
                  Array.isArray(selectedVariant.media.media) &&
                  selectedVariant.media.media[0] &&
                  typeof selectedVariant.media.media[0] === 'object' && (
                    <Image
                      src={selectedVariant.media.media[0].url || ''}
                      alt={selectedVariant.media.media[0].alt || ''}
                      width={800}
                      height={800}
                      quality={100}
                      priority
                      className="w-full h-full object-cover"
                    />
                  )}
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="flex flex-col gap-8">
              {/* Header */}
              <div className={`flex flex-col gap-4 ${isEndOfContent ? 'end-of-content' : ''}`}>
                <div className="flex flex-col border-b border-other-bg/20 pb-2 w-full sticky top-0 bg-background left-0 right-0 z-10 pt-4">
                  {winery && (
                    <CollectionLink
                      collection="wineries"
                      title={winery.title ?? ''}
                      slug={winery.slug || {}}
                      language={language}
                    />
                  )}
                  <div className="relative justify-between w-full font-accent">
                    <button
                      onClick={() => setIsVariantOpen(!isVariantOpen)}
                      className="flex items-center gap-2 text-2xl w-full justify-center  group font-bold lowercase hover:text-foreground/80 transition-colors"
                    >
                      {selectedVariant && (
                        <>
                          <span className="icon-container">
                            {wine.title}, {selectedVariant.vintage}, {selectedVariant.size}ml
                          </span>
                          <Icon name="select" className="w-5 h-5" />
                        </>
                      )}
                    </button>
                    {isVariantOpen && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-background border border-other-bg/20 rounded-lg shadow-lg z-10">
                        {variants.map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => {
                              setSelectedVariant(variant)
                              setIsVariantOpen(false)
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-other-bg/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            {wine.title}, {variant.vintage}, {variant.size}ml
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Combined Hashtags */}
                  <div className="flex flex-col text-foreground/60 justify-center items-center">
                    <div className="flex flex-row gap-1">
                      {/* Tags */}
                      {selectedVariant?.tasting?.tags?.map((tag, index) => {
                        if (typeof tag === 'number' || !tag.slug) return null
                        return (
                          <CollectionLink
                            key={`tag-${index}`}
                            collection="tags"
                            title={tag.title}
                            slug={tag.slug}
                            language={language}
                            showHashtag
                          >
                            <span className="text-xs lowercase">{tag.title}</span>
                          </CollectionLink>
                        )
                      })}
                    </div>
                    <div className="flex flex-row gap-1">
                      {/* Grape Varieties */}
                      {selectedVariant?.composition?.grapeVarieties?.map((variety, index) => {
                        if (
                          typeof variety === 'number' ||
                          typeof variety.variety === 'number' ||
                          !variety.variety?.slug
                        )
                          return null
                        const grapeVariety = variety.variety as GrapeVariety
                        return (
                          <CollectionLink
                            key={`variety-${index}`}
                            collection="grape-varieties"
                            title={grapeVariety.title}
                            slug={grapeVariety.slug}
                            language={language}
                            showHashtag
                          >
                            <span className="text-xs lowercase">
                              {grapeVariety.title}
                              {variety.percentage && `-${variety.percentage}%`}
                            </span>
                          </CollectionLink>
                        )
                      })}
                    </div>

                    <div className="flex flex-row gap-1">
                      {/* Aromas */}
                      {selectedVariant?.tasting?.aromas?.map((aroma, index) => {
                        if (typeof aroma === 'number' || !aroma.slug) return null
                        return (
                          <CollectionLink
                            key={`aroma-${index}`}
                            collection="aromas"
                            title={aroma.title || ''}
                            slug={aroma.slug}
                            language={language}
                            showHashtag
                          >
                            <span className="text-xs lowercase">{aroma.title}</span>
                          </CollectionLink>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Combined Information Table */}
                <div className="grid grid-cols-2 gap-4 border-b border-other-bg/20 pb-4 text-xs">
                  {/* Left Column */}
                  <div className="flex flex-col gap-2">
                    {region && (
                      <InfoRow
                        icon="region"
                        collection="regions"
                        title={region.title}
                        slug={region.slug || {}}
                        language={language}
                        tooltipKey="wine.detail.region"
                      />
                    )}
                    {country && (
                      <InfoRow
                        icon="country"
                        collection="wineCountries"
                        title={country.title}
                        slug={country.slug || {}}
                        language={language}
                        tooltipKey="wine.detail.country"
                      />
                    )}
                    {style && (
                      <InfoRow
                        icon="style"
                        collection="styles"
                        title={style.title}
                        slug={style.slug || {}}
                        language={language}
                        tooltipKey="wine.detail.style"
                      />
                    )}
                  </div>

                  {/* Right Column */}
                  {selectedVariant && selectedVariant.details && (
                    <div className="flex flex-col gap-2">
                      <InfoRow
                        icon="temperature"
                        value={`${selectedVariant.details.servingTemp || 0}°C`}
                        language={language}
                        tooltipKey="wine.detail.temperature"
                      />
                      <InfoRow
                        icon="decanter"
                        value={
                          selectedVariant.details.decanting ? t('recommended') : t('notRecommended')
                        }
                        language={language}
                        tooltipKey="wine.detail.decanter"
                      />
                    </div>
                  )}
                </div>

                {/* Accordion Sections */}
                <div className="flex flex-col gap-2">
                  {/* Description */}
                  {wine.description && (
                    <Accordion
                      title={t('description')}
                      isOpen={openSection === 'description'}
                      onToggle={() =>
                        setOpenSection(openSection === 'description' ? null : 'description')
                      }
                      icon="description"
                    >
                      <div className="prose prose-lg max-w-none text-sm">
                        <RichText
                          content={wine.description}
                          enableProse
                        />
                      </div>
                    </Accordion>
                  )}

                  {/* Tasting Profile */}
                  {selectedVariant?.tasting?.tastingProfile && (
                    <Accordion
                      title={t('tastingProfile')}
                      isOpen={openSection === 'tasting'}
                      onToggle={() => setOpenSection(openSection === 'tasting' ? null : 'tasting')}
                      icon="tasting-profile"
                    >
                      <div className="prose prose-lg max-w-none text-sm">
                        <RichText
                          content={selectedVariant.tasting?.tastingProfile || ''}
                          enableProse
                        />
                      </div>
                    </Accordion>
                  )}

                  {/* Food Pairing */}
                  {selectedVariant?.details?.foodPairing && (
                    <Accordion
                      title={t('foodPairing')}
                      isOpen={openSection === 'food'}
                      onToggle={() => setOpenSection(openSection === 'food' ? null : 'food')}
                      icon="pairing"
                    >
                      <div className="prose prose-lg max-w-none text-sm">
                        <div className="flex flex-wrap gap-2">
                          {selectedVariant.details.foodPairing.map((food, index) => {
                            if (typeof food === 'number') return null
                            return (
                              <CollectionLink
                                key={`food-${index}`}
                                collection="foods"
                                title={food.title}
                                slug={food.slug}
                                language={language}
                                showHashtag
                              >
                                <span className="text-xs lowercase">{food.title}</span>
                              </CollectionLink>
                            )
                          })}
                        </div>
                      </div>
                    </Accordion>
                  )}
                </div>

                {/* Selected Variant Details */}
                {selectedVariant && (
                  <div>
                    <div className="flex flex-col gap-2 text-sm">
                      {selectedVariant.tasting?.tastingNotes && (
                        <div className="flex flex-col gap-1">
                          <TastingNotes
                            variant={selectedVariant}
                            showAromas={false}
                            showDescription={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sticky Action Bar */}
                <div className="sticky bottom-0 left-0 right-0 bg-background z-20 border-t border-other-bg/20 lg:group-[.end-of-content]:w-screen lg:group-[.end-of-content]:-mx-4">
                  <div className="grid grid-cols-3 items-center py-2">
                    {/* Left Section - Icons */}
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-center gap-1 group">
                        <IconActive name="like" className="w-5 h-5" />
                        <span className="text-xs text-foreground/60 text-center">{t('save')}</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 group">
                        <Icon name="share" className="w-5 h-5" />
                        <span className="text-xs text-foreground/60 text-center">{t('share')}</span>
                      </div>
                      <div className="hidden md:flex flex-col items-center gap-1">
                        <span className="font-accent text-2xl">
                          {selectedVariant?.details?.stockOnHand || 0}
                        </span>
                        <span className="text-xs text-foreground/60 text-center">
                          {t('inStock')}
                        </span>
                      </div>
                    </div>

                    {/* Center Section - Add to Cart */}
                    <div className="flex flex-col items-center justify-center group">
                      {selectedVariant && (
                        <CartButton wineVariantId={selectedVariant.id} label={t('addToCart')} />
                      )}
                    </div>

                    {/* Right Section - Price */}
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-accent text-center font-semibold">
                        {selectedVariant?.details?.price?.toFixed(2).replace('.', ',') || '0,00'} €
                      </span>
                      <span className="text-xs text-foreground/60">{t('priceWithVAT')}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* End of content marker */}
              <div ref={endOfContentRef} className="h-1" />
            </div>
          </div>
          <RelatedWines
            currentWine={wine}
            currentVariant={selectedVariant ?? (variants[0] as WineVariant)}
            allWines={allWines}
          />
        </div>
      </div>
    </div>
  )
}
