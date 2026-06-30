import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({ tier: z.enum(['EO','ES','EC','EF','WAIVE']) })
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid vision election' }, { status: 400 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const waived = parsed.data.tier === 'WAIVE'
  const { data, error } = await supabase.rpc('submit_vision_election', { p_tier: waived ? 'EO' : parsed.data.tier, p_waived: waived })
  if (error) return NextResponse.json({ error: error.message }, { status: 422 })
  return NextResponse.json(data, { status: 201 })
}
