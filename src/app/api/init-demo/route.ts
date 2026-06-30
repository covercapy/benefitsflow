import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This endpoint seeds all demo accounts. Call it once at setup.
// Protected by a secret token — set DEMO_INIT_SECRET in env vars.

const DEMO_PASSWORD = 'BenefitsFlow2026!'

// Accounts with custom passwords (personal logins outside the shared demo password)
const PERSONAL_ACCOUNTS = [
  {
    email: 'nsong@benefitsflow.demo',
    password: 'Poker50%',
    role: 'HRIS_ANALYST',
    worker_id: 'ESI-10000',
    display_name: 'Nathan Song',
    scenario: 'Personal login for Nathan Song — HRIS Analyst (full access)',
  },
]

const DEMO_ACCOUNTS = [
  {
    email: 'hris.analyst@benefitsflow.demo',
    role: 'HRIS_ANALYST',
    worker_id: 'ESI-10000',
    display_name: 'Nathan Song',
    scenario: 'HRIS Administrator — full access + impersonation',
  },
  {
    email: 'manager.maya@benefitsflow.demo',
    role: 'MANAGER',
    worker_id: 'ESI-10009',
    display_name: 'Maya Johnson',
    scenario: 'Manager — 5 direct reports at Sunrise Post-Acute Care',
  },
  {
    email: 'enrolled@benefitsflow.demo',
    role: 'EMPLOYEE',
    worker_id: 'ESI-10001',
    display_name: 'Jordan Rivera',
    scenario: 'Employee — active Cigna PPO coverage, annual max reached',
  },
  {
    email: 'newhire.waiting@benefitsflow.demo',
    role: 'EMPLOYEE',
    worker_id: 'ESI-10004',
    display_name: 'Elena Vasquez',
    scenario: 'New hire — day 30 of 90-day waiting period',
  },
  {
    email: 'newhire.eligible@benefitsflow.demo',
    role: 'EMPLOYEE',
    worker_id: 'ESI-10005',
    display_name: 'Marcus Williams',
    scenario: 'New hire — day 91, enrollment window now open',
  },
  {
    email: 'benefits.partner@benefitsflow.demo',
    role: 'BENEFITS_PARTNER',
    worker_id: 'ESI-10002',
    display_name: 'Taylor Chen',
    scenario: 'Benefits Partner — eligibility exceptions, life events',
  },
]

export async function POST(request: Request) {
  const secret = request.headers.get('x-init-secret')
  if (secret !== process.env.DEMO_INIT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Must use service role key — never expose to client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const results: { email: string; status: string; error?: string }[] = []

  const allAccounts = [
    ...DEMO_ACCOUNTS.map(a => ({ ...a, password: DEMO_PASSWORD })),
    ...PERSONAL_ACCOUNTS,
  ]

  for (const account of allAccounts) {
    try {
      // Create auth user with role stored in metadata
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: (account as typeof allAccounts[number]).password,
        email_confirm: true,
        user_metadata: {
          role: account.role,
          worker_id: account.worker_id,
          display_name: account.display_name,
          scenario: account.scenario,
        },
      })

      if (authError) {
        // If already exists, update metadata
        if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
          results.push({ email: account.email, status: 'already_exists' })
          continue
        }
        results.push({ email: account.email, status: 'error', error: authError.message })
        continue
      }

      // Insert into user_profiles
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: authData.user.id,
            worker_id: account.worker_id,
            display_name: account.display_name,
            primary_role: account.role,
          })

        if (profileError && !profileError.message.includes('does not exist')) {
          results.push({ email: account.email, status: 'profile_error', error: profileError.message })
          continue
        }
      }

      results.push({ email: account.email, status: 'created' })
    } catch (err) {
      results.push({ email: account.email, status: 'exception', error: String(err) })
    }
  }

  return NextResponse.json({ results, password: DEMO_PASSWORD })
}

// GET — just describe available accounts (no auth needed, public info)
export async function GET() {
  return NextResponse.json({
    accounts: DEMO_ACCOUNTS.map(a => ({
      email: a.email,
      role: a.role,
      name: a.display_name,
      scenario: a.scenario,
    })),
    password: DEMO_PASSWORD,
    setup_instructions: 'POST to /api/init-demo with header x-init-secret: <DEMO_INIT_SECRET> to create all accounts',
  })
}
