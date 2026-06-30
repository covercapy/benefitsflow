import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('user_profiles').select('primary_role').eq('id', user.id).single()
  if (!profile || !['BENEFITS_PARTNER','HRIS_ANALYST','HR_LEADERSHIP'].includes(profile.primary_role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { data, error } = await supabase.from('vw_worker_directory').select('*').order('display_name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ workers: data || [] })
}
