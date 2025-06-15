'use client'

import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '../../contexts/CartContext'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { Icon } from '@/components/Icon'
import { useTranslations } from 'next-intl'
import { MobileMenu } from '@/components/Footer/MobileMenu/Component.client'
import { CartSlideIn } from '@/components/Cart/CartSlideIn'
import { SearchPopup } from '@/components/Header/SearchPopup'

// Static footer data
const footerData = {
  description: {
    sl: 'Vaša destinacija za vrhunska vina in nepozabne okusne izkušnje.',
    en: 'Your destination for premium wines and unforgettable tasting experiences.',
  },
  navigationGroups: [
    {
      title: {
        sl: 'O nas',
        en: 'About',
      },
      links: [
        {
          label: {
            sl: 'O nas',
            en: 'About Us',
          },
          url: {
            sl: '/o-nas',
            en: '/en/about',
          },
        },
        {
          label: {
            sl: 'Kontakt',
            en: 'Contact',
          },
          url: {
            sl: '/kontakt',
            en: '/en/contact',
          },
        },
      ],
    },
    {
      title: {
        sl: 'Vino',
        en: 'Wine',
      },
      links: [
        {
          label: {
            sl: 'Vsa vina',
            en: 'All Wines',
          },
          url: {
            sl: '/vino',
            en: '/en/wine',
          },
        },
        {
          label: {
            sl: 'Degustacije',
            en: 'Tastings',
          },
          url: {
            sl: '/degustacije',
            en: '/en/tastings',
          },
        },
      ],
    },
  ],
  mobileNavItems: [
    {
      link: {
        label: {
          sl: 'Iskanje',
          en: 'Search',
        },
        url: {
          sl: '/iskanje',
          en: '/en/search',
        },
      },
      icon: 'search',
      order: 1,
    },
    {
      link: {
        label: {
          sl: 'Vino',
          en: 'Wine',
        },
        url: {
          sl: '/vino',
          en: '/en/wine',
        },
      },
      icon: 'wine',
      order: 2,
    },
    {
      link: {
        label: {
          sl: 'Košarica',
          en: 'Cart',
        },
        url: {
          sl: '/kosarica',
          en: '/en/cart',
        },
      },
      icon: 'cart',
      order: 3,
    },
  ],
  contactInfo: {
    email: 'info@butelka.si',
    phone: '+386 1 234 5678',
    address: {
      sl: 'Ljubljana, Slovenija',
      en: 'Ljubljana, Slovenia',
    },
  },
  openingHours: {
    weekdays: {
      sl: 'Pon-Pet: 10:00 - 20:00',
      en: 'Mon-Fri: 10:00 - 20:00',
    },
    saturday: {
      sl: 'Sob: 10:00 - 18:00',
      en: 'Sat: 10:00 - 18:00',
    },
    sunday: {
      sl: 'Ned: Zaprto',
      en: 'Sun: Closed',
    },
  },
}

