'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BookmarkApp from './bookmark-app'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Handle OAuth callback with hash fragments (fallback for localhost redirects)
    const handleHashRedirect = async () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname)
          
          // Set the session manually
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          
          if (data.session) {
            setSession(data.session)
            setLoading(false)
          }
        }
      }
    }

    handleHashRedirect()

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoading(false)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <button
          onClick={() => {
            const origin = typeof window !== 'undefined' ? window.location.origin : ''
            supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${origin}/auth/callback`,
                queryParams: {
                  prompt: 'select_account',
                },
              },
            })
          }}
          className="px-6 py-3 bg-black text-white rounded"
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return <BookmarkApp user={session.user} />
}
