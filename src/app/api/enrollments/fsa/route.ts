import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({ annualElection: z.number().min(0).max(3300), planYear: z.number().int().min(2026).max(2030) })
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid FSA election' }, { status: 400 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase.rpc('submit_fsa_election', { p_annual_election: parsed.data.annualElection, p_plan_year: parsed.data.planYear })
  if (error) return NextResponse.json({ error: error.message }, { status: 422 })
  return NextResponse.json(data, { status: 201 })
}