export const Footer: React.FC = () => {
  const t = useTranslations('footer')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const [locale, setLocale] = useState<'sl' | 'en'>('sl')
  const { cart } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    // First try to get locale from meta tag
    const metaLocale = document.querySelector('meta[name="x-locale"]')?.getAttribute('content')
    if (metaLocale === 'en' || metaLocale === 'sl') {
      setLocale(metaLocale)
      return
    }

    // If not in meta, check URL path
    const pathLocale = pathname.startsWith('/en') ? 'en' : 'sl'
    setLocale(pathLocale)
  }, [pathname])

  // Sort mobile nav items by order
  const sortedMobileNavItems = [...footerData.mobileNavItems].sort((a, b) => a.order - b.order)

  // Get all navigation items for the mobile menu
  const allNavItems = [
    ...sortedMobileNavItems.map((item) => ({
      link: {
        ...item.link,
        label: getLocalizedContent(item.link.label, locale),
        url: getLocalizedContent(item.link.url, locale),
      },
      icon: item.icon,
    })),
    ...footerData.navigationGroups.flatMap((group) =>
      (group.links || []).map((item) => ({
        link: {
          ...item,
          label: getLocalizedContent(item.label, locale),
          url: getLocalizedContent(item.url, locale),
        },
        icon: getLocalizedContent(item.label, locale).toLowerCase().replace(/\s+/g, '-'),
      })),
    ),
  ]

  const itemCount = cart?.items?.length || 0

  return (
    <>
      {/* Desktop Footer */}
      <footer className="hidden md:block mt-auto border-t border-border bg-background">
        <div className="flex p-8">
          <div className="grid grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1">
              <Link href="/" className="block mb-4">
                <Logo className="h-8 w-auto" />
              </Link>
              <p className="text-foreground/60 text-sm">
                {getLocalizedContent(footerData.description, locale)}
              </p>
            </div>

            {/* Navigation Groups */}
            {footerData.navigationGroups.map((group, i) => (
              <div key={i} className="col-span-1">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  {getLocalizedContent(group.title, locale)}
                </h3>
                <nav className="flex flex-col gap-2">
                  {(group.links || []).map((item, j) => (
                    <CMSLink
                      key={j}
                      {...item}
                      label={getLocalizedContent(item.label, locale)}
                      url={getLocalizedContent(item.url, locale)}
                      className="text-foreground/60 hover:text-foreground"
                    />
                  ))}
                </nav>
              </div>
            ))}

            {/* Contact */}
            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-4 text-foreground">{t('contact')}</h3>
              <div className="text-foreground/60 text-sm">
                <p>{footerData.contactInfo.email}</p>
                <p>{footerData.contactInfo.phone}</p>
                <p>{getLocalizedContent(footerData.contactInfo.address, locale)}</p>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-4 text-foreground">{t('openingHours')}</h3>
              <div className="text-foreground/60 text-sm">
                <p>{getLocalizedContent(footerData.openingHours.weekdays, locale)}</p>
                <p>{getLocalizedContent(footerData.openingHours.saturday, locale)}</p>
                <p>{getLocalizedContent(footerData.openingHours.sunday, locale)}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="mt-8 px-8 py-2 border-t border-border flex justify-between items-center">
          <p className="text-foreground/60 text-sm">
            {t('copyright', { year: new Date().getFullYear().toString() })}
          </p>
        </div>
      </footer>

      {/* Mobile Footer */}
      <div className="md:hidden pb-[72px]">
        <footer className="fixed bottom-0 left-0 right-0 w-full p-4 bg-background border-t border-border z-100">
          <div className="">
            <nav className="flex justify-around items-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex flex-col items-center gap-1 text-foreground hover:text-primary icon-container group"
              >
                <Icon name="toTop" width={24} height={24} />
                <span className="text-xs">{t('toTop')}</span>
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex flex-col items-center gap-1 text-foreground hover:text-primary icon-container group"
              >
                <Icon name="search" width={24} height={24} />
                <span className="text-xs">{t('search')}</span>
              </button>
              <Link
                href={locale === 'en' ? '/en/wine' : '/vino'}
                className="flex flex-col items-center gap-1 text-foreground hover:text-primary icon-container group"
              >
                <Icon name="wine" width={24} height={24} />
                <span className="text-xs">{t('wine.title')}</span>
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex flex-col items-center gap-1 relative text-foreground hover:text-primary icon-container group"
              >
                <Icon name="cart" width={24} height={24} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
                <span className="text-xs">{t('cart.title')}</span>
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex flex-col items-center gap-1 text-foreground hover:text-primary icon-container group"
              >
                <Icon name="menu" width={24} height={24} />
                <span className="text-xs">{t('menu')}</span>
              </button>
            </nav>
          </div>
        </footer>
      </div>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        menuItems={allNavItems}
      />
      <CartSlideIn isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <SearchPopup isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

// Helper function to get localized content
function getLocalizedContent(
  content: string | { [key: string]: string } | null | undefined,
  locale: 'sl' | 'en',
): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  const result = content[locale] || content['sl'] || content['en'] || ''
  return result
}
