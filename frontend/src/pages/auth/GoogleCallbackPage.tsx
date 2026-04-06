import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function GoogleCallbackPage() {
  const { googleLogin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const googleError = searchParams.get('error')

    if (googleError) {
      setError('Google sign-in was cancelled or denied.')
      return
    }

    if (!code) {
      setError('No authorization code received from Google.')
      return
    }

    googleLogin(code)
      .then(() => navigate('/', { replace: true }))
      .catch((err) => {
        const message = err?.response?.data?.error
          || 'Failed to sign in with Google. Please try again.'
        setError(message)
      })
  }, [searchParams, googleLogin, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-2">Sign-in Failed</h2>
            <p className="text-sm text-on-surface-variant">{error}</p>
          </div>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="space-y-6 w-full max-w-xs px-8">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-high animate-pulse mx-auto" />
        <div className="w-40 h-4 rounded bg-surface-container-high animate-pulse mx-auto" />
        <div className="w-full h-3 rounded bg-surface-container-high animate-pulse" />
        <div className="w-2/3 h-3 rounded bg-surface-container-high animate-pulse mx-auto" />
      </div>
    </div>
  )
}
