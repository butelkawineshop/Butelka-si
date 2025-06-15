'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/Icon'
import type { Page, Post } from '@butelkawineshop/types'
import { CMSLink } from '@/components/Link'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  menuItems: Array<{
    link: {
      type?: 'reference' | 'custom' | null
      newTab?: boolean | null
      reference?: { relationTo: 'pages' | 'posts'; value: number | Page | Post } | null
      url?: string | null
      label: string
    }
  }>
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, menuItems }) => {
  const t = useTranslations()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background md:hidden">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          <button onClick={onClose} className="p-2 hover:text-primary" aria-label={t('close')}>
            <Icon name="close" width={24} height={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-4">
            {menuItems.map(({ link }, i) => (
              <li key={i}>
                <div onClick={onClose}>
                  <CMSLink {...link} className="flex items-center gap-2 p-2 hover:text-primary">
                    <Icon
                      name={link.label.toLowerCase().replace(/\s+/g, '-')}
                      width={24}
                      height={24}
                    />
                    <span>{link.label}</span>
                  </CMSLink>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
