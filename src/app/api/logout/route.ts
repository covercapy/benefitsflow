import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/logout
 *
 * Signs out the current user from Supabase and clears the bf_demo cookie.
 * Call this instead of (or in addition to) supabase.auth.signOut() on the client
 * when you need the bf_demo cookie cleared server-side.
 */
export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const response = NextResponse.json({ success: true })

  // Clear the demo cookie
  response.cookies.set('bf_demo', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
  })

  return response
}

// GET support so AppShell can href="/api/logout" as a simple link if needed
export async function GET() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const response = NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))

  response.cookies.set('bf_demo', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
  })

  return response
}
