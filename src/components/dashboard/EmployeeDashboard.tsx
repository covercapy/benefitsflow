'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  DollarSign, Heart, Calendar, Inbox,
  Star, User, TrendingUp, FileText,
  AlertTriangle, CheckCircle2, ChevronRight,
  Stethoscope, Lock, Zap, Clock, Shield
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Persona data ─────────────────────────────────────────────────────────────
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
  'ESI-10000': {
    name: 'Nathan Song', title: 'HRIS Analyst', org: 'Ensign Services, Inc.',
    hireDate: '2022-03-14', waitingDays: 90, state: 'ENROLLED',
    planName: 'Cigna Dental PPO Enhanced', planType: 'PPO',
    coverageTier: 'ES', monthlyPremium: 94, carrier: 'Cigna',
    annualUsed: 320, annualLimit: 1500,
    dependents: [{ name: 'Amy Song', rel: 'Spouse' }],
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysBetween(from: string) {
  return Math.floor((Date.now() - new Date(from).getTime()) / 86_400_000)
}
function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000)
}
function tenure(hireDate: string) {
  const d = daysBetween(hireDate)
  const yr = Math.floor(d / 365)
  const mo = Math.floor((d % 365) / 30)
  if (yr === 0 && mo === 0) return `${d} days`
  if (yr === 0) return `${mo} mo`
  return `${yr} yr ${mo} mo`
}
function tierLabel(t?: string) {
  const m: Record<string, string> = {
    EO: 'Employee Only',
    ES: 'Employee + Spouse',
    EC: 'Employee + Child(ren)',
    EF: 'Employee + Family',
  }
  return t ? (m[t] || t) : '—'
}

