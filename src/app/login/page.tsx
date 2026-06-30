'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Heart, Shield, Users, Stethoscope, Clock, CheckCircle2, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEMO_PERSONAS = [
  {
    email: 'hris.analyst@benefitsflow.demo',
    name: 'Nathan Song',
    role: 'HRIS Analyst',
    roleKey: 'HRIS_ANALYST',
    employeeId: 'ESI-10000',
    scenario: 'Full system access · View As any role · Configure & audit',
    icon: Shield,
    color: 'violet',
    badge: 'Admin',
  },
  {
    email: 'manager.maya@benefitsflow.demo',
    name: 'Maya Johnson',
    role: 'Manager',
    roleKey: 'MANAGER',
    employeeId: 'ESI-10009',
    scenario: '5 direct reports · Approvals · Onboarding oversight',
    icon: Users,
    color: 'emerald',
    badge: 'Manager',
  },
  {
    email: 'enrolled@benefitsflow.demo',
    name: 'Jordan Rivera',
    role: 'Employee',
    roleKey: 'EMPLOYEE',
    employeeId: 'ESI-10001',
    scenario: 'Active Cigna PPO · Annual max reached · 2 yr 5 mo tenure',
    icon: CheckCircle2,
    color: 'blue',
    badge: 'Enrolled',
  },
  {
    email: 'newhire.waiting@benefitsflow.demo',
    name: 'Elena Vasquez',
    role: 'Employee',
    roleKey: 'EMPLOYEE',
    employeeId: 'ESI-10004',
    scenario: 'Day 30 of 90-day wait · Preview available · Locked',
    icon: Clock,
    color: 'amber',
    badge: 'Waiting',
  },
  {
    email: 'newhire.eligible@benefitsflow.demo',
    name: 'Marcus Williams',
    role: 'Employee',
    roleKey: 'EMPLOYEE',
    employeeId: 'ESI-10005',
    scenario: 'Day 91 · Enrollment window open · No elections yet',
    icon: Stethoscope,
    color: 'sky',
    badge: 'Eligible Now',
  },
  {
    email: 'benefits.partner@benefitsflow.demo',
    name: 'Taylor Chen',
    role: 'Benefits Partner',
    roleKey: 'BENEFITS_PARTNER',
    employeeId: 'ESI-10002',
    scenario: 'Eligibility exceptions · Life events · Carrier reconciliation',
    icon: Heart,
    color: 'rose',
    badge: 'Benefits Ops',
  },
]

const COLOR_MAP: Record<string, { card: string; badge: string; icon: string; ring: string }> = {
  violet: {
    card: 'border-violet-200 hover:border-violet-400 hover:bg-violet-50/50',
    badge: 'bg-violet-100 text-violet-700',
    icon: 'bg-violet-100 text-violet-600',
    ring: 'ring-violet-400',
  },
  emerald: {
    card: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50',
    badge: 'bg-emerald-100 text-emerald-700',
    icon: 'bg-emerald-100 text-emerald-600',
    ring: 'ring-emerald-400',
  },
  blue: {
    card: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/50',
    badge: 'bg-blue-100 text-blue-700',
    icon: 'bg-blue-100 text-blue-600',
    ring: 'ring-blue-400',
  },
  amber: {
    card: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50/50',
    badge: 'bg-amber-100 text-amber-700',
    icon: 'bg-amber-100 text-amber-600',
    ring: 'ring-amber-400',
  },
  sky: {
    card: 'border-sky-200 hover:border-sky-400 hover:bg-sky-50/50',
    badge: 'bg-sky-100 text-sky-700',
    icon: 'bg-sky-100 text-sky-600',
    ring: 'ring-sky-400',
  },
  rose: {
    card: 'border-rose-200 hover:border-rose-400 hover:bg-rose-50/50',
    badge: 'bg-rose-100 text-rose-700',
    icon: 'bg-rose-100 text-rose-600',
    ring: 'ring-rose-400',
  },
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null) // email of loading persona
  const [error, setError] = useState<string | null>(null)
  const [showManual, setShowManual] = useState(false)
  const [manualEmail, setManualEmail] = useState('')
  const [manualPassword, setManualPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function loginAs(email: string) {
    setLoading(email)
    setError(null)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: 'BenefitsFlow2026!',
      })
      if (signInError) throw signInError
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      if (message.includes('Invalid login') || message.includes('Email not confirmed')) {
        setError('Demo accounts not initialized yet. Ask your HRIS admin to run /api/init-demo.')
      } else {
        setError(message)
      }
      setLoading(null)
    }
  }

  async function manualLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading('manual')
    setError(null)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: manualEmail,
        password: manualPassword,
      })
      if (signInError) throw signInError
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a2332] to-slate-900 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <p className="font-bold text-xl text-white leading-tight">BenefitsFlow</p>
          <p className="text-xs text-slate-400">Enterprise HRIS · Demo Environment</p>
        </div>
      </div>

      <div className="w-full max-w-4xl">
        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-white">Select a demo persona</h1>
          <p className="text-slate-400 text-sm mt-1">
            Each account is authenticated through Supabase Auth with role-scoped data access
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-900/40 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {/* Persona cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
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
                  'relative text-left bg-white rounded-xl border-2 p-4 transition-all duration-150 group',
                  colors.card,
                  isLoading && `ring-2 ${colors.ring}`,
                  loading && loading !== persona.email && 'opacity-50'
                )}
              >
                {/* Role badge */}
                <span className={cn('text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full', colors.badge)}>
                  {persona.badge}
                </span>

                <div className="flex items-start gap-3 mt-3">
                  <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', colors.icon)}>
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm leading-tight">{persona.name}</p>
                    <p className="text-xs text-slate-500">{persona.role} · {persona.employeeId}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{persona.scenario}</p>

                <div className="flex items-center gap-1 mt-3 text-xs font-medium text-slate-400 group-hover:text-slate-700 transition-colors">
                  {isLoading ? 'Authenticating...' : 'Log in as this persona'}
                  {!isLoading && <ChevronRight className="w-3 h-3" />}
                </div>
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <button
            onClick={() => setShowManual(!showManual)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showManual ? 'Hide manual login' : 'Sign in with email & password'}
          </button>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Manual login */}
        {showManual && (
          <form onSubmit={manualLogin} className="bg-white/5 border border-white/10 rounded-xl p-5 max-w-sm mx-auto space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Email</label>
              <input
                type="email"
                value={manualEmail}
                onChange={e => setManualEmail(e.target.value)}
                placeholder="email@benefitsflow.demo"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={manualPassword}
                  onChange={e => setManualPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 pr-10 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!!loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg py-2 transition-colors disabled:opacity-50"
            >
              {loading === 'manual' ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}

        {/* Disclaimer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          BenefitsFlow HRIS Lab · All data is fictional · Not affiliated with Ensign, Workday, Cigna, or Delta Dental
        </p>
      </div>
    </div>
  )
}
