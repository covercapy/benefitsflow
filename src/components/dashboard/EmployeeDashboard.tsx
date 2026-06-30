'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar, Heart, Clock, Shield,
  ChevronRight, AlertTriangle, CheckCircle2,
  Stethoscope, Lock, Zap, TrendingUp, Bell, Info
} from 'lucide-react'

type EnrollmentState = 'WAITING' | 'ELIGIBLE' | 'ENROLLED'

interface PersonaConfig {
  name: string
  title: string
  org: string
  hireDate: string
  waitingDays: number
  state: EnrollmentState
  planName?: string
  planType?: string
  coverageTier?: string
  monthlyPremium?: number
  carrier?: string
  annualUsed?: number
  annualLimit?: number
  dependents?: { name: string; rel: string }[]
  enrollmentWindowEnd?: string
  openEnrollStart: string
  openEnrollEnd: string
}

const PERSONAS: Record<string, PersonaConfig> = {
  'ESI-10004': {
    name: 'Elena Vasquez', title: 'Registered Nurse', org: 'Sunrise Post-Acute Care',
    hireDate: '2026-06-01', waitingDays: 90, state: 'WAITING',
    openEnrollStart: '2026-11-01', openEnrollEnd: '2026-11-30',
  },
  'ESI-10005': {
    name: 'Marcus Williams', title: 'Registered Nurse', org: 'Sunrise Post-Acute Care',
    hireDate: '2026-03-31', waitingDays: 90, state: 'ELIGIBLE',
    enrollmentWindowEnd: '2026-07-29',
    openEnrollStart: '2026-11-01', openEnrollEnd: '2026-11-30',
  },
  'ESI-10001': {
    name: 'Jordan Rivera', title: 'HR Solutions Analyst', org: 'Ensign Services, Inc.',
    hireDate: '2024-01-15', waitingDays: 90, state: 'ENROLLED',
    planName: 'Cigna Dental PPO Enhanced', planType: 'PPO',
    coverageTier: 'EF', monthlyPremium: 189, carrier: 'Cigna',
    annualUsed: 1500, annualLimit: 1500,
    dependents: [
      { name: 'Sarah Rivera', rel: 'Spouse' },
      { name: 'Lily Rivera', rel: 'Child' },
      { name: 'Noah Rivera', rel: 'Child' },
    ],
    openEnrollStart: '2026-11-01', openEnrollEnd: '2026-11-30',
  },
  'DEFAULT': {
    name: 'Team Member', title: 'Employee', org: 'Ensign Services, Inc.',
    hireDate: '2025-06-01', waitingDays: 0, state: 'ENROLLED',
    planName: 'Cigna Dental PPO', planType: 'PPO',
    coverageTier: 'EO', monthlyPremium: 8.50, carrier: 'Cigna',
    annualUsed: 200, annualLimit: 1500,
    openEnrollStart: '2026-11-01', openEnrollEnd: '2026-11-30',
  },
}

function daysBetween(from: string) {
  return Math.floor((Date.now() - new Date(from).getTime()) / 86_400_000)
}
function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000)
}
function tenure(hireDate: string) {
  const d = daysBetween(hireDate)
  const yr = Math.floor(d / 365); const mo = Math.floor((d % 365) / 30)
  if (yr === 0 && mo === 0) return `${d} days`
  if (yr === 0) return `${mo} mo`
  return `${yr} yr ${mo} mo`
}
function tierLabel(t?: string) {
  const m: Record<string, string> = { EO: 'Employee Only', ES: 'Employee + Spouse', EC: 'Employee + Child(ren)', EF: 'Employee + Family' }
  return t ? (m[t] || t) : '—'
}

