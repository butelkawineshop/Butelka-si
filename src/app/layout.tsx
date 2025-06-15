import type { Metadata } from 'next'
import { cn } from '@/utilities/ui'
import localFont from 'next/font/local'
import React from 'react'
import { headers } from 'next/headers'

import { NextIntlClientProvider } from 'next-intl'
import slMessages from '../../messages/sl.json'
import enMessages from '../../messages/en.json'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { AuthProvider } from '@/contexts/AuthContext'
import { ReduxProvider } from '@/providers/ReduxProvider'
import { ThemeProvider } from '@/providers/Theme'
import { HeaderThemeProvider } from '@/providers/HeaderTheme'
import { NavigationProgress } from '@/components/NavigationProgress'
import { ToastProvider, Toaster } from '@/components/ui/toast'
import { CartProvider } from '@/contexts/CartContext'

import { getServerSideURL } from '@/utilities/getURL'
import './styles.css'

type Locale = 'sl' | 'en'

const asap = localFont({
  src: [
    {
      path: '../../public/fonts/asap/Asap-Variable.woff2',
      weight: '200 700',
      style: 'normal',
    },
  ],
  variable: '--font-asap',
})
const tanker = localFont({
  src: [
    {
      path: '../../public/fonts/tanker/Tanker-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-tanker',
})

export const dynamic = 'force-dynamic'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const locale = (headersList.get('x-locale') ?? 'sl') as Locale
  const messages = locale === 'en' ? enMessages : slMessages

  return (
    <html className={cn(tanker.variable, asap.variable)} lang={locale} suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <meta
          name="description"
          content="Butelka - Uncork your mind! We're a wine shop in Koper, Slovenia, offering a carefully curated selection of wines from around the world."
        />
      </head>
      <body
        className={cn(
          'min-h-screen min-w-full max-w-full bg-background font-sans antialiased',
          'font-sans',
        )}
      >
        <ReduxProvider>
          <ThemeProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <HeaderThemeProvider>
                <ToastProvider>
                  <AuthProvider>
                    <CartProvider>
                      <NavigationProgress />
                      <Header />
                      <main className="mb-[20px] md:pb-0 h-full w-full flex flex-1 flex-col">
                        {children}
                      </main>
                      <Footer />
                      <Toaster />
                    </CartProvider>
                  </AuthProvider>
                </ToastProvider>
              </HeaderThemeProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@payloadcms',
  },
}
