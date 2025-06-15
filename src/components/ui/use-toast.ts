'use client'

import { useState, useCallback } from 'react'

type ToastVariant = 'default' | 'destructive'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
  onClose?: () => void
}

// Global state for toasts
let globalToasts: Toast[] = []
let listeners: ((toasts: Toast[]) => void)[] = []

function notifyListeners() {
  listeners.forEach((listener) => listener(globalToasts))
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts)

  // Subscribe to global state changes
  useState(() => {
    const listener = (newToasts: Toast[]) => {
      setToasts(newToasts)
    }
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  })

  const toast = useCallback(
    ({
      title,
      description,
      variant = 'default',
      duration = 5000,
    }: Omit<Toast, 'id' | 'onClose'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast = { id, title, description, variant, duration }
      globalToasts = [...globalToasts, newToast]
      notifyListeners()

      // Auto remove after duration
      setTimeout(() => {
        globalToasts = globalToasts.filter((t) => t.id !== id)
        notifyListeners()
      }, duration)
    },
    [],
  )

  const removeToast = useCallback((id: string) => {
    globalToasts = globalToasts.filter((t) => t.id !== id)
    notifyListeners()
  }, [])

  return {
    toasts,
    toast,
    removeToast,
  }
}
