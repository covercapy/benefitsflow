import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const actionSchema = z.object({ action: z.literal('complete'), taskId: z.string().uuid() })

const HR_ROLES = new Set(['BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP'])

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // -- Authenticated via Supabase --
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('worker_id, primary_role')
      .eq('id', user.id)
      .single()

    let query = supabase
      .from('inbox_tasks')
      .select('id, task_type, title, description, due_date, status, related_id, created_at, completed_at, workers(employee_id, first_name, last_name)')
      .order('created_at', { ascending: false })

    // HR roles see all tasks; employees are scoped to their own worker record
    if (profile && !HR_ROLES.has(profile.primary_role)) {
      const { data: worker } = await supabase
        .from('workers')
        .select('id')
        .eq('employee_id', profile.worker_id)
        .maybeSingle()
      if (worker) {
        query = query.eq('worker_id', worker.id)
      }
    }

    const { data, error } = await query
    if (error) {
      // Table may not exist yet in this environment
      if (error.code === '42P01') return NextResponse.json({ tasks: [] })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ tasks: data || [] })
  }

  // -- Demo cookie fallback --
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get('bf_demo')?.value
    if (raw) {
      const p = JSON.parse(decodeURIComponent(raw))
      if (p?.worker_id && typeof p.exp === 'number' && p.exp > Date.now()) {
        const role: string = p.role ?? ''

        let query = supabase
          .from('inbox_tasks')
          .select('id, task_type, title, description, due_date, status, related_id, created_at, completed_at, workers(employee_id, first_name, last_name)')
          .order('created_at', { ascending: false })

        // Scope to worker unless HR role
        if (!HR_ROLES.has(role)) {
          const { data: worker } = await supabase
            .from('workers')
            .select('id')
            .eq('employee_id', p.worker_id)
            .maybeSingle()
          if (worker) {
            query = query.eq('worker_id', worker.id)
          }
        }

        const { data, error } = await query
        if (error) {
          if (error.code === '42P01') return NextResponse.json({ tasks: [] })
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ tasks: data || [] })
      }
    }
  } catch { /* malformed cookie */ }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function POST(request: Request) {
  const parsed = actionSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid task action' }, { status: 400 })
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase.rpc('complete_inbox_task', { p_task_id: parsed.data.taskId })
  if (error) return NextResponse.json({ error: error.message }, { status: 422 })
  return NextResponse.json(data)
}
