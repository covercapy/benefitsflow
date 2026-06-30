'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Heart, Shield, Users, CheckCircle2, ChevronRight,
  Eye, EyeOff, Stethoscope, Clock, FileText,
  TrendingUp, Building2, Terminal
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
    role:       'HRIS Analyst',
    employeeId: 'ESI-10000',
    scenario:   'Full system access · View As any role · Create employees',
    icon:       Shield,
    color:      'violet',
    badge:      'HRIS Admin',
  },
  {
    email:      'manager.maya@benefitsflow.demo',
    shortcut:   'maya',
    name:       'Maya Johnson',
    role:       'Manager',
    employeeId: 'ESI-10009',
    scenario:   '5 direct reports · Approvals · Team attendance',
    icon:       Users,
    color:      'emerald',
    badge:      'Manager',
  },
  {
    email:      'enrolled@benefitsflow.demo',
    shortcut:   'jordan',
    name:       'Jordan Rivera',
    role:       'Employee',
    employeeId: 'ESI-10001',
    scenario:   'Active Cigna PPO · Clock in/out · Benefits self-service',
    icon:       CheckCircle2,
    color:      'blue',
    badge:      'Employee',
  },
  {
    email:      'billrush@benefitsflow.demo',
    shortcut:   'billrush',
    name:       'Bill Rush',
    role:       'Employee',
    employeeId: 'ESI-10010',
    scenario:   'Created via HR Admin panel · New hire onboarding',
    icon:       CheckCircle2,
    color:      'sky',
    badge:      'Employee',
  },
]

const COLOR_MAP: Record<string, { card: string; badge: string; icon: string; shortcut: string; ring: string }> = {
  violet: { card: 'hover:border-violet-300 hover:bg-violet-50/40', badge: 'bg-violet-100 text-violet-700', icon: 'bg-violet-100 text-violet-600', shortcut: 'bg-violet-50 text-violet-600 border-violet-200', ring: 'ring-violet-400' },
  emerald: { card: 'hover:border-emerald-300 hover:bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-700', icon: 'bg-emerald-100 text-emerald-600', shortcut: 'bg-emerald-50 text-emerald-600 border-emerald-200', ring: 'ring-emerald-400' },
  blue: { card: 'hover:border-blue-300 hover:bg-blue-50/40', badge: 'bg-blue-100 text-blue-700', icon: 'bg-blue-100 text-blue-600', shortcut: 'bg-blue-50 text-blue-600 border-blue-200', ring: 'ring-blue-400' },
  sky: { card: 'hover:border-sky-300 hover:bg-sky-50/40', badge: 'bg-sky-100 text-sky-700', icon: 'bg-sky-100 text-sky-600', shortcut: 'bg-sky-50 text-sky-600 border-sky-200', ring: 'ring-sky-400' },
}

