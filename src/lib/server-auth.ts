/**
 * server-auth.ts — Server-side auth context resolution for Route Handlers.
 *
 * Priority: Supabase session → bf_demo cookie fallback.
 * Call getAuthContext() at the top of any Route Handler that needs identity.
 *
 * Returns null when neither source provides a valid session.
 * The caller should respond with 401 on null.
 */

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface AuthProfile {
  worker_id: string
  display_name: string
  primary_role: string
  user_id: string | null
  source: 'supabase' | 'demo_cookie'
}

export interface AuthContext {
  supabase: SupabaseClient
  profile: AuthProfile
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Real Supabase session — read profile from DB
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('worker_id, display_name, primary_role')
      .eq('id', user.id)
      .single()

    if (error || !profile) return null

    return {
      supabase,
      profile: {
        worker_id: profile.worker_id,
        display_name: profile.display_name,
        primary_role: profile.primary_role,
        user_id: user.id,
        source: 'supabase',
      },
    }
  }

  // bf_demo cookie fallback — allows demo accounts that logged in via /api/demo-login
  // to use all protected API routes without Supabase JWT.
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get('bf_demo')?.value
    if (raw) {
      const p = JSON.parse(decodeURIComponent(raw))
      if (
        p?.worker_id &&
        typeof p.exp === 'number' &&
        p.exp > Date.now() &&
        p.role
      ) {
        return {
          supabase,
          profile: {
            worker_id: p.worker_id,
            display_name: p.display_name ?? 'Demo User',
            primary_role: p.role,
            user_id: null,
            source: 'demo_cookie',
          },
        }
      }
    }
  } catch { /* malformed cookie */ }

  return null
}

/** Convenience: require HR role or return 403 payload */
export function requireHrRole(profile: AuthProfile): boolean {
  return ['BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP'].includes(profile.primary_role)
}
