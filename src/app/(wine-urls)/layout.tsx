import { headers } from 'next/headers'
import { getMainNavigationItems } from '@/utilities/wineNavigation'
import ListNavBar from '@/components/NavigationBars/ListNavBar'
import { Suspense } from 'react'

export default async function WineLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const resolvedLocale = (headersList.get('x-locale') || 'sl') as 'sl' | 'en'

  // Get main navigation items for ListNavBar
  const navigationItems = getMainNavigationItems(resolvedLocale)

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="w-full h-full flex flex-col pt-4">
        {navigationItems.length > 0 && (
          <Suspense fallback={<div className="h-16 w-full animate-pulse bg-primary/10" />}>
            <ListNavBar items={navigationItems} />
          </Suspense>
        )}
      </div>
      <Suspense fallback={<div className="flex-1 w-full animate-pulse bg-primary/5" />}>
        {children}
      </Suspense>
    </div>
  )
}
