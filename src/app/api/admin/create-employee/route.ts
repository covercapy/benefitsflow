import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { z } from 'zod'

const bodySchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['EMPLOYEE', 'MANAGER', 'BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP']),
  employee_id: z.string().min(1),
  department: z.string().optional(),
  display_name: z.string().optional(),
})

async function getCallerRole(): Promise<string | null> {
  // Check Supabase session
  const { createClient: createServerClient } = await import('@/lib/supabase/server')
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('primary_role')
        .eq('id', user.id)
        .single()
      return profile?.primary_role ?? null
    }
  } catch { /* fallthrough to cookie */ }

  // Cookie session fallback
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get('bf_demo')?.value
    if (raw) {
      const p = JSON.parse(decodeURIComponent(raw))
      if (p?.worker_id && typeof p.exp === 'number' && p.exp > Date.now()) {
        return p.role ?? null
      }
    }
  } catch { /* ignore */ }

  return null
}

export async function POST(request: Request) {
  const callerRole = await getCallerRole()
  if (!['HRIS_ANALYST', 'HR_LEADERSHIP'].includes(callerRole ?? '')) {
    return NextResponse.json({ error: 'Forbidden — HRIS Analyst role required' }, { status: 403 })
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { first_name, last_name, email, role, employee_id, department, display_name } = parsed.data
  const resolvedName = display_name || `${first_name} ${last_name}`

  // Use service role key — bypasses RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const tempPassword = `BF-${employee_id}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

  // Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      role,
      worker_id: employee_id,
      display_name: resolvedName,
    },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Insert user_profiles row
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: authData.user.id,
      worker_id: employee_id,
      display_name: resolvedName,
      primary_role: role,
    })

  if (profileError) {
    // Clean up auth user if profile insert fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // Optionally insert a workers row if table exists
  await supabase.from('workers').insert({
    employee_id,
    first_name,
    last_name,
    work_email: email,
    worker_status: 'ACTIVE',
    benefit_tier: 'STANDARD',
    department: department || 'General',
    hire_date: new Date().toISOString().split('T')[0],
  }).select().maybeSingle() // ignore error if workers table has different schema

  return NextResponse.json({
    success: true,
    user_id: authData.user.id,
    employee_id,
    email,
    display_name: resolvedName,
    temp_password: tempPassword,
    role,
  })
}
