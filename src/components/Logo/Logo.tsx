import clsx from 'clsx'
import React from 'react'
import { useTheme } from '@/providers/Theme'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props
  const { theme } = useTheme()

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <div className="justify-center items-center hover:scale-110 transition-all duration-100 active:scale-95 flex flex-col gap-1">
      <img
        alt="Payload Logo"
        width={800}
        height={800}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className={clsx(className)}
        src={theme === 'dark' ? '/Logo-CircleBlack.svg' : '/Logo-CircleWhite.svg'}
      />
    </div>
  )
}
