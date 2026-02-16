import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce',
        },
      }
    )
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code:', error)
      return NextResponse.redirect(`${origin}/?error=auth_failed`)
    }

    if (data.session) {
      // Set cookies for session persistence
      const cookieStore = await cookies()
      const maxAge = 60 * 60 * 24 * 7 // 7 days
      
      cookieStore.set('sb-access-token', data.session.access_token, {
        path: '/',
        maxAge,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
      })
      
      cookieStore.set('sb-refresh-token', data.session.refresh_token, {
        path: '/',
        maxAge,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: false,
      })
    }
  }

  // Redirect to home page
  return NextResponse.redirect(new URL('/', origin))
}
