'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { setUser, clearError } from '@/store/slices/authSlice'
import type { User } from '@butelkawineshop/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  verifyMagicLink: (token: string, email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          dispatch(setUser(data.user))
        } else {
          dispatch(setUser(null))
        }
      } catch (err) {
        console.error('Session check failed:', err)
        dispatch(setUser(null))
      }
    }

    checkSession()
  }, [dispatch])

  const verifyMagicLink = async (token: string, email: string) => {
    try {
      dispatch(clearError())

      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      dispatch(setUser(data.user))
      router.push('/')
    } catch (err) {
      console.error('Magic link verification failed:', err)
      throw err
    }
  }

  const value = {
    user,
    isLoading,
    error,
    verifyMagicLink,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
