'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Calendar, Heart, Clock, TrendingUp, Star, Shield,
  ChevronRight, AlertTriangle, CheckCircle2, Bell,
  User, Stethoscope, Calculator, FileText, Gift,
  Award, Zap, RefreshCw, Info, ArrowRight
} from 'lucide-react'

// ── Demo worker profile (Jordan Rivera, ESI-10001) ─────────────────────────
const DEMO_EMPLOYEE = {
  id: 'ESI-10001',
  firstName: 'Jordan',
  lastName: 'Rivera',
  title: 'HR Solutions Analyst',
  department: 'Human Resources',
  org: 'Ensign Services, Inc.',
  hireDate: '2024-01-15',
  state: 'CA',
  weeklyHours: 40,
  // Benefits
  enrollmentDate: '2024-02-01',   // when coverage started
  planName: 'Cigna Dental PPO Enhanced',
  planType: 'PPO',
  coverageTier: 'EF',             // Employee + Family
  monthlyPremium: 189,
  carrier: 'Cigna',
  // Accumulators YTD 2026
  deductibleUsed: 50,
  deductibleLimit: 50,
  annualUsed: 1500,
  annualLimit: 1500,
  orthoUsed: 750,
  orthoLimit: 1500,
  // Dependents
  dependents: [
    { name: 'Sarah Rivera', rel: 'Spouse', dob: '1989-03-14' },
    { name: 'Lily Rivera',  rel: 'Child',  dob: '2015-07-22' },
    { name: 'Noah Rivera',  rel: 'Child',  dob: '2018-11-05' },
  ],
  // Open enrollment window (next one)
  openEnrollStart: '2026-11-01',
  openEnrollEnd:   '2026-11-30',
  coverageEffective: '2027-01-01',
}

// ─── Utility helpers ────────────────────────────────────────────────────────
function dateDiff(from: string, to: Date = new Date()) {
  const start = new Date(from)
  const totalDays = Math.floor((to.getTime() - start.getTime()) / 86_400_000)
  const years  = Math.floor(totalDays / 365)
  const months = Math.floor((totalDays % 365) / 30)
  const days   = totalDays % 30
  return { years, months, days, totalDays }
}

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
}

function fmtTenure(years: number, months: number, days: number) {
  if (years === 0 && months === 0) return `${days} days`
  if (years === 0) return `${months} mo`
  if (months === 0) return `${years} yr`
  return `${years} yr ${months} mo`
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'blue', badge }:
  { icon: React.ElementType; label: string; value: string; sub?: string; color?: string; badge?: string }) {
  const colorMap: Record<string, string> = {
    blue:   'bg-blue-50  text-blue-600',
    teal:   'bg-teal-50  text-teal-600',
    violet: 'bg-violet-50 text-violet-600',
    amber:  'bg-amber-50  text-amber-600',
    emerald:'bg-emerald-50 text-emerald-600',
    rose:   'bg-rose-50   text-rose-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {badge && (
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
        <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function AccGauge({ label, used, limit, color }: { label: string; used: number; limit: number; color: string }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  const remaining = Math.max(0, limit - used)
  const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : color
  const maxReached = pct >= 100

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        <span className={cn('text-xs font-bold', maxReached ? 'text-red-600' : 'text-slate-800')}>
          {maxReached ? '⚠ MAX REACHED' : `$${remaining} left`}
        </span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span>${used} used</span>
        <span>of ${limit}</span>
      </div>
    </div>
  )
}

// Animated countdown ring
function CountdownRing({ daysLeft, totalWindow }: { daysLeft: number; totalWindow: number }) {
  const pct = Math.max(0, Math.min(100, (daysLeft / totalWindow) * 100))
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const urgent = daysLeft <= 14
  const color = urgent ? '#ef4444' : daysLeft <= 30 ? '#f59e0b' : '#2563eb'

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="50" y="46" textAnchor="middle" fill={color} fontSize="18" fontWeight="700">{daysLeft}</text>
        <text x="50" y="60" textAnchor="middle" fill="#94a3b8" fontSize="9">days</text>
      </svg>
      <p className="text-xs font-semibold text-slate-600 mt-1">until open enrollment</p>
    </div>
  )
}

