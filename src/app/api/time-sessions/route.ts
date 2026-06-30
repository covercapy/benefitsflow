import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/** Returns the current bi-monthly pay period string, e.g. '2026-07-01/2026-07-15' */
function currentPayPeriod(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = now.getDate()
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate()
  return d <= 15
    ? `${y}-${m}-01/${y}-${m}-15`
    : `${y}-${m}-16/${y}-${m}-${lastDay}`
}

// ─── POST: clock_in or clock_out ──────────────────────────────────────────────
export async function POST(request: NextRequest) {
  let body: { action?: string; worker_id?: string; display_name?: string; session_id?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { action, worker_id, display_name, session_id } = body
  if (!action || !worker_id) {
    return NextResponse.json({ error: 'Missing action or worker_id' }, { status: 400 })
  }

  const supabase = getSupabase()

  // ── Clock In ──
  if (action === 'clock_in') {
    const { data, error } = await supabase
      .from('time_sessions')
      .insert({
        worker_id,
        display_name: display_name || worker_id,
        clock_in: new Date().toISOString(),
        pay_period: currentPayPeriod(),
      })
      .select('id, clock_in, pay_period')
      .single()

    if (error) {
      console.error('clock_in error:', error)
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
    }
    return NextResponse.json({ session_id: data.id, clock_in: data.clock_in, pay_period: data.pay_period })
  }

  // ── Clock Out ──
  if (action === 'clock_out') {
    if (!session_id) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })

    const clockOut = new Date()

    // Fetch clock_in to compute duration
    const { data: existing } = await supabase
      .from('time_sessions')
      .select('clock_in')
      .eq('id', session_id)
      .single()

    const durationMinutes = existing?.clock_in
      ? Math.round((clockOut.getTime() - new Date(existing.clock_in).getTime()) / 60000)
      : null

    const { error } = await supabase
      .from('time_sessions')
      .update({
        clock_out: clockOut.toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq('id', session_id)

    if (error) {
      console.error('clock_out error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, duration_minutes: durationMinutes, clock_out: clockOut.toISOString() })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

// ─── GET: list sessions ───────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const worker_id  = searchParams.get('worker_id')
  const pay_period = searchParams.get('pay_period') || currentPayPeriod()
  const all        = searchParams.get('all') === '1'

  const supabase = getSupabase()

  let query = supabase
    .from('time_sessions')
    .select('id, worker_id, display_name, clock_in, clock_out, duration_minutes, pay_period, created_at')
    .order('clock_in', { ascending: false })

  if (worker_id) query = query.eq('worker_id', worker_id)
  if (!all)      query = query.eq('pay_period', pay_period)

  const { data, error } = await query.limit(500)

  if (error) {
    // Table might not exist yet — return empty gracefully
    return NextResponse.json({ sessions: [], pay_period, error: error.message })
  }

  // Aggregate: total minutes + session count per worker for this period
  const byWorker: Record<string, { worker_id: string; display_name: string; session_count: number; total_minutes: number }> = {}
  for (const s of (data || [])) {
    if (!byWorker[s.worker_id]) {
      byWorker[s.worker_id] = { worker_id: s.worker_id, display_name: s.display_name || s.worker_id, session_count: 0, total_minutes: 0 }
    }
    byWorker[s.worker_id].session_count += 1
    byWorker[s.worker_id].total_minutes += s.duration_minutes || 0
  }

  return NextResponse.json({
    sessions: data || [],
    by_worker: Object.values(byWorker),
    pay_period,
  })
}
