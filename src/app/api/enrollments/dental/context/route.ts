import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: worker, error: workerError } = await supabase
    .from('workers')
    .select('id, employee_id, first_name, last_name, work_state, hire_date, enrollment_deadline')
    .eq('auth_user_id', user.id)
    .single()

  if (workerError || !worker) {
    return NextResponse.json({ error: 'No worker is linked to this account' }, { status: 403 })
  }

  const [{ data: dependents }, { data: providers }] = await Promise.all([
    supabase
      .from('dependents')
      .select('id, first_name, last_name, relationship, date_of_birth, has_other_employer_coverage')
      .eq('worker_id', worker.id)
      .order('date_of_birth'),
    supabase
      .from('dhmo_providers')
      .select('id, provider_name, practice_name, address, city, state, zip, phone, accepting_new_patients, languages')
      .eq('state', worker.work_state)
      .limit(25),
  ])

  return NextResponse.json({ worker, dependents: dependents || [], providers: providers || [] })
}
