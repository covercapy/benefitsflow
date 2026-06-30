import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    // Cookie session fallback — parse bf_demo cookie
    try {
      const cookieStore = await cookies()
      const raw = cookieStore.get('bf_demo')?.value
      if (raw) {
        const p = JSON.parse(decodeURIComponent(raw))
        if (p?.worker_id && typeof p.exp === 'number' && p.exp > Date.now()) {
          return NextResponse.json({
            user: { id: null, email: p.email ?? null },
            profile: {
              worker_id: p.worker_id,
              display_name: p.display_name ?? 'Demo User',
              primary_role: p.role ?? 'EMPLOYEE',
            },
            worker: null,
            source: 'demo_cookie',
          })
        }
      }
    } catch { /* malformed cookie */ }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('worker_id, display_name, primary_role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Account is not linked to a worker profile' }, { status: 403 })
  }

  const { data: worker } = await supabase
    .from('workers')
    .select('id, employee_id, first_name, last_name, work_state, hire_date, enrollment_deadline, coverage_start_date')
    .eq('employee_id', profile.worker_id)
    .maybeSingle()

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    profile,
    worker,
  })
}
