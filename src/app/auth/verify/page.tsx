'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppDispatch } from '@/hooks/redux'
import { verifyMagicLink } from '@/store/slices/authSlice'
import { useToast } from '@/components/ui/use-toast'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token')
      const email = searchParams.get('email')

      if (!token || !email) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Invalid verification link',
        })
        router.push('/')
        return
      }

      try {
        await dispatch(verifyMagicLink({ token, email })).unwrap()
        toast({
          title: 'Success',
          description: 'Email verified successfully',
        })
        router.push('/')
      } catch (_error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to verify email',
        })
        router.push('/')
      }
    }

    verify()
  }, [searchParams, dispatch, router, toast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verifying your email...
          </h2>
          <p className="mt-4 text-center text-base text-gray-500">
            Please wait while we verify your email address.
          </p>
        </div>
      </div>
    </div>
  )
}
