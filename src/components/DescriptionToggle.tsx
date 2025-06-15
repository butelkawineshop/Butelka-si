'use client'

import { useState } from 'react'

interface DescriptionToggleProps {
  description?: string | null
}

export function DescriptionToggle({ description }: DescriptionToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!description) return null

  return (
    <div
      className="relative text-sm md:text-xs text-left cursor-pointer group"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className={`transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
        {description}
      </div>
      {!isExpanded && (
        <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      )}
    </div>
  )
}
