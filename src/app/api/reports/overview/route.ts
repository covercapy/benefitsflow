import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('user_profiles').select('primary_role').eq('id', user.id).single()
  if (!profile || !['BENEFITS_PARTNER','HRIS_ANALYST','HR_LEADERSHIP'].includes(profile.primary_role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [{ data: workers, error: workerError }, { data: accumulators }] = await Promise.all([
    supabase.from('vw_worker_directory').select('*'),
    supabase.from('vw_dental_accumulator_report').select('*'),
  ])
  if (workerError) return NextResponse.json({ error: workerError.message }, { status: 500 })

  const byOrg = new Map<string, { org: string; eligible: number; enrolled: number; waived: number; notStarted: number }>()
  const byPlan = new Map<string, number>()
  for (const worker of workers || []) {
    const org = worker.organization || 'Unassigned'
    const row = byOrg.get(org) || { org, eligible: 0, enrolled: 0, waived: 0, notStarted: 0 }
    if (['FULL', 'LIMITED'].includes(worker.benefit_tier)) row.eligible += 1
    if (['ACTIVE', 'SUBMITTED'].includes(worker.dental_status)) row.enrolled += 1
    else if (worker.dental_status === 'WAIVED') row.waived += 1
    else if (['FULL', 'LIMITED'].includes(worker.benefit_tier)) row.notStarted += 1
    byOrg.set(org, row)
    const plan = worker.dental_status === 'WAIVED' ? 'Waived' : worker.dental_plan === '—' ? 'Not Started' : worker.dental_plan
    byPlan.set(plan, (byPlan.get(plan) || 0) + 1)
  }

  const colors: Record<string, string> = { Waived: '#6b7280', 'Not Started': '#f59e0b' }
  return NextResponse.json({
    enrollmentByOrg: [...byOrg.values()],
    planDistribution: [...byPlan].map(([name, value]) => ({ name, value, color: colors[name] || '#2563eb' })),
    accumulators: (accumulators || []).map(item => ({
        name: item.display_name,
        plan: item.plan_name || '—',
        deductibleUsed: Number(item.deductible_individual_used || 0),
        deductibleMax: Number(item.deductible_individual || 0),
        annualUsed: Number(item.annual_max_used || 0),
        annualMax: Number(item.calendar_year_max || 0),
        orthoUsed: Number(item.ortho_lifetime_used || 0),
        orthoMax: Number(item.ortho_lifetime_max || 0),
      })),
  })
}
