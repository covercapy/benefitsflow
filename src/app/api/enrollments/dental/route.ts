import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthContext } from '@/lib/server-auth'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const enrollmentSchema = z.object({
  planChoice: z.enum(['PPO', 'DHMO', 'WAIVE']),
  coverageTier: z.enum(['EO', 'ES', 'EC', 'EF']).nullable(),
  providerId: z.string().uuid().nullable().optional(),
  dependentIds: z.array(z.string().uuid()).default([]),
  waiveReason: z.string().trim().max(500).nullable().optional(),
})

export async function POST(request: Request) {
  const context = await getAuthContext()
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = enrollmentSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid enrollment request', details: parsed.error.flatten() }, { status: 400 })
  }

  if (parsed.data.planChoice !== 'WAIVE' && !parsed.data.coverageTier) {
    return NextResponse.json({ error: 'Coverage tier is required' }, { status: 400 })
  }

  const { supabase, profile } = context

  // For Supabase-auth users the RPC runs under their session (RLS applies).
  // For demo-cookie users we need the service client so the RPC can identify
  // the worker row — the function is SECURITY DEFINER so it's safe.
  let rpcClient = supabase
  if (profile.source === 'demo_cookie') {
    rpcClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    ) as typeof supabase
  }

  // For demo cookie users the RPC relies on auth.uid() which is null.
  // Fall back to a direct upsert into dental_elections via the worker lookup.
  if (profile.source === 'demo_cookie') {
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Look up the worker row
    const { data: worker } = await serviceClient
      .from('workers')
      .select('id, work_state')
      .eq('employee_id', profile.worker_id)
      .maybeSingle()

    if (!worker) {
      return NextResponse.json({
        confirmation_number: `DEMO-${Date.now()}`,
        message: 'Demo enrollment recorded (worker row not found — run init-demo to link accounts)',
        status: 'SUBMITTED',
      }, { status: 201 })
    }

    // Get the carrier plan ID for the chosen plan type and worker state
    const { data: plan } = await serviceClient
      .from('dental_plans')
      .select('id')
      .eq('plan_type', parsed.data.planChoice === 'WAIVE' ? 'PPO' : parsed.data.planChoice)
      .limit(1)
      .maybeSingle()

    const confirmationNumber = `CF-${Date.now().toString(36).toUpperCase()}`
    const { error: upsertError } = await serviceClient
      .from('dental_elections')
      .upsert({
        worker_id: worker.id,
        plan_id: plan?.id ?? null,
        coverage_tier: parsed.data.planChoice === 'WAIVE' ? null : parsed.data.coverageTier,
        enrollment_status: parsed.data.planChoice === 'WAIVE' ? 'WAIVED' : 'SUBMITTED',
        waived: parsed.data.planChoice === 'WAIVE',
        waive_reason: parsed.data.waiveReason ?? null,
        effective_date: new Date().toISOString().split('T')[0],
        confirmation_number: confirmationNumber,
        selected_dependents: '[]',
      }, { onConflict: 'worker_id' })

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 422 })
    }

    return NextResponse.json({
      confirmation_number: confirmationNumber,
      status: parsed.data.planChoice === 'WAIVE' ? 'WAIVED' : 'SUBMITTED',
    }, { status: 201 })
  }

  // Standard Supabase session — use the RPC
  const { data, error } = await supabase.rpc('submit_dental_enrollment', {
    p_plan_choice: parsed.data.planChoice,
    p_coverage_tier: parsed.data.coverageTier,
    p_provider_id: parsed.data.providerId || null,
    p_dependent_ids: parsed.data.dependentIds,
    p_waive_reason: parsed.data.waiveReason || null,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 422 })
  }

  return NextResponse.json(data, { status: 201 })
}
