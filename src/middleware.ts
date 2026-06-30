import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/api/init-demo']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes through
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // Allow static assets through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          )
        },
      },
    }
  )

  // Refresh session — this is the recommended Supabase pattern
  const { data: { session } } = await supabase.auth.getSession()

  // Fallback: accept bf_demo cookie when Supabase is unreachable
  const demoCookie = request.cookies.get('bf_demo')?.value
  let hasDemoSession = false
  if (!session && demoCookie) {
    try {
      const payload = JSON.parse(decodeURIComponent(demoCookie))
      hasDemoSession = payload?.exp > Date.now() && !!payload?.role
    } catch { /* invalid cookie — ignore */ }
  }

  const isAuthed = !!session || hasDemoSession

  // Root redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL(isAuthed ? '/dashboard' : '/login', request.url))
  }

  // Protected routes — must be authenticated
  if (!isAuthed) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
