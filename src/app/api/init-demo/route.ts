import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This endpoint seeds all demo accounts. Call it once at setup.
// Protected by a secret token — set DEMO_INIT_SECRET in env vars.

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
  {
    email: 'billrush@benefitsflow.demo',
    role: 'EMPLOYEE',
    worker_id: 'ESI-10010',
    display_name: 'Bill Rush',
    scenario: 'Employee — created via HR Admin panel demo',
  },
]

export async function POST(request: Request) {
  const secret = request.headers.get('x-init-secret')
  const expectedSecret = process.env.DEMO_INIT_SECRET
  const demoPassword = process.env.DEMO_ACCOUNT_PASSWORD
  if (!expectedSecret || !secret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!demoPassword) {
    return NextResponse.json({ error: 'DEMO_ACCOUNT_PASSWORD is not configured' }, { status: 503 })
  }

  // Must use service role key — never expose to client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const results: { email: string; status: string; error?: string }[] = []

  const allAccounts = DEMO_ACCOUNTS.map(account => ({ ...account, password: demoPassword }))
  const { data: existingPage, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 })
  const existingByEmail = new Map(existingPage.users.map(user => [user.email, user]))

  for (const account of allAccounts) {
    try {
      const metadata = {
        role: account.role,
        worker_id: account.worker_id,
        display_name: account.display_name,
        scenario: account.scenario,
      }
      let authUser = existingByEmail.get(account.email)

      if (authUser) {
        const { data, error } = await supabase.auth.admin.updateUserById(authUser.id, {
          password: account.password,
          email_confirm: true,
          user_metadata: metadata,
        })
        if (error) {
          results.push({ email: account.email, status: 'error', error: error.message })
          continue
        }
        authUser = data.user
      } else {
        const { data, error } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: metadata,
        })
        if (error || !data.user) {
          results.push({ email: account.email, status: 'error', error: error?.message || 'User creation failed' })
          continue
        }
        authUser = data.user
      }

      // Insert into user_profiles
      if (authUser) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: authUser.id,
            worker_id: account.worker_id,
            display_name: account.display_name,
            primary_role: account.role,
          })

        if (profileError && !profileError.message.includes('does not exist')) {
          results.push({ email: account.email, status: 'profile_error', error: profileError.message })
          continue
        }

        // Link the authoritative worker record to the auth account. HRIS demo
        // administrators may intentionally have no worker row.
        const { error: workerError } = await supabase
          .from('workers')
          .update({ auth_user_id: authUser.id })
          .eq('employee_id', account.worker_id)

        if (workerError && !workerError.message.includes('does not exist')) {
          results.push({ email: account.email, status: 'worker_link_error', error: workerError.message })
          continue
        }
      }

      results.push({ email: account.email, status: existingByEmail.has(account.email) ? 'updated' : 'created' })
    } catch (err) {
      results.push({ email: account.email, status: 'exception', error: String(err) })
    }
  }

  return NextResponse.json({ results })
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
    setup_instructions: 'POST to /api/init-demo with header x-init-secret: <DEMO_INIT_SECRET> to create all accounts',
  })
}
