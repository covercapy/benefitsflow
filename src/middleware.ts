import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/demo-accounts',
  '/api/init-demo',
  '/api/demo-login',
  '/api/logout',
]
const HR_ONLY_PREFIXES = [
  '/audit', '/employees', '/invoices', '/organizations', '/payroll',
  '/processes', '/projects', '/reports', '/workers',
]

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

  // Validate the user with Supabase. Never trust unsigned client cookies or
  // getSession() alone for server-side authorization.
  const { data: { user } } = await supabase.auth.getUser()

  // Demo cookie fallback — allows bf_demo cookie sessions (username shortcut logins,
  // or when Supabase is unreachable) to pass through middleware.
  let demoRole: string | null = null
  if (!user) {
    try {
      const raw = request.cookies.get('bf_demo')?.value
      if (raw) {
        const p = JSON.parse(decodeURIComponent(raw))
        if (p?.worker_id && typeof p.exp === 'number' && p.exp > Date.now()) {
          demoRole = p.role ?? null
        }
      }
    } catch { /* malformed cookie — ignore */ }
  }

  const isAuthed = !!user || demoRole !== null

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

  // UI state never grants access. Resolve the authoritative database role
  // before allowing HR operations routes.
  if (HR_ONLY_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    let role: string | null = null
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('primary_role')
        .eq('id', user.id)
        .single()
      role = profile?.primary_role ?? null
    } else {
      role = demoRole
    }
    if (!['BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP'].includes(role || '')) {
      return NextResponse.redirect(new URL('/dashboard?access=denied', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