// ─── Waiting Period Banner ───────────────────────────────────────────────────
function WaitingBanner({ persona }: { persona: PersonaConfig }) {
  const daysIn = daysBetween(persona.hireDate)
  const daysLeft = Math.max(0, persona.waitingDays - daysIn)
  const pct = Math.min(100, Math.round((daysIn / persona.waitingDays) * 100))
  const eligibleDate = new Date(persona.hireDate)
  eligibleDate.setDate(eligibleDate.getDate() + persona.waitingDays)

  return (
    <div className="bg-white rounded-2xl border border-amber-200 p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
          <Lock className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 text-lg">Enrollment opens in {daysLeft} days</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            90-day waiting period in progress · Eligible on{' '}
            {eligibleDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Day {daysIn} of {persona.waitingDays}</span>
              <span>{pct}% complete</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-amber-700">{daysIn}</p>
              <p className="text-xs text-amber-600 mt-0.5">Days completed</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-slate-700">{daysLeft}</p>
              <p className="text-xs text-slate-500 mt-0.5">Days remaining</p>
            </div>
          </div>
          <Link href="/enroll/dental" className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
            Preview available plans <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Newly Eligible Banner ───────────────────────────────────────────────────
function EligibleBanner({ persona }: { persona: PersonaConfig }) {
  const windowLeft = persona.enrollmentWindowEnd ? daysUntil(persona.enrollmentWindowEnd) : 30
  const urgent = windowLeft <= 7

  return (
    <div className={cn('rounded-2xl border-2 p-6', urgent ? 'bg-red-50 border-red-300' : 'bg-emerald-50 border-emerald-300')}>
      <div className="flex items-start gap-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', urgent ? 'bg-red-100' : 'bg-emerald-100')}>
          <Zap className={cn('w-6 h-6', urgent ? 'text-red-600' : 'text-emerald-600')} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={cn('font-bold text-lg', urgent ? 'text-red-900' : 'text-emerald-900')}>
              🎉 You&apos;re now eligible to enroll!
            </h3>
            <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', urgent ? 'bg-red-200 text-red-800' : 'bg-emerald-200 text-emerald-800')}>
              {windowLeft} days left
            </span>
          </div>
          <p className={cn('text-sm mt-1', urgent ? 'text-red-700' : 'text-emerald-700')}>
            Your 90-day waiting period is complete. Window closes{' '}
            {persona.enrollmentWindowEnd
              ? new Date(persona.enrollmentWindowEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
              : 'soon'}.
            Miss this window and you wait until Open Enrollment in November.
          </p>
          <div className="mt-4 flex gap-3 flex-wrap">
            <Link href="/enroll/dental"
              className={cn('inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white',
                urgent ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700')}>
              <Stethoscope className="w-4 h-4" /> Start Dental Enrollment
            </Link>
            <Link href="/enroll" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50">
              View all benefits
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Active Enrolled Banner ──────────────────────────────────────────────────
function EnrolledBanner({ persona }: { persona: PersonaConfig }) {
  const atMax = !!(persona.annualUsed !== undefined && persona.annualLimit && persona.annualUsed >= persona.annualLimit)
  const pct = persona.annualUsed && persona.annualLimit ? Math.min(100, Math.round((persona.annualUsed / persona.annualLimit) * 100)) : 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-slate-900">Active Coverage — Plan Year 2026</h3>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{persona.planName} · {tierLabel(persona.coverageTier)}</p>
        </div>
        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full shrink-0">Active</span>
      </div>

      {atMax && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1"><strong>Annual maximum reached (${persona.annualLimit?.toLocaleString()}).</strong> Remaining costs are 100% your responsibility until Jan 1.</span>
          <Link href="/enroll/estimator" className="shrink-0 font-semibold underline">Estimator →</Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div><p className="text-xs text-slate-500">Carrier</p><p className="font-semibold text-slate-900">{persona.carrier}</p></div>
        <div><p className="text-xs text-slate-500">Coverage</p><p className="font-semibold text-slate-900">{tierLabel(persona.coverageTier)}</p></div>
        <div><p className="text-xs text-slate-500">Your cost</p><p className="font-semibold text-slate-900">${persona.monthlyPremium}/mo</p></div>
      </div>

      {persona.annualUsed !== undefined && persona.annualLimit !== undefined && (
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Annual benefit used</span>
            <span className={cn('font-medium', atMax ? 'text-red-600' : 'text-slate-700')}>
              ${persona.annualUsed.toLocaleString()} / ${persona.annualLimit.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full', atMax ? 'bg-red-500' : 'bg-emerald-500')} style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {persona.dependents && persona.dependents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500 mb-2">Covered dependents</p>
          <div className="flex gap-2 flex-wrap">
            {persona.dependents.map(d => (
              <span key={d.name} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">{d.name} · {d.rel}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function EmployeeDashboard() {
  const supabase = createClient()
  const [persona, setPersona] = useState<PersonaConfig | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const wid = session?.user?.user_metadata?.worker_id || 'ESI-10001'
      setPersona(PERSONAS[wid] || PERSONAS['DEFAULT'])
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!persona) {
    return <div className="space-y-4 animate-pulse">{[1,2,3].map(i=><div key={i} className="h-28 bg-slate-100 rounded-2xl"/>)}</div>
  }

  const tenureStr = tenure(persona.hireDate)
  const oeIn = daysUntil(persona.openEnrollStart)

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Welcome header */}
      <div className="bg-[#1a2332] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
        <div className="relative">
          <p className="text-slate-400 text-sm">Welcome back,</p>
          <h2 className="text-2xl font-bold mt-0.5">{persona.name}</h2>
          <p className="text-slate-400 text-sm mt-1">{persona.title} · {persona.org}</p>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Hired {new Date(persona.hireDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{tenureStr}</span>
            {persona.state === 'ENROLLED' && persona.carrier && (
              <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-red-400" />{persona.carrier} · {persona.planType}</span>
            )}
            {persona.state === 'ENROLLED' && (
              <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" />Coverage Active</span>
            )}
          </div>
        </div>
      </div>

      {/* Primary state card */}
      {persona.state === 'WAITING'  && <WaitingBanner  persona={persona} />}
      {persona.state === 'ELIGIBLE' && <EligibleBanner persona={persona} />}
      {persona.state === 'ENROLLED' && <EnrolledBanner persona={persona} />}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-slate-900">{tenureStr}</p>
          <p className="text-xs text-slate-500 mt-0.5">Tenure</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className={cn('text-xl font-bold',
            persona.state === 'ENROLLED' ? 'text-emerald-600' :
            persona.state === 'ELIGIBLE' ? 'text-blue-600' : 'text-amber-600')}>
            {persona.state === 'WAITING' ? 'Waiting' : persona.state === 'ELIGIBLE' ? 'Eligible' : 'Active'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Benefits status</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-slate-900">{oeIn > 0 ? `${oeIn}d` : 'Open'}</p>
          <p className="text-xs text-slate-500 mt-0.5">Next open enrollment</p>
          <p className="text-[10px] text-slate-400">Nov 1–30, 2026</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-slate-900">
            {persona.monthlyPremium ? `$${persona.monthlyPremium}/mo` : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Deduction</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {persona.state !== 'WAITING' && (
          <Link href="/enroll/dental" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all group">
            <Stethoscope className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
              {persona.state === 'ELIGIBLE' ? 'Enroll Now' : 'Dental Plan'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{persona.state === 'ELIGIBLE' ? '30-day window open' : 'View / change'}</p>
          </Link>
        )}
        <Link href="/enroll/estimator" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-violet-300 hover:shadow-sm transition-all group">
          <TrendingUp className="w-5 h-5 text-violet-600 mb-2" />
          <p className="text-sm font-semibold text-slate-900 group-hover:text-violet-600">Cost Estimator</p>
          <p className="text-xs text-slate-500 mt-0.5">Dental procedures</p>
        </Link>
        <Link href="/inbox" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-amber-300 hover:shadow-sm transition-all group">
          <Bell className="w-5 h-5 text-amber-600 mb-2" />
          <p className="text-sm font-semibold text-slate-900 group-hover:text-amber-600">Inbox</p>
          <p className="text-xs text-slate-500 mt-0.5">Tasks &amp; alerts</p>
        </Link>
        <Link href="/enroll" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-sm transition-all group">
          <Shield className="w-5 h-5 text-emerald-600 mb-2" />
          <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600">All Benefits</p>
          <p className="text-xs text-slate-500 mt-0.5">Medical, vision, FSA</p>
        </Link>
      </div>

      {persona.state === 'WAITING' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Plan Preview available.</strong> You can compare plans and estimate costs now.
            Once eligible you&apos;ll have 30 days to enroll. &nbsp;
            <Link href="/enroll/dental" className="underline font-medium">Preview plans →</Link>
          </p>
        </div>
      )}
    </div>
  )
}
