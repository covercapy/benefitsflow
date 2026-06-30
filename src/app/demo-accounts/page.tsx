'use client'

import { useState, useEffect } from 'react'
import { Heart, Shield, Users, CheckCircle2, Copy, Check, ExternalLink, Terminal, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface DemoAccount {
  email: string
  role: string
  name: string
  scenario: string
}

const ROLE_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  HRIS_ANALYST:     { label: 'HRIS Analyst',    color: 'violet', icon: Shield },
  MANAGER:          { label: 'Manager',          color: 'emerald', icon: Users },
  EMPLOYEE:         { label: 'Employee',         color: 'blue', icon: CheckCircle2 },
  BENEFITS_PARTNER: { label: 'Benefits Partner', color: 'amber', icon: Shield },
  HR_LEADERSHIP:    { label: 'HR Leadership',    color: 'rose', icon: Shield },
}

const SHORTCUTS: Record<string, string> = {
  'hris.analyst@benefitsflow.demo': 'nsong',
  'manager.maya@benefitsflow.demo': 'maya',
  'enrolled@benefitsflow.demo': 'jordan',
  'billrush@benefitsflow.demo': 'billrush',
}

const COLOR_CLASSES: Record<string, { badge: string; icon: string; border: string }> = {
  violet: { badge: 'bg-violet-100 text-violet-700', icon: 'bg-violet-100 text-violet-600', border: 'border-violet-200' },
  emerald: { badge: 'bg-emerald-100 text-emerald-700', icon: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-200' },
  blue: { badge: 'bg-blue-100 text-blue-700', icon: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
  amber: { badge: 'bg-amber-100 text-amber-700', icon: 'bg-amber-100 text-amber-600', border: 'border-amber-200' },
  rose: { badge: 'bg-rose-100 text-rose-700', icon: 'bg-rose-100 text-rose-600', border: 'border-rose-200' },
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button
      onClick={copy}
      title={`Copy ${label}`}
      className="flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

export default function DemoAccountsPage() {
  const [accounts, setAccounts] = useState<DemoAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [initState, setInitState] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [initResult, setInitResult] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/init-demo')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setAccounts(data.accounts || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function runInit() {
    setInitState('running')
    setInitResult(null)
    try {
      const secret = prompt('Enter DEMO_INIT_SECRET to seed demo accounts:')
      if (!secret) { setInitState('idle'); return }
      const res = await fetch('/api/init-demo', {
        method: 'POST',
        headers: { 'x-init-secret': secret },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Init failed')
      const created = (data.results || []).filter((r: { status: string }) => r.status === 'created').length
      const updated = (data.results || []).filter((r: { status: string }) => r.status === 'updated').length
      setInitResult(`✅ Done — ${created} created, ${updated} updated`)
      setInitState('done')
    } catch (err: unknown) {
      setInitResult(`❌ ${err instanceof Error ? err.message : 'Error'}`)
      setInitState('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a2332] to-slate-900 p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <p className="font-bold text-xl text-white leading-tight">BenefitsFlow</p>
          <p className="text-xs text-slate-400">Demo Environment</p>
        </div>
        <div className="ml-auto">
          <Link href="/login" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            Sign in <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Demo Accounts</h1>
          <p className="text-slate-400 text-sm">
            BenefitsFlow ships with pre-configured demo personas. Click any persona card on the login page to sign in instantly.
          </p>
        </div>

        {/* Shortcut hint */}
        <div className="bg-violet-900/30 border border-violet-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Terminal className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-violet-200 text-sm font-medium mb-1">Username shortcuts</p>
            <p className="text-violet-300/70 text-xs">
              On the login page, type a shortcut in the email field and the system resolves it automatically.
              No password needed for demo shortcuts.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(SHORTCUTS).map(([email, shortcut]) => (
                <span key={shortcut} className="font-mono text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded">
                  {shortcut}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Account cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse h-40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {accounts.map(account => {
              const meta = ROLE_META[account.role] || ROLE_META.EMPLOYEE
              const colors = COLOR_CLASSES[meta.color]
              const Icon = meta.icon
              const shortcut = SHORTCUTS[account.email]

              return (
                <div key={account.email} className={cn('bg-white rounded-xl border p-5', colors.border)}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn('text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full', colors.badge)}>
                      {meta.label}
                    </span>
                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center', colors.icon)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <p className="font-bold text-slate-900 text-sm">{account.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 mb-3 leading-relaxed">{account.scenario}</p>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 shrink-0">Email</span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-slate-700 font-mono truncate">{account.email}</span>
                        <CopyButton text={account.email} label="email" />
                      </div>
                    </div>
                    {shortcut && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400 shrink-0">Shortcut</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-700 font-mono font-semibold">{shortcut}</span>
                          <CopyButton text={shortcut} label="shortcut" />
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/login"
                    className={cn(
                      'mt-4 block text-center text-xs font-semibold py-2 rounded-lg transition-colors',
                      'bg-slate-900 text-white hover:bg-slate-700'
                    )}
                  >
                    Sign in as {account.name.split(' ')[0]}
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        {/* Init section */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white font-semibold text-sm mb-1">Initialize Demo Accounts</p>
              <p className="text-slate-400 text-xs">
                Creates or updates all demo accounts in Supabase Auth and links them to worker records.
                Requires <code className="bg-white/10 px-1 rounded">DEMO_INIT_SECRET</code>.
              </p>
              {initResult && (
                <p className="text-xs mt-2 font-mono text-slate-300">{initResult}</p>
              )}
            </div>
            <button
              onClick={runInit}
              disabled={initState === 'running'}
              className="shrink-0 flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', initState === 'running' && 'animate-spin')} />
              {initState === 'running' ? 'Running…' : 'Run init-demo'}
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <p className="text-white font-semibold text-sm mb-3">How demo auth works</p>
          <div className="space-y-2 text-xs text-slate-400">
            <p>1. Persona card click or shortcut → POST <code className="bg-white/10 px-1 rounded">/api/demo-login</code> with the demo email.</p>
            <p>2. Server signs in with <code className="bg-white/10 px-1 rounded">DEMO_ACCOUNT_PASSWORD</code> via Supabase Auth.</p>
            <p>3. On success: sets a <code className="bg-white/10 px-1 rounded">bf_demo</code> cookie with <code className="bg-white/10 px-1 rounded">worker_id</code>, <code className="bg-white/10 px-1 rounded">role</code>, and 8-hour expiry.</p>
            <p>4. Middleware validates the cookie server-side on every request — never trusts client-side role claims.</p>
            <p>5. All API routes use <code className="bg-white/10 px-1 rounded">getAuthContext()</code> which tries Supabase session first, then falls back to the cookie — so demo users can use all features.</p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          BenefitsFlow HRIS Lab · All data is fictional · Not affiliated with Ensign, Workday, Cigna, or Delta Dental
        </p>
      </div>
    </div>
  )
}
