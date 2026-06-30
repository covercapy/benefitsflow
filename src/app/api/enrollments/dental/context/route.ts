import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/server-auth'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET() {
  const context = await getAuthContext()
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { supabase, profile } = context

  // For Supabase-auth users: look up worker by auth_user_id.
  // For demo-cookie users: look up worker by employee_id (worker_id field).
  let worker: Record<string, unknown> | null = null
  let workerError: { message: string } | null = null

  if (profile.source === 'supabase' && profile.user_id) {
    const { data, error } = await supabase
      .from('workers')
      .select('id, employee_id, first_name, last_name, work_state, hire_date, enrollment_deadline')
      .eq('auth_user_id', profile.user_id)
      .single()
    worker = data as Record<string, unknown> | null
    workerError = error
  } else {
    // Demo cookie — use service role to bypass RLS for the worker lookup
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data, error } = await serviceClient
      .from('workers')
      .select('id, employee_id, first_name, last_name, work_state, hire_date, enrollment_deadline')
      .eq('employee_id', profile.worker_id)
      .maybeSingle()
    worker = data as Record<string, unknown> | null
    workerError = error
  }

  if (workerError || !worker) {
    // Return a synthetic worker profile from the cookie data so the enrollment
    // wizard can still show personalized info (name, employee ID, state) even
    // if the workers row doesn't exist yet.
    if (profile.source === 'demo_cookie') {
      return NextResponse.json({
        worker: {
          id: null,
          employee_id: profile.worker_id,
          first_name: profile.display_name.split(' ')[0] || 'Demo',
          last_name: profile.display_name.split(' ').slice(1).join(' ') || 'User',
          work_state: 'CA',
          hire_date: new Date().toISOString().split('T')[0],
          enrollment_deadline: null,
        },
        dependents: [],
        providers: [],
      })
    }
    return NextResponse.json({ error: 'No worker is linked to this account' }, { status: 403 })
  }

  const [{ data: dependents }, { data: providers }] = await Promise.all([
    supabase
      .from('dependents')
      .select('id, first_name, last_name, relationship, date_of_birth, has_other_employer_coverage')
      .eq('worker_id', worker.id as string)
      .order('date_of_birth'),
    supabase
      .from('dhmo_providers')
      .select('id, provider_name, practice_name, address, city, state, zip, phone, accepting_new_patients, languages')
      .eq('state', worker.work_state as string)
      .limit(25),
  ])

  return NextResponse.json({ worker, dependents: dependents || [], providers: providers || [] })
}
