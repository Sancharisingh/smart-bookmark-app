'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BookmarkApp from './bookmark-app'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
          onClick={() =>
            supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                queryParams: {
                  prompt: 'select_account',
                },
              },
            })
          }
          className="px-6 py-3 bg-black text-white rounded"
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return <BookmarkApp user={session.user} />
}