// ─── Worklet tile ─────────────────────────────────────────────────────────────
interface WorkletProps {
  href: string
  icon: React.ElementType
  label: string
  iconBg: string
  iconColor: string
  badge?: number
  disabled?: boolean
}
function Worklet({ href, icon: Icon, label, iconBg, iconColor, badge, disabled }: WorkletProps) {
  const inner = (
    <div className={cn(
      'flex flex-col items-center gap-2 py-5 px-3 rounded-xl border transition-all text-center',
      disabled
        ? 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-50'
        : 'bg-white border-slate-200 hover:border-[#0875e1] hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
    )}>
      <div className="relative">
        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
        {badge != null && badge > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#e04646] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className="text-xs font-semibold text-slate-700 leading-tight">{label}</span>
    </div>
  )
  if (disabled) return inner
  return <Link href={href}>{inner}</Link>
}

// ─── Awaiting Action strip ────────────────────────────────────────────────────
function AwaitingAction({ items }: { items: { text: string; href: string; urgent?: boolean }[] }) {
  if (items.length === 0) return null
  return (
    <div className="bg-[#fff8e1] border border-[#f5c518] rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-[#c47c00] shrink-0" />
        <p className="text-sm font-bold text-[#7a4d00]">Awaiting Your Action ({items.length})</p>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i}>
            <Link href={item.href}
              className="flex items-center gap-2 text-sm text-[#a36100] hover:text-[#7a4d00] group">
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <span className={cn('flex-1', item.urgent && 'font-semibold')}>{item.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Benefits rows (Workday-style) ────────────────────────────────────────────
function BenefitRow({ persona }: { persona: PersonaConfig }) {
  const atMax = !!(persona.annualUsed !== undefined
    && persona.annualLimit
    && persona.annualUsed >= persona.annualLimit)
  const pct = persona.annualUsed && persona.annualLimit
    ? Math.min(100, Math.round((persona.annualUsed / persona.annualLimit) * 100))
    : 0

  return (
    <div className="divide-y divide-slate-100">
      {/* Dental row */}
      <div className="flex items-center gap-4 py-4 px-5 hover:bg-slate-50 transition-colors group">
        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
          <Stethoscope className="w-4 h-4 text-[#0875e1]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-900">{persona.planName}</p>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-wide">
              Active
            </span>
            {atMax && (
              <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase tracking-wide">
                Max Reached
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {persona.carrier} · {tierLabel(persona.coverageTier)} · Dental
          </p>
          {/* Annual benefit bar */}
          {persona.annualUsed !== undefined && persona.annualLimit !== undefined && (
            <div className="mt-1.5">
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Annual benefit used</span>
                <span className={cn('font-medium', atMax ? 'text-red-600' : 'text-slate-600')}>
                  ${persona.annualUsed.toLocaleString()} / ${persona.annualLimit.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-48">
                <div
                  className={cn('h-full rounded-full', atMax ? 'bg-red-500' : 'bg-[#0875e1]')}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
          {/* Dependents */}
          {persona.dependents && persona.dependents.length > 0 && (
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {persona.dependents.map(d => (
                <span key={d.name}
                  className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                  {d.name} · {d.rel}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-slate-900">${persona.monthlyPremium}/mo</p>
          <p className="text-[10px] text-slate-400">your cost</p>
        </div>
        <Link href="/enroll/dental"
          className="shrink-0 text-xs font-semibold text-[#0875e1] hover:underline flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          Manage <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Medical row — placeholder */}
      <div className="flex items-center gap-4 py-4 px-5 opacity-50">
        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-500">Medical</p>
          <p className="text-xs text-slate-400">Not enrolled · Open enrollment Nov 1–30</p>
        </div>
        <Link href="/enroll"
          className="shrink-0 text-xs font-semibold text-[#0875e1] hover:underline">
          View
        </Link>
      </div>

      {/* Vision row — placeholder */}
      <div className="flex items-center gap-4 py-4 px-5 opacity-50">
        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
          <Star className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-500">Vision</p>
          <p className="text-xs text-slate-400">Not enrolled · Open enrollment Nov 1–30</p>
        </div>
        <Link href="/enroll"
          className="shrink-0 text-xs font-semibold text-[#0875e1] hover:underline">
          View
        </Link>
      </div>
    </div>
  )
}

// ─── Waiting / Eligible state cards ───────────────────────────────────────────
function WaitingCard({ persona }: { persona: PersonaConfig }) {
  const daysIn = daysBetween(persona.hireDate)
  const daysLeft = Math.max(0, persona.waitingDays - daysIn)
  const pct = Math.min(100, Math.round((daysIn / persona.waitingDays) * 100))
  const eligibleDate = new Date(persona.hireDate)
  eligibleDate.setDate(eligibleDate.getDate() + persona.waitingDays)

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <Lock className="w-4 h-4 text-amber-500" />
        <p className="text-sm font-semibold text-slate-900">Benefits Enrollment</p>
        <span className="ml-auto text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
          Waiting Period
        </span>
      </div>
      <div className="p-5">
        <p className="text-sm text-slate-600 mb-4">
          Your 90-day waiting period ends on{' '}
          <strong>{eligibleDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.
          You can preview available plans now.
        </p>
        <div className="mb-2 flex justify-between text-xs text-slate-500">
          <span>Day {daysIn} of {persona.waitingDays}</span>
          <span>{pct}% complete — {daysLeft} days remaining</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <Link href="/enroll/dental"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0875e1] hover:underline">
          Preview available plans <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

function EligibleCard({ persona }: { persona: PersonaConfig }) {
  const windowLeft = persona.enrollmentWindowEnd ? daysUntil(persona.enrollmentWindowEnd) : 30
  const urgent = windowLeft <= 7
  return (
    <div className={cn('rounded-xl border-2 overflow-hidden', urgent ? 'border-red-400' : 'border-[#0875e1]')}>
      <div className={cn('px-5 py-3 border-b flex items-center gap-2',
        urgent ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100')}>
        <Zap className={cn('w-4 h-4', urgent ? 'text-red-600' : 'text-[#0875e1]')} />
        <p className={cn('text-sm font-bold', urgent ? 'text-red-900' : 'text-[#0875e1]')}>
          Action Required — Enroll in Benefits
        </p>
        <span className={cn('ml-auto text-[11px] font-bold px-2 py-0.5 rounded',
          urgent ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800')}>
          {windowLeft} days left
        </span>
      </div>
      <div className="p-5 bg-white">
        <p className="text-sm text-slate-700 mb-4">
          Your waiting period is complete. Enroll now — your window closes{' '}
          <strong>
            {persona.enrollmentWindowEnd
              ? new Date(persona.enrollmentWindowEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
              : 'soon'}
          </strong>.
          Missing this window means waiting until Open Enrollment in November.
        </p>
        <div className="flex gap-3">
          <Link href="/enroll/dental"
            className={cn('inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white',
              urgent ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0875e1] hover:bg-[#0660c4]')}>
            <Stethoscope className="w-4 h-4" /> Enroll in Dental
          </Link>
          <Link href="/enroll"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50">
            View all benefits
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface EmployeeDashboardProps {
  workerId: string
  displayName: string
}

export function EmployeeDashboard({ workerId, displayName }: EmployeeDashboardProps) {
  if (!workerId) {
    return (
      <div className="space-y-4 animate-pulse max-w-4xl mx-auto">
        {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-xl" />)}
      </div>
    )
  }

  const basePersona = PERSONAS[workerId] || PERSONAS.DEFAULT
  const persona: PersonaConfig = displayName ? { ...basePersona, name: displayName } : basePersona

  const tenureStr = tenure(persona.hireDate)
  const oeIn = daysUntil(persona.openEnrollStart)
  const atMax = !!(persona.annualUsed !== undefined
    && persona.annualLimit
    && persona.annualUsed >= persona.annualLimit)

  // Build "Awaiting Action" items
  const actionItems: { text: string; href: string; urgent?: boolean }[] = []
  if (persona.state === 'ELIGIBLE') {
    const wl = persona.enrollmentWindowEnd ? daysUntil(persona.enrollmentWindowEnd) : 30
    actionItems.push({
      text: `Enroll in dental benefits — window closes in ${wl} days`,
      href: '/enroll/dental',
      urgent: wl <= 7,
    })
  }
  if (atMax) {
    actionItems.push({
      text: 'Annual dental maximum reached ($1,500). Out-of-pocket until Jan 1.',
      href: '/enroll/estimator',
      urgent: true,
    })
  }

  // Worklet definitions
  const worklets = [
    { href: '/payroll', icon: DollarSign, label: 'Pay', iconBg: 'bg-green-50', iconColor: 'text-green-600' },
    { href: '/enroll', icon: Heart, label: 'Benefits', iconBg: 'bg-red-50', iconColor: 'text-red-500' },
    { href: '/inbox', icon: Inbox, label: 'Inbox', iconBg: 'bg-orange-50', iconColor: 'text-orange-500', badge: actionItems.length },
    { href: '/time-off', icon: Calendar, label: 'Time Off', iconBg: 'bg-purple-50', iconColor: 'text-purple-600', disabled: true },
    { href: '/performance', icon: Star, label: 'Performance', iconBg: 'bg-yellow-50', iconColor: 'text-yellow-500', disabled: true },
    { href: '/profile', icon: User, label: 'Profile', iconBg: 'bg-slate-100', iconColor: 'text-slate-500', disabled: true },
    { href: '/career', icon: TrendingUp, label: 'Career', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', disabled: true },
    { href: '/documents', icon: FileText, label: 'Documents', iconBg: 'bg-teal-50', iconColor: 'text-teal-600', disabled: true },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Workday-style top info bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{persona.name}</h2>
          <p className="text-sm text-slate-500">{persona.title} · {persona.org} · ESI-{workerId.replace('ESI-', '')}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {tenureStr} tenure
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Hired {new Date(persona.hireDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {persona.state === 'ENROLLED' && (
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Coverage Active
            </span>
          )}
        </div>
      </div>

      {/* Awaiting Action */}
      {actionItems.length > 0 && <AwaitingAction items={actionItems} />}

      {/* Worklet grid */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">My Apps</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {worklets.map(w => (
            <Worklet key={w.label} {...w} />
          ))}
        </div>
      </div>

      {/* Benefits & Pay Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Benefits section — 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-slate-900">Benefits &amp; Pay Hub</h3>
            </div>
            <Link href="/enroll"
              className="text-xs font-semibold text-[#0875e1] hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Benefit plan rows */}
          {persona.state === 'ENROLLED' && <BenefitRow persona={persona} />}
          {persona.state === 'WAITING' && (
            <div className="p-5"><WaitingCard persona={persona} /></div>
          )}
          {persona.state === 'ELIGIBLE' && (
            <div className="p-5"><EligibleCard persona={persona} /></div>
          )}
        </div>

        {/* Pay & deductions — 1/3 width */}
        <div className="space-y-4">
          {/* Pay summary */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-bold text-slate-900">Pay Summary</h3>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="px-5 py-3 flex justify-between items-center">
                <p className="text-xs text-slate-500">Dental deduction</p>
                <p className="text-sm font-bold text-slate-900 font-mono">
                  {persona.monthlyPremium ? `$${persona.monthlyPremium}/mo` : '—'}
                </p>
              </div>
              <div className="px-5 py-3 flex justify-between items-center">
                <p className="text-xs text-slate-500">Medical deduction</p>
                <p className="text-sm font-semibold text-slate-400 font-mono">—</p>
              </div>
              <div className="px-5 py-3 flex justify-between items-center">
                <p className="text-xs text-slate-500">Vision deduction</p>
                <p className="text-sm font-semibold text-slate-400 font-mono">—</p>
              </div>
              <div className="px-5 py-3 flex justify-between items-center bg-slate-50">
                <p className="text-xs font-semibold text-slate-700">Total monthly</p>
                <p className="text-sm font-bold text-slate-900 font-mono">
                  {persona.monthlyPremium ? `$${persona.monthlyPremium}` : '$0'}/mo
                </p>
              </div>
            </div>
          </div>

          {/* Open enrollment countdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Open Enrollment
            </p>
            <p className="text-xl font-bold text-slate-900">{oeIn > 0 ? `${oeIn}d` : 'Now'}</p>
            <p className="text-xs text-slate-400">until Nov 1–30, 2026</p>
            <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#0875e1] rounded-full" style={{ width: '18%' }} />
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-700">Quick Actions</p>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { label: 'View dental plan details', href: '/enroll/dental' },
                { label: 'Estimate procedure costs', href: '/enroll/estimator' },
                { label: 'View pay history', href: '/payroll' },
                { label: 'Clock in / Time log', href: '/time-off' },
              ].map(item => (
                <Link key={item.label} href={item.href}
                  className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50 transition-colors group">
                  <span className="text-xs text-slate-700 group-hover:text-[#0875e1]">{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0875e1]" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-[11px] text-slate-400 text-center pt-2">
        BenefitsFlow HRIS Lab · Plan Year 2026 · All data is fictional
      </p>
    </div>
  )
}
