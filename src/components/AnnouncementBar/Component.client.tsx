'use client'
import React, { useState, useEffect } from 'react'
import { Icon } from '@/components/Icon'
import { useTheme } from '@/providers/Theme'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'

const announcements = [
  'Welcome to Butelka - Your Wine Journey Starts Here',
  'Discover the Finest Slovenian Wines',
  'Join Us for Exclusive Wine Tastings',
]

interface AnnouncementBarProps {
  showOnlyNotifications?: boolean
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  showOnlyNotifications = false,
}) => {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  useTheme() // We need this for ThemeSelector to work

  useEffect(() => {
    const currentText = announcements[currentAnnouncement]
    let timeout: NodeJS.Timeout

    if (!currentText) return

    if (isWaiting) {
      timeout = setTimeout(() => {
        setIsWaiting(false)
        setIsDeleting(true)
      }, 3000)
      return () => clearTimeout(timeout)
    }

    if (isDeleting) {
      if (displayText === '') {
        setIsDeleting(false)
        setCurrentAnnouncement((prev) => (prev + 1) % announcements.length)
        return
      }
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1))
      }, 50)
    } else {
      if (displayText === currentText) {
        setIsWaiting(true)
        return
      }
      timeout = setTimeout(() => {
        setDisplayText(currentText.slice(0, displayText.length + 1))
      }, 100)
    }

    return () => clearTimeout(timeout)
  }, [displayText, currentAnnouncement, isDeleting, isWaiting])

  return (
    <div className="w-full bg-background text-base font-accent">
      <div className="container mx-auto px-4 h-8 flex items-center">
        {/* Left - Phone Number */}
        {!showOnlyNotifications && (
          <div className="w-1/3 flex items-center">
            <Icon name="phone" width={12} height={12} className="mr-2" />
            <span>+386 31 123 456</span>
          </div>
        )}

        {/* Center - Announcement */}
        <div
          className={`flex items-center justify-center ${showOnlyNotifications ? 'w-full' : 'w-1/3'}`}
        >
          <span className="whitespace-nowrap overflow-hidden">
            {displayText}
            <span className="animate-blink">|</span>
          </span>
        </div>

        {/* Right - Theme & Language Switcher */}
        {!showOnlyNotifications && (
          <div className="w-1/3 flex items-center justify-end gap-4">
            <LanguageSwitcher />
            <ThemeSelector />
          </div>
        )}
      </div>
    </div>
  )
}
