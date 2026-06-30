import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { currentPayPeriod } from '@/lib/pay-period'
import { getAuthContext } from '@/lib/server-auth'

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('clock_in') }),
  z.object({ action: z.literal('clock_out'), session_id: z.string().uuid() }),
])

export async function POST(request: NextRequest) {
  const context = await getAuthContext()
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = actionSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid time action' }, { status: 400 })
  }

  const { supabase, profile } = context

  if (parsed.data.action === 'clock_in') {
    const { data: openSession } = await supabase
      .from('time_sessions')
      .select('id')
      .eq('worker_id', profile.worker_id)
      .is('clock_out', null)
      .maybeSingle()

    if (openSession) {
      return NextResponse.json({ error: 'Worker is already clocked in' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('time_sessions')
      .insert({
        worker_id: profile.worker_id,
        display_name: profile.display_name,
        clock_in: new Date().toISOString(),
        pay_period: currentPayPeriod(),
      })
      .select('id, clock_in, pay_period')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ session_id: data.id, clock_in: data.clock_in, pay_period: data.pay_period })
  }

  const clockOut = new Date()
  const { data: existing, error: readError } = await supabase
    .from('time_sessions')
    .select('clock_in')
    .eq('id', parsed.data.session_id)
    .eq('worker_id', profile.worker_id)
    .is('clock_out', null)
    .single()

  if (readError || !existing) {
    return NextResponse.json({ error: 'Open time session not found' }, { status: 404 })
  }

  const durationMinutes = Math.max(0, Math.round(
    (clockOut.getTime() - new Date(existing.clock_in).getTime()) / 60000
  ))

  const { error } = await supabase
    .from('time_sessions')
    .update({ clock_out: clockOut.toISOString(), duration_minutes: durationMinutes })
    .eq('id', parsed.data.session_id)
    .eq('worker_id', profile.worker_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update daily_attendance for today — best-effort, don't fail if table missing
  try {
    const workDate = new Date(existing.clock_in).toISOString().split('T')[0]
    await supabase.from('daily_attendance').upsert({
      work_date: workDate,
      worker_id: profile.worker_id,
      display_name: profile.display_name,
      first_clock_in: existing.clock_in,
      last_clock_out: clockOut.toISOString(),
      total_minutes: durationMinutes,
      shift_count: 1,
      pay_period: currentPayPeriod(),
      updated_at: clockOut.toISOString(),
    }, { onConflict: 'work_date,worker_id' })
  } catch { /* table may not exist yet — ignore */ }

  return NextResponse.json({ success: true, duration_minutes: durationMinutes, clock_out: clockOut.toISOString() })
}

export async function GET(request: NextRequest) {
  const context = await getAuthContext()
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const requestedWorker = searchParams.get('worker_id')
  const payPeriod = searchParams.get('pay_period') || currentPayPeriod()
  const wantsAll = searchParams.get('all') === '1'
  const { supabase, profile } = context
  const isHr = ['HRIS_ANALYST', 'BENEFITS_PARTNER', 'HR_LEADERSHIP'].includes(profile.primary_role)

  if ((wantsAll || (requestedWorker && requestedWorker !== profile.worker_id)) && !isHr) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let query = supabase
    .from('time_sessions')
    .select('id, worker_id, display_name, clock_in, clock_out, duration_minutes, pay_period, created_at')
    .order('clock_in', { ascending: false })

  if (!wantsAll) query = query.eq('worker_id', requestedWorker || profile.worker_id)
  query = query.eq('pay_period', payPeriod)

  const { data, error } = await query.limit(500)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const byWorker: Record<string, { worker_id: string; display_name: string; session_count: number; total_minutes: number }> = {}
  for (const session of data || []) {
    byWorker[session.worker_id] ??= {
      worker_id: session.worker_id,
      display_name: session.display_name || session.worker_id,
      session_count: 0,
      total_minutes: 0,
    }
    byWorker[session.worker_id].session_count += 1
    byWorker[session.worker_id].total_minutes += session.duration_minutes || 0
  }

  return NextResponse.json({ sessions: data || [], by_worker: Object.values(byWorker), pay_period: payPeriod })
}
