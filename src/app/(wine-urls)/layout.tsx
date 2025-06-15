import { headers } from 'next/headers'
import { getMainNavigationItems } from '@/utilities/wineNavigation'
import ListNavBar from '@/components/NavigationBars/ListNavBar'

export default async function WineLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const resolvedLocale = (headersList.get('x-locale') || 'sl') as 'sl' | 'en'

  // Get main navigation items for ListNavBar
  const navigationItems = getMainNavigationItems(resolvedLocale)

  return (
    <>
      <div className="w-full h-full flex flex-col pt-4 bg-background">
        {navigationItems.length > 0 && <ListNavBar items={navigationItems} />}
      </div>
      {children}
    </>
  )
}
