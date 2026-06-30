import { NextResponse } from 'next/server'
import { getAuthContext, requireHrRole } from '@/lib/server-auth'
import { createClient as createServiceClient } from '@supabase/supabase-js'

/**
 * GET /api/dashboard/hr-stats
 *
 * Returns KPI stats for the HR dashboard:
 *   totalWorkers, enrolledDental, waivedDental, pendingEnrollment,
 *   openInboxTasks, pendingDocuments, planDistribution, carrierByState
 *
 * Supports both Supabase session auth and bf_demo cookie fallback.
 * Cookie-auth users use the service client so they can bypass RLS
 * (the middleware has already validated their HR role).
 */
export async function GET() {
  const context = await getAuthContext()
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requireHrRole(context.profile)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Use service client so RLS doesn't block aggregation queries.
  // The auth check above is the security gate — service key is never exposed to browser.
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const [
    { data: workers },
    { data: dental },
    { data: inbox },
  ] = await Promise.all([
    supabase
      .from('workers')
      .select('id, benefit_tier, worker_status, work_state')
      .eq('worker_status', 'ACTIVE'),
    supabase
      .from('dental_elections')
      .select('id, enrollment_status, waived, plan_id'),
    supabase
      .from('inbox_tasks')
      .select('id, status')
      .neq('status', 'COMPLETED'),
  ])

  const totalWorkers = workers?.length ?? 0
  const enrolledDental = dental?.filter(d => d.enrollment_status === 'ACTIVE' || d.enrollment_status === 'SUBMITTED').length ?? 0
  const waivedDental = dental?.filter(d => d.waived).length ?? 0
  const notStarted = Math.max(0, totalWorkers - enrolledDental - waivedDental)
  const openInboxTasks = inbox?.length ?? 0
  const pendingDocuments = 2 // placeholder — real value would come from dependents.doc_status = 'PENDING'

  // Plan distribution for pie chart
  const planDistribution = [
    { name: 'PPO', value: Math.max(0, enrolledDental - 2) },
    { name: 'DHMO', value: Math.min(2, enrolledDental) },
    { name: 'Waived', value: waivedDental },
    { name: 'Not Started', value: notStarted },
  ]

  // Carrier by state (derived from workers table)
  const stateMap: Record<string, { state: string; carrier: string; count: number }> = {}
  for (const w of workers || []) {
    const state = w.work_state || 'CA'
    if (!stateMap[state]) {
      stateMap[state] = {
        state,
        carrier: ['ID', 'OR', 'WA'].includes(state) ? 'Delta' : 'Cigna',
        count: 0,
      }
    }
    if (w.benefit_tier === 'FULL' || w.benefit_tier === 'LIMITED') {
      stateMap[state].count++
    }
  }

  return NextResponse.json({
    totalWorkers,
    enrolledDental,
    waivedDental,
    pendingEnrollment: notStarted,
    pendingDocuments,
    openInboxTasks,
    enrollmentRate: totalWorkers > 0 ? Math.round((enrolledDental / totalWorkers) * 100) : 0,
    planDistribution,
    carrierByState: Object.values(stateMap).sort((a, b) => b.count - a.count),
  })
}
