'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Heart, Shield, Users, CheckCircle2,
  Eye, EyeOff, Stethoscope, Clock,
  TrendingUp, Building2, ChevronRight, Zap
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const USERNAME_SHORTCUTS: Record<string, string> = {
  nsong:    'hris.analyst@benefitsflow.demo',
  maya:     'manager.maya@benefitsflow.demo',
  jordan:   'enrolled@benefitsflow.demo',
  billrush: 'billrush@benefitsflow.demo',
}

const DEMO_PERSONAS = [
  {
    email:      'hris.analyst@benefitsflow.demo',
    shortcut:   'nsong',
    name:       'Nathan Song',
    title:      'HRIS Analyst',
    icon:       Shield,
    color:      'violet',
  },
  {
    email:      'manager.maya@benefitsflow.demo',
    shortcut:   'maya',
    name:       'Maya Johnson',
    title:      'Manager',
    icon:       Users,
    color:      'emerald',
  },
  {
    email:      'enrolled@benefitsflow.demo',
    shortcut:   'jordan',
    name:       'Jordan Rivera',
    title:      'Employee',
    icon:       CheckCircle2,
    color:      'blue',
  },
  {
    email:      'billrush@benefitsflow.demo',
    shortcut:   'billrush',
    name:       'Bill Rush',
    title:      'Employee',
    icon:       CheckCircle2,
    color:      'sky',
  },
]

const CHIP_COLORS: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  violet: { bg: 'bg-violet-50 hover:bg-violet-100',  text: 'text-violet-700', border: 'border-violet-200', ring: 'ring-violet-400' },
  emerald:{ bg: 'bg-emerald-50 hover:bg-emerald-100',text: 'text-emerald-700',border: 'border-emerald-200',ring: 'ring-emerald-400'},
  blue:   { bg: 'bg-blue-50 hover:bg-blue-100',      text: 'text-blue-700',   border: 'border-blue-200',   ring: 'ring-blue-400'  },
  sky:    { bg: 'bg-sky-50 hover:bg-sky-100',        text: 'text-sky-700',    border: 'border-sky-200',    ring: 'ring-sky-400'   },
}

const FEATURE_HIGHLIGHTS = [
  { icon: Stethoscope, label: 'Dental Enrollment',   desc: 'PPO / DHMO with live cost comparison' },
  { icon: Clock,       label: 'Time & Attendance',   desc: 'Clock in/out, daily logs, pay periods' },
  { icon: TrendingUp,  label: 'Enrollment Reports',  desc: 'Rates, accumulators, carrier export' },
  { icon: Building2,   label: 'Worker Directory',    desc: 'Cross-org eligibility and plan status' },
]

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms)),
  ])
}

export default function LoginPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)

  async function loginAs(emailAddr: string) {
    setLoading(emailAddr)
    setError(null)
    try {
      const res = await withTimeout(fetch('/api/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddr }),
      }), 7000)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Demo login failed')
      window.location.href = '/dashboard'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setError(msg === 'TIMEOUT' ? 'Request timed out — check your Supabase connection.' : msg)
      setLoading(null)
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading('form')
    setError(null)
    const resolved = USERNAME_SHORTCUTS[email.trim().toLowerCase()] ?? email.trim()
    const isShortcut = resolved !== email.trim()
    try {
      if (isShortcut) {
        const res = await withTimeout(fetch('/api/demo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: resolved }),
        }), 7000)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Login failed')
        window.location.href = '/dashboard'
        return
      }
      const { error: signInErr } = await withTimeout(
        supabase.auth.signInWithPassword({ email: resolved, password }),
        5000
      )
      if (signInErr) throw signInErr
      window.location.href = '/dashboard'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5fa] flex">

      {/* ── LEFT PANEL — branding ── */}
      <div className="hidden lg:flex lg:w-[380px] xl:w-[440px] shrink-0 bg-white border-r border-slate-200 flex-col">

        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shadow-sm">
            <Heart className="w-[18px] h-[18px] text-white fill-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-tight">BenefitsFlow</p>
            <p className="text-[11px] text-slate-400">Enterprise HRIS · Demo Environment</p>
          </div>
        </div>

        <div className="px-8 pt-8 pb-6">
          <h2 className="text-xl font-bold text-slate-900 leading-snug mb-2">
            HR infrastructure<br />built to impress.
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Real authentication, real Supabase writes, and a full enrollment workflow — built to showcase Workday-level HRIS expertise.
          </p>
        </div>

        {/* Stats */}
        <div className="mx-8 mb-7 grid grid-cols-3 gap-2">
          {[
            { label: 'Workers', value: '14+' },
            { label: 'Modules', value: '9' },
            { label: 'Tables',  value: '18' },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
              <p className="text-lg font-bold text-violet-600">{s.value}</p>
              <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Feature list */}
        <div className="px-8 flex-1">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Platform Modules</p>
          <div className="space-y-3">
            {FEATURE_HIGHLIGHTS.map(f => {
              const Icon = f.icon
              return (
                <div key={f.label} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{f.label}</p>
                    <p className="text-[11px] text-slate-400">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-8 py-5 border-t border-slate-100">
          <p className="text-[10px] text-slate-400">All data is fictional · Not affiliated with Ensign, Workday, Cigna, or Delta Dental</p>
        </div>
      </div>

      {/* ── RIGHT PANEL — sign-in ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <p className="font-bold text-slate-900">BenefitsFlow</p>
        </div>

        <div className="w-full max-w-sm">

          {/* ── SIGN-IN FORM — PRIMARY FOCUS ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 mb-5">
            <h1 className="text-xl font-bold text-slate-900 mb-1">Sign in</h1>
            <p className="text-sm text-slate-500 mb-5">
              Enter your credentials or use a demo shortcut below.
            </p>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-red-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  Email or username
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Demo shortcuts: <span className="font-mono">nsong · maya · jordan · billrush</span>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600">Password</label>
                  <Link href="/forgot-password" className="text-[11px] text-violet-500 hover:text-violet-700 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!!loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading === 'form' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>Sign in <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                No account?{' '}
                <Link href="/register" className="text-violet-600 hover:text-violet-700 font-medium transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </div>

          {/* ── DEMO QUICK ACCESS — SECONDARY ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-xs font-semibold text-slate-700">Quick demo access</p>
              <span className="ml-auto text-[10px] text-slate-400">One click · No password</span>
            </div>

            <div className="space-y-2">
              {DEMO_PERSONAS.map(persona => {
                const colors = CHIP_COLORS[persona.color]
                const Icon = persona.icon
                const isLoading = loading === persona.email

                return (
                  <button
                    key={persona.email}
                    onClick={() => loginAs(persona.email)}
                    disabled={!!loading}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left',
                      colors.bg, colors.border,
                      isLoading && `ring-2 ${colors.ring}`,
                      loading && loading !== persona.email && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0', colors.bg)}>
                      {isLoading
                        ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        : <Icon className={cn('w-3.5 h-3.5', colors.text)} />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-semibold', colors.text)}>{persona.name}</p>
                      <p className="text-[10px] text-slate-400">{persona.title}</p>
                    </div>

                    <code className={cn('text-[10px] font-mono font-bold shrink-0', colors.text)}>
                      {persona.shortcut}
                    </code>

                    <ChevronRight className={cn('w-3.5 h-3.5 shrink-0', colors.text, 'opacity-50')} />
                  </button>
                )
              })}
            </div>

            <p className="text-[10px] text-slate-400 text-center mt-3">
              <Link href="/demo-accounts" className="hover:text-violet-500 transition-colors">
                View all demo accounts →
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