const FEATURE_HIGHLIGHTS = [
  { icon: Stethoscope, label: 'Dental Enrollment',   desc: 'PPO / DHMO with live cost comparison and provider search' },
  { icon: Clock,       label: 'Time & Attendance',   desc: 'Clock in/out, daily logs, bi-monthly pay periods' },
  { icon: TrendingUp,  label: 'Enrollment Reports',  desc: 'Completion rates, accumulators, carrier export audit' },
  { icon: FileText,    label: 'Inbox & QLE Events',  desc: 'Life event approvals and document verification' },
  { icon: Building2,   label: 'Worker Directory',    desc: 'Cross-org eligibility, hiring categories, and plan status' },
  { icon: Shield,      label: 'Audit Log',           desc: 'Immutable change history — every action, every user' },
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
  const [error, setError] = useState<string | null>(null)
  const [showManual, setShowManual] = useState(false)
  const [manualEmail, setManualEmail] = useState('')
  const [manualPassword, setManualPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function loginAs(email: string) {
    setLoading(email)
    setError(null)
    try {
      const res = await withTimeout(fetch('/api/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }), 7000)
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Demo login failed')
      window.location.href = '/dashboard'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setError(msg === 'TIMEOUT' ? 'Request timed out — check your Supabase connection.' : msg)
      setLoading(null)
    }
  }

  async function manualLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading('manual')
    setError(null)
    const resolved = USERNAME_SHORTCUTS[manualEmail.trim().toLowerCase()] || manualEmail.trim()
    const isShortcut = resolved !== manualEmail.trim()
    try {
      if (isShortcut) {
        const res = await withTimeout(fetch('/api/demo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: resolved }),
        }), 7000)
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || 'Login failed')
        window.location.href = '/dashboard'
        return
      }
      const { error: signInError } = await withTimeout(
        supabase.auth.signInWithPassword({ email: resolved, password: manualPassword }), 5000
      )
      if (signInError) throw signInError
      window.location.href = '/dashboard'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5fa] flex">

      {/* ── LEFT PANEL — branding + feature list ── */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] shrink-0 bg-white border-r border-slate-200 flex-col">

        {/* Logo header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shadow-sm">
            <Heart className="w-4.5 h-4.5 text-white fill-white" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-tight">BenefitsFlow</p>
            <p className="text-[11px] text-slate-400">Enterprise HRIS · Demo Environment</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="px-8 pt-8 pb-6">
          <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-2">
            HR Infrastructure,<br />Built for Demonstration
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            A fully functional HRIS built with Next.js 14, Supabase, and TypeScript.
            Three role personas, real database writes, and live enrollment workflows.
          </p>
        </div>

        {/* Stat strip */}
        <div className="mx-8 mb-6 grid grid-cols-3 gap-2">
          {[
            { label: 'Workers', value: '14+' },
            { label: 'Modules', value: '9' },
            { label: 'Tables', value: '18' },
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
          <div className="space-y-2">
            {FEATURE_HIGHLIGHTS.map(f => {
              const Icon = f.icon
              return (
                <div key={f.label} className="flex items-start gap-3 py-2">
                  <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{f.label}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100">
          <p className="text-[10px] text-slate-400">
            BenefitsFlow HRIS Lab · All data is fictional · Not affiliated with Ensign, Workday, Cigna, or Delta Dental
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — sign-in form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-6">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <p className="font-bold text-slate-900">BenefitsFlow</p>
        </div>

        <div className="w-full max-w-lg">

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
            <p className="text-sm text-slate-500 mt-1">Choose a demo persona or sign in with your credentials.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Persona cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {DEMO_PERSONAS.map(persona => {
              const colors = COLOR_MAP[persona.color]
              const Icon = persona.icon
              const isLoading = loading === persona.email

              return (
                <button
                  key={persona.email}
                  onClick={() => loginAs(persona.email)}
                  disabled={!!loading}
                  className={cn(
                    'relative text-left bg-white rounded-xl border-2 border-slate-200 p-4 transition-all duration-150 group shadow-sm',
                    colors.card,
                    isLoading && `ring-2 ${colors.ring}`,
                    loading && loading !== persona.email && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {/* Role badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn('text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full', colors.badge)}>
                      {persona.badge}
                    </span>
                    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0', colors.icon)}>
                      {isLoading
                        ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        : <Icon className="w-3 h-3" />
                      }
                    </div>
                  </div>

                  <p className="font-semibold text-slate-900 text-sm leading-tight">{persona.name}</p>
                  <p className="text-[11px] text-slate-400 mb-2.5">{persona.role} · {persona.employeeId}</p>

                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{persona.scenario}</p>

                  {/* Shortcut pill */}
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-slate-400 shrink-0" />
                    <code className={cn('text-[10px] font-mono font-semibold px-2 py-0.5 rounded border', colors.shortcut)}>
                      {persona.shortcut}
                    </code>
                    <span className="text-[10px] text-slate-400">shortcut</span>
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-400 group-hover:text-slate-700 transition-colors">
                    {isLoading ? 'Signing in…' : 'Click to sign in'}
                    {!isLoading && <ChevronRight className="w-3 h-3" />}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div className="relative flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-200" />
            <button
              onClick={() => setShowManual(!showManual)}
              className="text-xs text-slate-400 hover:text-slate-700 transition-colors whitespace-nowrap px-1"
            >
              {showManual ? '− Hide' : '+ Sign in with email & password'}
            </button>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Manual login form */}
          {showManual && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5 shadow-sm space-y-3">
              <form onSubmit={manualLogin} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Email or shortcut</label>
                  <input
                    type="text"
                    value={manualEmail}
                    onChange={e => setManualEmail(e.target.value)}
                    placeholder="email@company.com or nsong / maya / jordan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Shortcuts: nsong · maya · jordan · billrush</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={manualPassword}
                      onChange={e => setManualPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-10 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!!loading}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading === 'manual' ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
              <p className="text-center text-xs text-slate-400">
                <Link href="/forgot-password" className="hover:text-violet-600 transition-colors">Forgot password?</Link>
              </p>
            </div>
          )}

          {/* Bottom links */}
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            <Link href="/register" className="hover:text-violet-600 transition-colors font-medium">Create account</Link>
            <span>·</span>
            <Link href="/demo-accounts" className="hover:text-violet-600 transition-colors">Demo accounts</Link>
            <span>·</span>
            <Link href="/forgot-password" className="hover:text-violet-600 transition-colors">Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
