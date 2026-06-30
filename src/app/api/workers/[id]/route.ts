import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('user_profiles').select('primary_role').eq('id', user.id).single()
  if (!profile || !['BENEFITS_PARTNER','HRIS_ANALYST','HR_LEADERSHIP'].includes(profile.primary_role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: worker, error } = await supabase
    .from('workers')
    .select('*, job_profiles(title, job_families(name)), organizations(name)')
    .eq('employee_id', params.id)
    .single()
  if (error || !worker) return NextResponse.json({ error: 'Worker not found' }, { status: 404 })

  const [{ data: election }, { data: accumulator }, { data: dependents }] = await Promise.all([
    supabase.from('dental_elections')
      .select('*, dental_plans(plan_name, plan_type, deductible_individual, calendar_year_max, ortho_lifetime_max)')
      .eq('worker_id', worker.id).is('end_date', null).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('dental_accumulators').select('*').eq('worker_id', worker.id).order('plan_year', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('dependents').select('id, first_name, last_name, relationship, date_of_birth, doc_status').eq('worker_id', worker.id).order('date_of_birth'),
  ])

  return NextResponse.json({ worker, election, accumulator, dependents: dependents || [] })
}
