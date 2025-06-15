'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '../../contexts/CartContext'
import { Logo } from '@/components/Logo/Logo'
import { Icon } from '@/components/Icon'
import LoginModal from '@/components/Auth/LoginModal'
import { useTranslations } from 'next-intl'
import { AnnouncementBar } from '@/components/AnnouncementBar/Component.client'
import { CartSlideIn } from '@/components/Cart/CartSlideIn'
import { SearchPopup } from './SearchPopup'

interface NavItem {
  id: string
  title: string
  icon: string
  url: string
  order: number
}

export const Header = () => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [showLogo, setShowLogo] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const t = useTranslations()
  const { cart } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const [locale, setLocale] = useState<'sl' | 'en'>('sl')
  useEffect(() => {
    const detected = document.querySelector('meta[name="x-locale"]')?.getAttribute('content') as
      | 'sl'
      | 'en'
      | null
    if (detected && detected !== locale) {
      setLocale(detected)
    }
  }, [pathname, locale])

  useEffect(() => {
    setHeaderTheme(null)
  }, [pathname, setHeaderTheme])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
  }, [headerTheme, theme])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true)
        // Only show logo when we're at the top
        setShowLogo(currentScrollY < 10)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and not at the top
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  // Hardcoded navigation items
  const navItems: NavItem[] = [
    // Left side (0-3)
    {
      id: 'search',
      title: t('search.button'),
      icon: 'search',
      url: '#',
      order: 0,
    },
    {
      id: 'wineshop',
      title: t('wine.title'),
      icon: 'wine',
      url: locale === 'en' ? '/en/wineshop' : '/vinoteka',
      order: 1,
    },
    {
      id: 'tastings',
      title: t('tastings.title'),
      icon: 'tastings',
      url: locale === 'en' ? '/en/tastings' : '/degustacije',
      order: 2,
    },
    {
      id: 'kgb',
      title: t('kgb.title'),
      icon: 'kgb',
      url: locale === 'en' ? '/en/kgb' : '/kgb',
      order: 3,
    },
    // Right side (4-7)
    {
      id: 'butelka',
      title: t('butelka.title'),
      icon: 'butelka',
      url: locale === 'en' ? '/en/butelka' : '/butelka',
      order: 4,
    },
    {
      id: 'blog',
      title: t('posts.title'),
      icon: 'blog',
      url: locale === 'en' ? '/en/encyclopedia' : '/enciklopedija',
      order: 5,
    },
    {
      id: 'cart',
      title: t('cart.title'),
      icon: 'cart',
      url: '#',
      order: 6,
    },
    {
      id: 'account',
      title: t('account'),
      icon: 'account',
      url: '#',
      order: 7,
    },
  ]

  // Split menu items into left and right sections
  const leftMenuItems = navItems.filter(item => item.order < 4)
  const rightMenuItems = navItems.filter(item => item.order >= 4)

  const itemCount = cart?.items?.length || 0

  return (
    <>
      <div className="hidden md:block">
        <AnnouncementBar showOnlyNotifications={false} />
      </div>
      <header
        className={`w-full transition-all duration-300 ${
          isVisible && !showLogo ? 'bg-background h-16' : 'h-32'
        } ${isVisible ? 'translate-y-0' : '-translate-y-full'} md:sticky md:top-0 md:z-50 ${
          isCartOpen ? 'backdrop-blur-sm' : ''
        }`}
        {...(theme ? { 'data-theme': theme } : {})}
      >
        {/* Desktop Header */}
        <div
          className={`hidden px-8 md:flex h-full w-full items-center justify-center ${
            isCartOpen ? 'opacity-20 backdrop-blur-xl' : ''
          }`}
        >
          <div
            className={`flex items-center transition-all duration-300 ${
              showLogo ? 'gap-8' : 'gap-4'
            }`}
          >
            {/* Left Icons */}
            <nav className="flex items-center gap-4">
              {leftMenuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  className="text-foreground hover:text-primary flex flex-col items-center icon-container group"
                  onClick={item.id === 'search' ? (e) => { e.preventDefault(); setIsSearchOpen(true); } : undefined}
                >
                  <div className="h-12 w-12 p-1 rounded-full flex items-center justify-center">
                    <Icon name={item.icon} width={32} height={32} />
                  </div>
                  {showLogo && (
                    <span className="text-[10px] text-foreground/60">{item.title}</span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Center Logo */}
            <div
              className={`flex items-center justify-center transition-all duration-300 ease-out ${
                showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-0 w-0'
              }`}
            >
              <Link href="/">
                <Logo loading="eager" priority="high" className="w-32 h-32" />
              </Link>
            </div>

            {/* Right Icons */}
            <nav className="flex items-center gap-4">
              {rightMenuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  className="text-foreground hover:text-primary flex flex-col items-center icon-container group"
                  onClick={item.id === 'cart' ? (e) => { e.preventDefault(); setIsCartOpen(true); } : 
                         item.id === 'account' ? (e) => { e.preventDefault(); openModal(); } : undefined}
                >
                  <div className="h-12 w-12 p-1 rounded-full flex items-center justify-center relative">
                    <Icon name={item.icon} width={32} height={32} />
                    {item.id === 'cart' && itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {itemCount}
                      </span>
                    )}
                  </div>
                  {showLogo && (
                    <span className="text-[10px] text-foreground/60">{item.title}</span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="block md:hidden">
          <AnnouncementBar showOnlyNotifications={true} />
        </div>
        {/* Mobile Header */}
        <div
          className={`md:hidden h-32 flex items-center justify-between flex-row relative ${
            isCartOpen ? 'opacity-50' : ''
          }`}
        >
          <div className="w-1/3"></div>
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center h-full">
            <Link href="/" className="block">
              <Logo loading="eager" priority="high" className="w-32 h-32" />
            </Link>
          </div>
          <div className="w-1/3"></div>
        </div>
      </header>

      {isModalOpen && <LoginModal onClose={closeModal} />}
      <CartSlideIn isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <SearchPopup isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
