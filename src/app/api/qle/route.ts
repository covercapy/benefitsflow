import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const submitSchema = z.object({
  qleType: z.enum(['MARRIAGE','BIRTH_ADOPTION','DIVORCE','DEPENDENT_LOSS','EMPLOYMENT_CHANGE','MOVE']),
  eventDate: z.string().date(),
  notes: z.string().trim().max(1000).optional(),
})

export async function POST(request: Request) {
  const parsed = submitSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid QLE submission' }, { status: 400 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase.rpc('submit_qle', {
    p_qle_code: `QLE_${parsed.data.qleType}`,
    p_event_date: parsed.data.eventDate,
    p_notes: parsed.data.notes || null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 422 })
  return NextResponse.json(data, { status: 201 })
}
