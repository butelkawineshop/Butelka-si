import { Icon } from '@/components/Icon'
import { ReactNode } from 'react'
import { cn } from '@/utilities/ui'

interface AccordionProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
  icon?: string
  className?: string
}

export function Accordion({ title, isOpen, onToggle, children, icon, className }: AccordionProps) {
  return (
    <div className={cn('border border-other-bg/20 rounded-lg overflow-hidden', className)}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center group justify-between hover:bg-primary hover:text-black cursor-pointer transition-colors"
      >
        <div className="icon-container flex items-center gap-2">
          {icon && <Icon name={icon} className="w-5 h-5" />}
          <h2 className="font-semibold">{title}</h2>
        </div>
        <Icon
          name="chevron-left"
          className={cn(
            'w-5 h-5 transition-transform duration-200 ease-in-out',
            isOpen && 'rotate-[-90deg]',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 py-4 text-left">{children}</div>
        </div>
      </div>
    </div>
  )
}
