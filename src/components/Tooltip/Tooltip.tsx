'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/utilities/ui'
import { useTranslations } from 'next-intl'
import { createPortal } from 'react-dom'

interface TooltipProps {
  translationKey: string
  children: React.ReactNode
  position?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export function Tooltip({ translationKey, children, position = 'top', className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const autoCloseRef = useRef<NodeJS.Timeout | null>(null)
  const hoverDelayRef = useRef<NodeJS.Timeout | null>(null)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  const t = useTranslations()
  const content = t(translationKey)

  useEffect(() => {
    setPortalContainer(document.body)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle hover state for desktop
  useEffect(() => {
    if (isHovered) {
      // Add delay before showing tooltip
      hoverDelayRef.current = setTimeout(() => {
        setIsVisible(true)
        // Clear any existing auto-close timeout
        if (autoCloseRef.current) {
          clearTimeout(autoCloseRef.current)
        }
      }, 500) // 500ms delay
    } else {
      // Clear hover delay if mouse leaves before delay completes
      if (hoverDelayRef.current) {
        clearTimeout(hoverDelayRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, 200) // Small delay before hiding
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (hoverDelayRef.current) {
        clearTimeout(hoverDelayRef.current)
      }
    }
  }, [isHovered])

  // Auto-close after 2 seconds
  useEffect(() => {
    if (isVisible) {
      autoCloseRef.current = setTimeout(() => {
        setIsVisible(false)
      }, 2000)
    }

    return () => {
      if (autoCloseRef.current) {
        clearTimeout(autoCloseRef.current)
      }
    }
  }, [isVisible])

  // Calculate tooltip position
  useEffect(() => {
    if (!isVisible || !tooltipRef.current || !triggerRef.current || !portalContainer) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()

    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.right + 8
        break
      case 'bottom':
        top = triggerRect.bottom + 8
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.left - tooltipRect.width - 8
        break
    }

    tooltipRef.current.style.top = `${top}px`
    tooltipRef.current.style.left = `${left}px`
  }, [isVisible, position, portalContainer])

  const _positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className="relative inline-block"
      ref={triggerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsVisible(!isVisible)}
    >
      <div>{children}</div>
      {isVisible &&
        portalContainer &&
        createPortal(
          <div
            ref={tooltipRef}
            className={cn(
              'fixed z-50 px-3 py-2 text-sm text-white bg-black/90 rounded-lg shadow-lg whitespace-normal w-36',
              'animate-in fade-in-0 zoom-in-95 duration-200',
              className,
            )}
          >
            {content}
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-2 h-2 bg-black/90 rotate-45',
                position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
                position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2',
                position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
                position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
              )}
            />
          </div>,
          portalContainer,
        )}
    </div>
  )
}
