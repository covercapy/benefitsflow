import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * POST /api/demo-login
 *
 * Sets a bf_demo cookie for the requested demo persona — no password,
 * no Supabase auth, no env vars required. Works out of the box.
 *
 * The bf_demo cookie is read by getAuthContext() and middleware as a valid
 * auth source, giving the demo user full access to the app for 8 hours.
 */

interface DemoPersona {
  worker_id: string
  display_name: string
  role: string
}

const DEMO_PERSONAS: Record<string, DemoPersona> = {
  'hris.analyst@benefitsflow.demo':   { worker_id: 'ESI-10000', display_name: 'Nathan Song',    role: 'HRIS_ANALYST' },
  'manager.maya@benefitsflow.demo':   { worker_id: 'ESI-10009', display_name: 'Maya Johnson',   role: 'MANAGER' },
  'enrolled@benefitsflow.demo':       { worker_id: 'ESI-10001', display_name: 'Jordan Rivera',  role: 'EMPLOYEE' },
  'billrush@benefitsflow.demo':       { worker_id: 'ESI-10008', display_name: 'Bill Rush',      role: 'EMPLOYEE' },
  'newhire.waiting@benefitsflow.demo':  { worker_id: 'ESI-10004', display_name: 'Elena Vasquez', role: 'EMPLOYEE' },
  'newhire.eligible@benefitsflow.demo': { worker_id: 'ESI-10005', display_name: 'Marcus Williams', role: 'EMPLOYEE' },
  'benefits.partner@benefitsflow.demo': { worker_id: 'ESI-10002', display_name: 'Taylor Chen',  role: 'BENEFITS_PARTNER' },
}

const requestSchema = z.object({ email: z.string().email() })

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const persona = DEMO_PERSONAS[parsed.data.email]
  if (!persona) {
    return NextResponse.json({ error: 'Unknown demo account' }, { status: 400 })
  }

  // Build the bf_demo cookie payload — same format getAuthContext() + middleware expect
  const payload = {
    email:        parsed.data.email,
    role:         persona.role,
    worker_id:    persona.worker_id,
    display_name: persona.display_name,
    exp:          Date.now() + 8 * 60 * 60 * 1000, // 8 hours
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('bf_demo', encodeURIComponent(JSON.stringify(payload)), {
    path:     '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge:   8 * 60 * 60, // 8 hours in seconds
    secure:   process.env.NODE_ENV === 'production',
  })

  return response
}
