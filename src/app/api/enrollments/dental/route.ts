import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const enrollmentSchema = z.object({
  planChoice: z.enum(['PPO', 'DHMO', 'WAIVE']),
  coverageTier: z.enum(['EO', 'ES', 'EC', 'EF']).nullable(),
  providerId: z.string().uuid().nullable().optional(),
  dependentIds: z.array(z.string().uuid()).default([]),
  waiveReason: z.string().trim().max(500).nullable().optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = enrollmentSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid enrollment request', details: parsed.error.flatten() }, { status: 400 })
  }

  if (parsed.data.planChoice !== 'WAIVE' && !parsed.data.coverageTier) {
    return NextResponse.json({ error: 'Coverage tier is required' }, { status: 400 })
  }

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
