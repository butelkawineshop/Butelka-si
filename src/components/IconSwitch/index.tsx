'use client'

import { cn } from '@/utilities/ui'

interface IconProps {
  name: string
  className?: string
  width?: number
  height?: number
  active?: boolean
}

export function IconSwitch({
  name,
  className,
  width = 24,
  height = 24,
  active = false,
}: IconProps) {
  return (
    <div
      className={cn('relative inline-block group', className, active && 'active')}
      style={{ width, height }}
    >
      {/* White version - visible by default */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/icons/Color/${name}.svg`}
        width={width}
        height={height}
        alt={name}
        className="absolute icon-container inset-0 w-full h-full opacity-100 group-hover:opacity-0 group-[.active]:opacity-0 transition-opacity duration-200"
        draggable={false}
      />
      {/* Color version - hidden by default, visible on hover/active */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/icons/Color/${name}.svg`}
        width={width}
        height={height}
        alt={name}
        className="absolute icon-container inset-0 w-full h-full opacity-0 group-hover:opacity-100 group-[.active]:opacity-100 transition-opacity duration-200"
        draggable={false}
      />
    </div>
  )
}