// Milestone timeline
function TenureTimeline({ hireDate, enrollDate }: { hireDate: string; enrollDate: string }) {
  const today = new Date()
  const hire = new Date(hireDate)

  const milestones = [
    { date: hireDate,     label: 'First Day',            icon: '🧑‍💼', reached: true },
    { date: enrollDate,   label: 'Benefits Active',      icon: '✅', reached: true },
    {
      date: (() => { const d = new Date(hire); d.setFullYear(d.getFullYear() + 1); return d.toISOString().slice(0,10) })(),
      label: '1-Year Anniversary',
      icon: '🎂',
      reached: new Date(hireDate).setFullYear(new Date(hireDate).getFullYear() + 1) <= today.getTime(),
    },
    {
      date: (() => { const d = new Date(hire); d.setFullYear(d.getFullYear() + 3); return d.toISOString().slice(0,10) })(),
      label: '3-Year Vesting',
      icon: '💎',
      reached: new Date(hireDate).setFullYear(new Date(hireDate).getFullYear() + 3) <= today.getTime(),
    },
    { date: '2026-11-01', label: 'Open Enrollment Opens', icon: '📋', reached: false },
    { date: '2027-01-01', label: '2027 Coverage Starts',  icon: '🗓',  reached: false },
  ]

  return (
    <div className="relative">
      <div className="absolute left-5 top-2 bottom-2 w-px bg-slate-200" />
      <div className="space-y-4">
        {milestones.map((m, i) => (
          <div key={i} className="relative flex items-start gap-4 pl-2">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 shrink-0 z-10',
              m.reached ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'
            )}>
              {m.reached
                ? <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                : <span className="text-[11px]">{m.icon}</span>}
            </div>
            <div className="flex-1 pb-1">
              <p className={cn('text-xs font-semibold', m.reached ? 'text-slate-900' : 'text-slate-400')}>{m.label}</p>
              <p className="text-[10px] text-slate-400">{m.date}
                {!m.reached && daysUntil(m.date) > 0 && ` · ${daysUntil(m.date)} days away`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export function EmployeeDashboard() {
  const e = DEMO_EMPLOYEE
  const today = new Date()

  const tenure  = dateDiff(e.hireDate)
  const enrolled = dateDiff(e.enrollmentDate)
  const daysToOE = daysUntil(e.openEnrollStart)
  const oeWindowDays = daysUntil(e.coverageEffective)  // days until new coverage year
  const biweeklyPremium = parseFloat((e.monthlyPremium * 12 / 26).toFixed(2))

  const coverageTierMap: Record<string, string> = {
    EO: 'Employee Only', ES: 'Employee + Spouse', EC: 'Employee + Children', EF: 'Employee + Family',
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ── Welcome banner ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#243447] rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-0.5">Welcome back,</p>
          <h1 className="text-2xl font-bold">{e.firstName} {e.lastName}</h1>
          <p className="text-slate-300 text-sm mt-0.5">{e.title} · {e.org}</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5" />
              Hired {e.hireDate}
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-300">
              <Heart className="w-3.5 h-3.5 text-red-400" />
              {e.carrier} · {e.planType}
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Coverage Active
            </span>
          </div>
        </div>
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
          {e.firstName[0]}{e.lastName[0]}
        </div>
      </div>

      {/* ── Annual max alert ───────────────────────────────────────────── */}
      {e.annualUsed >= e.annualLimit && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold text-red-800">Annual dental maximum reached ($1,500).</span>
            <span className="text-red-700 ml-1">All remaining dental costs this plan year are 100% your responsibility. New limit resets Jan 1, 2027.</span>
          </div>
          <Link href="/enroll/estimator" className="text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors">
            Cost Estimator →
          </Link>
        </div>
      )}

      {/* ── Stat cards row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Award}
          label="Company tenure"
          value={fmtTenure(tenure.years, tenure.months, tenure.days)}
          sub={`${tenure.totalDays.toLocaleString()} days · since ${e.hireDate}`}
          color="blue"
          badge={tenure.years >= 1 ? `${tenure.years}yr` : undefined}
        />
        <StatCard
          icon={Heart}
          label="Enrolled in benefits"
          value={fmtTenure(enrolled.years, enrolled.months, enrolled.days)}
          sub={`Coverage started ${e.enrollmentDate}`}
          color="rose"
        />
        <StatCard
          icon={Calendar}
          label="Next open enrollment"
          value={daysToOE > 0 ? `${daysToOE}d` : 'Open Now!'}
          sub={daysToOE > 0 ? `Starts ${e.openEnrollStart} · Ends ${e.openEnrollEnd}` : `Closes ${e.openEnrollEnd}`}
          color={daysToOE <= 14 ? 'amber' : 'violet'}
          badge={daysToOE <= 0 ? 'OPEN' : daysToOE <= 30 ? 'Soon' : undefined}
        />
        <StatCard
          icon={Shield}
          label="Your paycheck deduction"
          value={`$${biweeklyPremium}`}
          sub={`Per paycheck · $${e.monthlyPremium}/mo · ${coverageTierMap[e.coverageTier]}`}
          color="emerald"
        />
      </div>

      {/* ── Main body ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left 2 cols */}
        <div className="lg:col-span-2 space-y-5">

          {/* Current plan card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-400" /> Your Dental Plan – 2026
              </h2>
              <Link href="/enroll/dental"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
                View / Change <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ['Plan', e.planName],
                ['Plan Type', e.planType],
                ['Coverage', coverageTierMap[e.coverageTier]],
                ['Carrier', e.carrier],
                ['State', `${e.state} (auto-assigned)`],
                ['Effective', e.enrollmentDate],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">{k}</p>
                  <p className="text-xs font-semibold text-slate-800">{v}</p>
                </div>
              ))}
            </div>

            {/* Dependents strip */}
            {e.dependents.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Covered Dependents</p>
                <div className="flex flex-wrap gap-2">
                  {e.dependents.map(dep => {
                    const age = Math.floor((Date.now() - new Date(dep.dob).getTime()) / (365.25 * 86_400_000))
                    return (
                      <div key={dep.name} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
                        <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-[9px] font-bold text-teal-700">
                          {dep.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-slate-800 leading-none">{dep.name}</p>
                          <p className="text-[9px] text-slate-400">{dep.rel} · Age {age}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Accumulator gauges */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-500" /> Dental Accumulators – YTD 2026
              </h2>
              <span className="text-[10px] text-slate-400">Resets Jan 1, 2027</span>
            </div>
            <div className="space-y-5">
              <AccGauge label="Annual Deductible" used={e.deductibleUsed} limit={e.deductibleLimit} color="bg-blue-500" />
              <AccGauge label="Annual Maximum Benefit" used={e.annualUsed} limit={e.annualLimit} color="bg-blue-500" />
              <AccGauge label="Orthodontia Lifetime Maximum" used={e.orthoUsed} limit={e.orthoLimit} color="bg-violet-500" />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <p className="text-[11px] text-slate-400">
                The annual deductible and annual max reset every January 1. The orthodontia lifetime maximum is a one-time total — once reached, no further ortho benefits are available under this plan.
              </p>
            </div>
          </div>

          {/* Open enrollment countdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 mb-4">
              <RefreshCw className="w-4 h-4 text-violet-500" /> Next Open Enrollment
            </h2>
            <div className="flex items-center gap-6">
              <CountdownRing daysLeft={Math.max(0, daysToOE)} totalWindow={180} />
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Window Opens',      e.openEnrollStart],
                    ['Window Closes',     e.openEnrollEnd],
                    ['New Coverage Year', e.coverageEffective],
                    ['Days to Change',    '30 days (window)'],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-slate-50 rounded-xl px-3 py-2">
                      <p className="text-[10px] text-slate-400 font-medium">{k}</p>
                      <p className="text-xs font-bold text-slate-800">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-violet-50 border border-violet-200 rounded-xl px-3 py-2.5">
                  <p className="text-[11px] text-violet-800 font-medium mb-1">What you can change during open enrollment:</p>
                  <ul className="text-[10px] text-violet-700 space-y-0.5 list-disc list-inside">
                    <li>Switch between PPO and DHMO</li>
                    <li>Change coverage tier (add/remove dependents)</li>
                    <li>Enroll in or change FSA election</li>
                    <li>Update vision plan</li>
                  </ul>
                </div>
                <p className="text-[10px] text-slate-400 flex items-start gap-1.5">
                  <Zap className="w-3 h-3 shrink-0 mt-0.5 text-amber-400" />
                  Outside open enrollment, you can only make changes within 30 days of a qualifying life event (marriage, birth, job loss, etc.)
                </p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Enroll / Change Plan', href: '/enroll/dental', icon: Stethoscope, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
              { label: 'Cost Estimator', href: '/enroll/estimator', icon: Calculator, color: 'text-teal-600 bg-teal-50 hover:bg-teal-100' },
              { label: 'My Inbox', href: '/inbox', icon: Bell, color: 'text-violet-600 bg-violet-50 hover:bg-violet-100' },
              { label: 'Report Life Event', href: '/inbox', icon: FileText, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
            ].map(a => (
              <Link key={a.href + a.label} href={a.href}
                className={cn('flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-center transition-colors border border-transparent hover:border-current/10', a.color)}>
                <a.icon className="w-5 h-5" />
                <span className="text-xs font-semibold leading-snug">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column: timeline + benefits snapshot */}
        <div className="space-y-5">

          {/* Employment timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 mb-4">
              <Star className="w-4 h-4 text-amber-400" /> Your Journey
            </h2>
            <TenureTimeline hireDate={e.hireDate} enrollDate={e.enrollmentDate} />
          </div>

          {/* Benefits snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 mb-3">
              <Gift className="w-4 h-4 text-rose-400" /> Benefits Snapshot
            </h2>
            <div className="space-y-2">
              {[
                { label: 'Dental', status: 'Active · PPO', color: 'text-emerald-600', href: '/enroll/dental' },
                { label: 'Vision', status: 'Active · VSP', color: 'text-emerald-600', href: '/enroll/vision' },
                { label: 'Medical', status: 'Active · Kaiser HMO', color: 'text-emerald-600', href: '/enroll' },
                { label: 'FSA', status: '$1,800 elected', color: 'text-blue-600', href: '/enroll/fsa' },
                { label: 'Life Insurance', status: '2× salary (basic)', color: 'text-slate-500', href: '/enroll' },
                { label: '401(k)', status: '6% contribution + 3% match', color: 'text-emerald-600', href: '/enroll' },
              ].map(b => (
                <div key={b.label} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-xs font-medium text-slate-700">{b.label}</span>
                  <div className="flex items-center gap-1">
                    <span className={cn('text-[11px] font-medium', b.color)}>{b.status}</span>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div className="space-y-1 text-[11px] text-slate-500">
                <p><strong className="text-slate-700">Eligibility tier:</strong> Full Benefits (40 hrs/week)</p>
                <p><strong className="text-slate-700">Carrier assignment:</strong> {e.state} state → {e.carrier} (auto-assigned)</p>
                <p><strong className="text-slate-700">Coverage track:</strong> Fast-track · Coverage starts 1st of month after hire</p>
                <p><strong className="text-slate-700">QLE window:</strong> 30 days from qualifying life event to make mid-year changes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
