import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const allowedDemoAccounts = new Set([
  'hris.analyst@benefitsflow.demo',
  'manager.maya@benefitsflow.demo',
  'enrolled@benefitsflow.demo',
  'newhire.waiting@benefitsflow.demo',
  'newhire.eligible@benefitsflow.demo',
  'benefits.partner@benefitsflow.demo',
])

const requestSchema = z.object({ email: z.string().email() })

export async function POST(request: Request) {
  const password = process.env.DEMO_ACCOUNT_PASSWORD
  if (!password) {
    return NextResponse.json({ error: 'Demo login is not configured' }, { status: 503 })
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success || !allowedDemoAccounts.has(parsed.data.email)) {
    return NextResponse.json({ error: 'Unknown demo account' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password,
  })

  if (error) {
    return NextResponse.json({ error: 'Demo account is unavailable. Initialize demo accounts first.' }, { status: 401 })
  }

  return NextResponse.json({ success: true })
}
