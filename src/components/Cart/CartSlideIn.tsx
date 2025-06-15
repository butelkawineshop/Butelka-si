'use client'

import { useCart } from '@/contexts/CartContext'
import { Icon } from '@/components/Icon'
import { useState } from 'react'
import { useToast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import type { WineVariant } from '@butelkawineshop/types'
import { getFullVariantName } from '@/utilities/getFullVariantName'
import Image from 'next/image'
import { SlideInOut } from '@/components/ui/animation'
import { motion, AnimatePresence } from 'framer-motion'
import { createSharedCart } from '@/app/actions'
import { CopyLinkModal } from '@/components/ui/CopyLinkModal'
import { IconSwitch } from '../IconSwitch'
import CollectionLink from '@/components/WineCard/components/CollectionLink'
import { detectLocaleFromPath } from '@/utilities/routeMappings'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ClearCart } from './ClearCart'

interface CartSlideInProps {
  isOpen: boolean
  onClose: () => void
}

export function CartSlideIn({ isOpen, onClose }: CartSlideInProps) {
  const { cart, updateQuantity, removeItem } = useCart()
  const { toast } = useToast()
  const t = useTranslations('cart')
  const pathname = usePathname()
  const language = detectLocaleFromPath(pathname)
  const [isSaving, setIsSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleSaveCart = async (_name: string) => {
    setIsSaving(true)
    try {
      // TODO: Implement save cart functionality
      toast({
        title: t('save.success'),
        description: t('save.cartSaved'),
      })
    } catch (error) {
      console.error('Error saving cart:', error)
      toast({
        title: t('common.error'),
        description: t('save.error'),
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleShareCart = async () => {
    setIsSharing(true)
    try {
      const { shareUrl } = await createSharedCart(
        cart?.items?.map((item) => ({
          wineVariant:
            typeof item.wineVariant === 'object' ? item.wineVariant.id : item.wineVariant,
          quantity: item.quantity,
          addedAt: item.addedAt,
        })) || [],
      )
      setShareUrl(shareUrl)
      setIsShareModalOpen(true)
    } catch (error) {
      console.error('Error sharing cart:', error)
      toast({
        title: t('common.error'),
        description: t('share.error'),
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyClick = () => {
    if (!shareUrl) {
      toast({
        title: t('share.nothingToCopy'),
        description: t('share.shareLinkMissing'),
      })
      return
    }

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast({
          title: t('share.success'),
          description: t('share.cartShared'),
        })
      })
      .catch((err) => {
        console.error('Clipboard error:', err)
        toast({
          title: t('common.error'),
          description: t('share.error'),
        })
      })
  }

  const subtotal =
    cart?.items?.reduce((total: number, item) => {
      const wineVariant =
        typeof item.wineVariant === 'object' ? (item.wineVariant as WineVariant) : null
      const price = wineVariant?.details?.price || 0
      return total + price * item.quantity
    }, 0) || 0

  const shipping = subtotal > 100 ? 0 : 5.99
  const tax = subtotal * 0.22 // 22% VAT
  const total = subtotal + shipping + tax

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sl-SI', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={handleBackdropClick}
          />
        )}
      </AnimatePresence>
      <SlideInOut
        show={isOpen}
        className="fixed inset-y-0 right-0 w-full sm:max-w-lg z-50 bg-background rounded-l-lg shadow-2xl flex flex-col h-[calc(100%-72px)] md:h-full"
      >
        <div className="p-4 flex justify-between items-center border-b border-border">
          <h2 className="text-xl font-accent">{t('title')}</h2>
          <button onClick={onClose} aria-label="Close cart" className="icon-container">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart?.items?.map((item) => {
            const wineVariant =
              typeof item.wineVariant === 'object' ? (item.wineVariant as WineVariant) : null
            const media = wineVariant?.media?.media?.[0]
            const imageUrl = typeof media === 'object' ? media.url : null
            const wineVariantId =
              typeof item.wineVariant === 'object' ? item.wineVariant.id : item.wineVariant

            const wine = typeof wineVariant?.wine === 'object' ? wineVariant.wine : null
            const region = typeof wine?.region === 'object' ? wine.region : null
            const country = region?.general?.country
            const regionTitle = region?.title || ''
            const countryTitle = typeof country === 'object' ? country.title : ''

            return (
              <div
                key={`${wineVariantId}-${item.addedAt}`}
                className="rounded-md bg-muted/10 flex gap-3 border border-border"
              >
                <div className="w-20 h-20 flex-shrink-0 relative">
                  {imageUrl && wineVariant && (
                    <div onClick={onClose} className="w-full h-full">
                      <CollectionLink
                        collection="wines"
                        slug={
                          typeof wineVariant.wine === 'object' &&
                          wineVariant.wine &&
                          wineVariant.wine.slug
                            ? wineVariant.wine.slug
                            : ''
                        }
                        language={language}
                        title={getFullVariantName(wineVariant) || ''}
                        className="relative block w-full h-full"
                      >
                        <Image
                          src={imageUrl}
                          alt={getFullVariantName(wineVariant)}
                          fill
                          sizes="80px"
                          className="object-cover rounded-lg scale-105"
                        />
                      </CollectionLink>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div>
                    <h3 className="font-semibold text-sm leading-tight">
                      {wineVariant && typeof wineVariant.wine === 'object' && wineVariant.wine && (
                        <div onClick={onClose}>
                          <CollectionLink
                            collection="wines"
                            slug={wineVariant.wine.slug || ''}
                            language={language}
                            title={wineVariant.wine.title || ''}
                          >
                            {wineVariant.wine.winery && typeof wineVariant.wine.winery === 'object'
                              ? wineVariant.wine.winery.title + ', '
                              : ''}
                            {wineVariant.wine.title || ''}, {wineVariant.vintage},{' '}
                            {wineVariant.size}
                            ml
                          </CollectionLink>
                        </div>
                      )}
                    </h3>
                    <p className="text-xs text-foreground/60">
                      {regionTitle}
                      {countryTitle ? `, ${countryTitle}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-foreground/60">
                        {formatPrice(wineVariant?.details?.price || 0)} x {item.quantity}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const wineVariantId =
                              typeof item.wineVariant === 'object'
                                ? item.wineVariant.id
                                : item.wineVariant
                            updateQuantity(wineVariantId, item.quantity - 1)
                          }}
                          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center icon-container"
                          aria-label="Decrease quantity"
                        >
                          <IconSwitch name="chevron-left" className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => {
                            const wineVariantId =
                              typeof item.wineVariant === 'object'
                                ? item.wineVariant.id
                                : item.wineVariant
                            updateQuantity(wineVariantId, item.quantity + 1)
                          }}
                          className="w-7 h-7 rounded-full bg-muted flex items-center justify-center icon-container"
                          aria-label="Increase quantity"
                        >
                          <IconSwitch name="chevron-right" className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-right w-20">
                      {formatPrice((wineVariant?.details?.price || 0) * item.quantity)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const wineVariantId =
                      typeof item.wineVariant === 'object' ? item.wineVariant.id : item.wineVariant
                    removeItem(wineVariantId)
                  }}
                  className="p-2 self-center"
                  aria-label="Remove item"
                >
                  <Icon
                    name="trash"
                    className="w-4 h-4 text-foreground/60 hover:text-red-600 transition-colors duration-150"
                  />
                </button>
              </div>
            )
          })}
        </div>

        <div className="p-4 space-y-4 bg-background border-t border-border">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground/70">{t('subtotal')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground/70">{t('shipping')}</span>
              <span>{shipping === 0 ? t('free') : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground/70">{t('tax')}</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="h-px bg-foreground/10 my-2" />
            <div className="flex justify-between text-base font-bold ">
              <span>{t('total')}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 h-12 px-4 py-2 font-accent text-foreground icon-container hover:bg-other-bg/90 rounded-md gap-2 flex items-center justify-center"
              onClick={() => handleSaveCart('Saved Cart')}
              disabled={isSaving}
            >
              <Icon name="save" className="w-4 h-4" />
              {isSaving ? t('save.loading') : t('save.button')}
            </button>
            <button
              className="flex-1 h-12 px-4 py-2 font-accent text-foreground icon-container hover:bg-other-bg/10 rounded-md gap-2 flex items-center justify-center"
              onClick={handleShareCart}
              disabled={isSharing}
            >
              <Icon name="share" className="w-4 h-4" />
              {isSharing ? t('share.loading') : t('share.button')}
            </button>
            <ClearCart className="h-12 px-4 py-2 font-accent text-foreground icon-container hover:bg-other-bg/10 rounded-md" />
          </div>
          <Link
            href={language === 'en' ? '/en/checkout' : '/blagajna'}
            className="w-full"
            onClick={onClose}
          >
            <button className="w-full py-3 mt-2 bg-accent font-accent text-black rounded-md text-lg flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors">
              <Icon name="pay" className="w-5 h-5 flex" />
              {t('checkout')}
            </button>
          </Link>
          <CopyLinkModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            title={t('share.modalTitle')}
          >
            <div className="space-y-3">
              {shareUrl && (
                <>
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full px-3 py-2 rounded-md border border-border bg-muted text-xs text-foreground/80 cursor-text"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <button
                    className="w-full py-2 bg-accent text-black rounded-md text-sm font-accent hover:opacity-90 flex items-center justify-center gap-2"
                    onClick={handleCopyClick}
                  >
                    <Icon name="share" className="w-4 h-4" />
                    {t('share.copyButton')}
                  </button>
                </>
              )}
            </div>
          </CopyLinkModal>
        </div>
      </SlideInOut>
    </>
  )
}
