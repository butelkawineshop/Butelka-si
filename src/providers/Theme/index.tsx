'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

import type { Theme, ThemeContextType } from './types'
import { themeLocalStorageKey } from './shared'

const ThemeContext = createContext<ThemeContextType>({
  theme: null,
  setTheme: () => {},
})

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme | null>(null)

  useEffect(() => {
    // On mount, read from localStorage or system preference
    let initial: Theme | null = null
    const stored = window.localStorage.getItem(themeLocalStorageKey)
    if (stored === 'light' || stored === 'dark') {
      initial = stored
    } else {
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      initial = mql.matches ? 'dark' : 'light'
    }
    setThemeState(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  const setTheme = (theme: Theme | null) => {
    if (theme) {
      window.localStorage.setItem(themeLocalStorageKey, theme)
      setThemeState(theme)
      document.documentElement.setAttribute('data-theme', theme)
    } else {
      window.localStorage.removeItem(themeLocalStorageKey)
      // fallback to system
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const systemTheme = mql.matches ? 'dark' : 'light'
      setThemeState(null)
      document.documentElement.setAttribute('data-theme', systemTheme)
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
