'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Icon } from '@/components/Icon'

interface NavItem {
  id: string
  title: string
  icon: string
  url: string
  order: number
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  menuItems: NavItem[]
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
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.url}
                  className="flex items-center gap-2 p-2 hover:text-primary"
                  onClick={onClose}
                >
                  <Icon name={item.icon} width={24} height={24} />
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
