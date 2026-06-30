'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  CheckCircle2, AlertTriangle, Clock, ChevronRight,
  Stethoscope, Eye, DollarSign, Heart, Shield,
  Umbrella, Pill, Calculator, Info
} from 'lucide-react'

interface BenefitCard {
  id: string
  label: string
  icon: React.ElementType
  iconColor: string
  status: 'ACTIVE' | 'NOT_ENROLLED' | 'PENDING' | 'WAIVED'
  plan?: string
  tier?: string
  monthlyPremium?: number
  ytdUsed?: number
  ytdLimit?: number
  enrollHref: string
  learnHref?: string
  highlight?: string
  note?: string
}

const BENEFITS: BenefitCard[] = [
  {
    id: 'dental',
    label: 'Dental',
    icon: Stethoscope,
    iconColor: 'bg-blue-50 text-blue-600',
    status: 'ACTIVE',
    plan: 'Cigna Dental PPO Enhanced',
    tier: 'Employee + Family',
    monthlyPremium: 189,
    ytdUsed: 1500,
    ytdLimit: 1500,
    enrollHref: '/enroll/dental',
    highlight: 'Annual max reached',
    note: 'Delta Dental auto-assigned for CA',
  },
  {
    id: 'vision',
    label: 'Vision',
    icon: Eye,
    iconColor: 'bg-teal-50 text-teal-600',
    status: 'ACTIVE',
    plan: 'VSP Choice Plan',
    tier: 'Employee + Family',
    monthlyPremium: 22,
    ytdUsed: 0,
    ytdLimit: 150,
    enrollHref: '/enroll/vision',
    note: 'Annual eye exam + $150 frame allowance',
  },
  {
    id: 'medical',
    label: 'Medical',
    icon: Heart,
    iconColor: 'bg-rose-50 text-rose-600',
    status: 'ACTIVE',
    plan: 'Kaiser HMO Gold',
    tier: 'Employee + Family',
    monthlyPremium: 412,
    enrollHref: '/enroll',
    note: 'Managed through Kaiser member portal',
  },
  {
    id: 'fsa',
    label: 'Healthcare FSA',
    icon: DollarSign,
    iconColor: 'bg-emerald-50 text-emerald-600',
    status: 'ACTIVE',
    plan: 'Healthcare FSA – Cigna',
    monthlyPremium: 150,
    ytdUsed: 420,
    ytdLimit: 1800,
    enrollHref: '/enroll/fsa',
    note: '$1,800 elected · $150/mo pre-tax · Use-it-or-lose-it by Dec 31',
  },
  {
    id: 'life',
    label: 'Life & AD&D',
    icon: Umbrella,
    iconColor: 'bg-violet-50 text-violet-600',
    status: 'ACTIVE',
    plan: 'Basic Life 2× salary (employer-paid)',
    enrollHref: '/enroll',
    note: 'Supplemental life available — add during open enrollment',
  },
  {
    id: 'prescription',
    label: 'Prescription Drug',
    icon: Pill,
    iconColor: 'bg-amber-50 text-amber-600',
    status: 'ACTIVE',
    plan: 'Kaiser Rx (bundled with medical)',
    enrollHref: '/enroll',
    note: '$10 generic / $35 preferred brand / $60 non-preferred',
  },
]

const STATUS_CONFIG = {
  ACTIVE:       { label: 'Active',       class: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  NOT_ENROLLED: { label: 'Not Enrolled', class: 'bg-slate-100 text-slate-500',     icon: Clock },
  PENDING:      { label: 'Pending',      class: 'bg-amber-100 text-amber-700',     icon: Clock },
  WAIVED:       { label: 'Waived',       class: 'bg-slate-100 text-slate-400',     icon: AlertTriangle },
}

// Summary totals
const totalMonthly = BENEFITS.filter(b => b.monthlyPremium).reduce((s, b) => s + (b.monthlyPremium ?? 0), 0)
const biweekly = (totalMonthly * 12 / 26).toFixed(2)

export function BenefitsHub() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total monthly premiums', value: `$${totalMonthly.toLocaleString()}/mo`, sub: 'Employee share after employer contribution', color: 'text-slate-900' },
          { label: 'Per-paycheck deduction', value: `$${biweekly}`, sub: 'Biweekly (26 pay periods)', color: 'text-blue-700' },
          { label: 'Next change window', value: 'Nov 1 – 30', sub: 'Open enrollment 2026 · Effective Jan 1, 2027', color: 'text-violet-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
            <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs font-medium text-slate-700 mt-0.5">{s.label}</p>
            <p className="text-[11px] text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Benefit cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BENEFITS.map(b => {
          const { label: statusLabel, class: statusClass, icon: StatusIcon } = STATUS_CONFIG[b.status]
          const annualMaxHit = b.ytdUsed !== undefined && b.ytdLimit !== undefined && b.ytdUsed >= b.ytdLimit
          const Icon = b.icon

          return (
            <div key={b.id}
              className={cn('bg-white rounded-2xl border p-5 flex flex-col gap-4 transition-shadow hover:shadow-md',
                annualMaxHit ? 'border-red-200' : 'border-slate-200')}>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', b.iconColor)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{b.label}</h3>
                    {b.plan && <p className="text-[11px] text-slate-400 mt-0.5">{b.plan}</p>}
                  </div>
                </div>
                <span className={cn('flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full', statusClass)}>
                  <StatusIcon className="w-2.5 h-2.5" />
                  {statusLabel}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-xs">
                {b.tier && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Coverage tier</span>
                    <span className="font-medium text-slate-800">{b.tier}</span>
                  </div>
                )}
                {b.monthlyPremium !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly premium</span>
                    <span className="font-medium text-slate-800">${b.monthlyPremium}/mo</span>
                  </div>
                )}
                {b.ytdUsed !== undefined && b.ytdLimit !== undefined && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">YTD benefit used</span>
                      <span className={cn('font-bold', annualMaxHit ? 'text-red-600' : 'text-slate-800')}>
                        ${b.ytdUsed} / ${b.ytdLimit}
                        {annualMaxHit && ' ⚠'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', annualMaxHit ? 'bg-red-500' : 'bg-blue-500')}
                        style={{ width: `${Math.min(100, (b.ytdUsed / b.ytdLimit) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {b.note && (
                  <p className="text-[11px] text-slate-400 pt-0.5">{b.note}</p>
                )}
                {annualMaxHit && (
                  <p className="text-[11px] text-red-600 font-medium">
                    Annual max reached — remaining costs are 100% member responsibility until Jan 1.
                  </p>
                )}
              </div>

              {/* CTA */}
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                <Link href="/enroll/estimator"
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-600 transition-colors">
                  <Calculator className="w-3 h-3" /> Cost estimator
                </Link>
                <Link href={b.enrollHref}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                  View / Change <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Open enrollment reminder */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-violet-900">Open enrollment opens November 1, 2026</p>
          <p className="text-xs text-violet-700 mt-0.5">
            You can change your dental plan (PPO ↔ DHMO), update coverage tiers, add or remove dependents, and adjust your FSA election.
            Changes take effect January 1, 2027. Outside this window, changes require a qualifying life event (marriage, birth, loss of coverage).
          </p>
        </div>
        <Link href="/inbox"
          className="text-xs font-bold text-violet-700 bg-white border border-violet-200 px-3 py-1.5 rounded-lg whitespace-nowrap hover:bg-violet-100 transition-colors">
          Report Life Event
        </Link>
      </div>
    </div>
  )
}
