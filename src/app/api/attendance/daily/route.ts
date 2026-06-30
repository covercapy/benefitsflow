import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { currentPayPeriod } from '@/lib/pay-period'

async function getContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('worker_id, display_name, primary_role')
      .eq('id', user.id)
      .single()
    if (profile) return { supabase, profile }
  }
  // Cookie fallback
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get('bf_demo')?.value
    if (raw) {
      const p = JSON.parse(decodeURIComponent(raw))
      if (p?.worker_id && typeof p.exp === 'number' && p.exp > Date.now()) {
        return {
          supabase,
          profile: {
            worker_id: p.worker_id as string,
            display_name: (p.display_name ?? 'Demo User') as string,
            primary_role: (p.role ?? 'EMPLOYEE') as string,
          },
        }
      }
    }
  } catch { /* ignore */ }
  return null
}

export async function GET(request: NextRequest) {
  const context = await getContext()
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { supabase, profile } = context
  const { searchParams } = new URL(request.url)
  const payPeriod = searchParams.get('pay_period') || currentPayPeriod()
  const wantsAll = searchParams.get('all') === '1'
  const isHr = ['HRIS_ANALYST', 'BENEFITS_PARTNER', 'HR_LEADERSHIP'].includes(profile.primary_role)

  let query = supabase
    .from('daily_attendance')
    .select('id, work_date, worker_id, display_name, first_clock_in, last_clock_out, total_minutes, shift_count, pay_period')
    .order('work_date', { ascending: false })
    .order('worker_id', { ascending: true })

  if (payPeriod) query = query.eq('pay_period', payPeriod)
  if (!wantsAll || !isHr) query = query.eq('worker_id', profile.worker_id)

  const { data, error } = await query.limit(500)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ records: data || [], pay_period: payPeriod })
}
