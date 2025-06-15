'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Icon } from '@/components/Icon'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { useTranslations } from 'next-intl'

type SortOption = {
  value: string
  icon: string
  tooltipKey: string
}

export default function Sorting() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations()

  const sortOptions: SortOption[] = [
    {
      value: 'createdAt',
      icon: 'date',
      tooltipKey: 'sorting.newest',
    },
    {
      value: 'price',
      icon: 'price',
      tooltipKey: 'sorting.price',
    },
    {
      value: 'name',
      icon: 'alphabet',
      tooltipKey: 'sorting.name',
    },
  ]

  const currentSort = searchParams.get('sort') || 'createdAt'
  const currentDirection = searchParams.get('direction') || 'desc'

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (currentSort === value) {
      // Toggle direction if clicking the same sort option
      params.set('direction', currentDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new sort and default to descending
      params.set('sort', value)
      params.set('direction', 'desc')
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-4 w-full justify-center">
      {sortOptions.map((option) => (
        <Tooltip
          key={option.value}
          translationKey={
            currentSort === option.value
              ? `sorting.${option.value}.${currentDirection}`
              : `sorting.${option.value}.label`
          }
        >
          <button
            onClick={() => handleSort(option.value)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-full transition-colors',
              currentSort === option.value && 'text-foreground',
            )}
          >
            <Icon name={option.icon} className="w-5 h-5" />
            <span className="text-xs">
              {currentSort === option.value
                ? t(`sorting.${option.value}.${currentDirection}`)
                : t(`sorting.${option.value}.label`)}
            </span>
          </button>
        </Tooltip>
      ))}
    </div>
  )
}
