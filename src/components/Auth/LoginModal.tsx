import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FadeInOut, ScaleInOut, SlideDownInOut, AnimatedButton } from '@/components/ui/animation'
import { Icon } from '@/components/Icon'
import { useToast } from '@/components/ui/toast'

const LoginModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const t = useTranslations()
  const { toast } = useToast()

  const handleGoogleLogin = async () => {
    const response = await fetch('/api/auth/google')
    const { authUrl } = await response.json()
    window.location.href = authUrl
  }

  const handleFacebookLogin = async () => {
    const response = await fetch('/api/auth/facebook')
    const { authUrl } = await response.json()
    window.location.href = authUrl
  }

  const handleMagicLinkLogin = async () => {
    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      setMessage(data.message)
      toast({
        title: 'Success',
        description: data.message,
        variant: 'default',
      })
    } catch (error) {
      console.error('Magic link error:', error)
      const errorMessage = 'Failed to send magic link. Please try again.'
      setMessage(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <FadeInOut
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <ScaleInOut className="bg-background border-border border p-6 rounded-lg shadow-lg max-w-md w-full mx-4 relative">
        <AnimatedButton
          onClick={onClose}
          className="rounded-full group justify-end w-full flex"
          aria-label={t('close')}
        >
          <Icon name="close" width={24} height={24} />
        </AnimatedButton>
        <SlideDownInOut className="text-2xl font-semibold mb-6 text-foreground flex justify-center">
          {t('login.title')}
        </SlideDownInOut>
        <div className="space-y-4">
          <AnimatedButton
            onClick={handleGoogleLogin}
            className="w-full flex items-center border-border border justify-center gap-2 bg-background hover:bg-background/80 text-foreground px-4 py-2 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t('login.google')}
          </AnimatedButton>
          <AnimatedButton
            onClick={handleFacebookLogin}
            className="w-full flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white px-4 py-2 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
            {t('login.facebook')}
          </AnimatedButton>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-foreground/60">{t('login.or')}</span>
            </div>
          </div>
          <div className="space-y-4">
            <input
              type="email"
              placeholder={t('login.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <AnimatedButton
              onClick={handleMagicLinkLogin}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors"
            >
              {t('login.magicLink')}
            </AnimatedButton>
            {message && (
              <SlideDownInOut className="text-sm text-foreground/60 text-center">
                {message}
              </SlideDownInOut>
            )}
          </div>
        </div>
      </ScaleInOut>
    </FadeInOut>
  )
}

export default LoginModal
