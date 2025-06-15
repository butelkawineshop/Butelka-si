'use client'

import React from 'react'
import { useTheme } from '..'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/Icon'

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const t = useTranslations()

  // Show opposite of current theme
  const oppositeTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      onClick={() => setTheme(oppositeTheme)}
      className="flex items-center gap-2 hover:text-foreground text-foreground/60 group transition-colors cursor-pointer"
    >
      <Icon name={oppositeTheme} width={12} height={12} />
      <span className="text-xs">{t(oppositeTheme)}</span>
    </button>
  )
}
