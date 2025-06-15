'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@/components/Icon'
import { cn } from '@/lib/utils'
import { useToast as useToastHook } from './use-toast'

export type ToastProps = {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
  onClose?: () => void
}

export function Toast({
  title,
  description,
  variant = 'default',
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={cn(
        'pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-lg shadow-lg transition-all duration-300',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        variant === 'default'
          ? 'bg-background border'
          : 'bg-destructive text-destructive-foreground',
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            {title && <div className="font-semibold text-sm">{title}</div>}
            {description && <div className="text-xs mt-1">{description}</div>}
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => onClose?.(), 300)
            }}
            className="text-foreground/60 hover:text-foreground"
          >
            <Icon name="close" width={16} height={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function Toaster() {
  const { toasts, removeToast } = useToastHook()

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[100] p-2 w-full max-w-sm space-y-4 flex flex-col items-center">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

// Create a context for the toast
import { createContext, useContext } from 'react'

interface ToastContextType {
  toast: (props: Omit<ToastProps, 'id' | 'onClose'>) => void
  toasts: ToastProps[]
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toast, toasts, removeToast } = useToastHook()

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
