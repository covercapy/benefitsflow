'use client'

import { useState } from 'react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { COVERAGE_TIER_LABELS, Worker, getDentalCarrierForState } from '@/types'
import {
  User, MapPin, Building2, Calendar, Heart, Shield,
  TrendingUp, AlertTriangle, CheckCircle2, ChevronRight,
  FileText, Clock, Activity, ExternalLink, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

// Local demo types (avoid fighting imported types with nullable fields)
interface DemoWorker extends Worker {
  hireDate: string
  jobTitle: string
  department: string
  org: string
  supervisor: string
  workEmail: string
  phone: string
  city: string
  enrollmentDeadline: string | null
  coverageStartDate: string | null
}

interface DemoElection {
  status: string
  enrollment_status?: string
  coverage_tier?: string | null
  planName?: string | null
  planType?: string | null
  monthlyPremium?: number | null
  election_date?: string | null
}

interface DemoAccumulator {
  deductible_used: number
  deductible_limit: number
  annual_used: number
  annual_limit: number
  ortho_used: number
  ortho_limit: number
  plan_year: number
  planYear: number
  annualMaxAmt: number
}

// Demo data fallback (matches seed)
const DEMO_WORKERS: Record<string, DemoWorker> = {
  'ESI-10001': {
    id: '1', employee_id: 'ESI-10001', first_name: 'Jordan', last_name: 'Rivera',
    email: 'j.rivera@ensign.example.com', employment_type: 'FULL_TIME',
    work_state: 'CA', worker_status: 'ACTIVE', benefit_tier: 'FULL', avg_weekly_hours: 40,
    hire_date: '2024-01-15', hireDate: '2024-01-15',
    employee_category: 'FAST_TRACK', role: 'HRIS_ANALYST',
    created_at: '', updated_at: '',
    jobTitle: 'HRIS Analyst', department: 'Human Resources', org: 'Ensign Services, Inc.',
    supervisor: 'Maria Chen', workEmail: 'j.rivera@ensign.example.com', phone: '(949) 555-0101',
    city: 'San Juan Capistrano',
    enrollment_deadline: undefined, coverageStartDate: '2024-02-01', enrollmentDeadline: null,
  },
  'ESI-10003': {
    id: '3', employee_id: 'ESI-10003', first_name: 'Elena', last_name: 'Vasquez',
    email: 'e.vasquez@vintage.example.com', employment_type: 'FULL_TIME',
    work_state: 'CA', worker_status: 'ACTIVE', benefit_tier: 'FULL', avg_weekly_hours: 40,
    hire_date: '2026-06-08', hireDate: '2026-06-08',
    employee_category: 'FAST_TRACK', role: 'EMPLOYEE',
    created_at: '', updated_at: '',
    jobTitle: 'Registered Dental Hygienist', department: 'Clinical', org: 'Vintage Dental Care - CA',
    supervisor: 'Dr. Patricia Nguyen', workEmail: 'e.vasquez@vintage.example.com', phone: '(949) 555-0103',
    city: 'Laguna Hills',
    enrollment_deadline: '2026-07-08', coverageStartDate: null, enrollmentDeadline: '2026-07-08',
  },
  'ESI-10012': {
    id: '12', employee_id: 'ESI-10012', first_name: 'Marcus', last_name: 'Webb',
    email: 'm.webb@cascade.example.com', employment_type: 'PART_TIME',
    work_state: 'OR', worker_status: 'ACTIVE', benefit_tier: 'FULL', avg_weekly_hours: 32,
    hire_date: '2023-09-01', hireDate: '2023-09-01',
    employee_category: 'STANDARD', role: 'EMPLOYEE',
    created_at: '', updated_at: '',
    jobTitle: 'CNA – Certified Nursing Assistant', department: 'Nursing', org: 'Cascade Senior Living - OR',
    supervisor: 'Danielle Park', workEmail: 'm.webb@cascade.example.com', phone: '(503) 555-0112',
    city: 'Portland',
    enrollment_deadline: undefined, coverageStartDate: '2023-10-01', enrollmentDeadline: null,
  },
}

const DEMO_ELECTIONS: Record<string, DemoElection> = {
  'ESI-10001': { status: 'ACTIVE', coverage_tier: 'EF', planName: 'Delta Dental PPO Enhanced', planType: 'PPO', monthlyPremium: 189, election_date: '2024-01-16' },
  'ESI-10003': { status: 'IN_PROGRESS', coverage_tier: null, planName: null, planType: null, monthlyPremium: null, election_date: null },
  'ESI-10012': { status: 'ACTIVE', coverage_tier: 'ES', planName: 'Delta Dental PPO Enhanced', planType: 'PPO', monthlyPremium: 127, election_date: '2023-09-02' },
}

const DEMO_ACCUMULATORS: Record<string, DemoAccumulator> = {
  'ESI-10001': { deductible_used: 50, deductible_limit: 50, annual_used: 1500, annual_limit: 1500, ortho_used: 750, ortho_limit: 1500, plan_year: 2026, planYear: 2026, annualMaxAmt: 1500 },
  'ESI-10003': { deductible_used: 0, deductible_limit: 50, annual_used: 0, annual_limit: 1500, ortho_used: 0, ortho_limit: 1500, plan_year: 2026, planYear: 2026, annualMaxAmt: 1500 },
  'ESI-10012': { deductible_used: 50, deductible_limit: 50, annual_used: 480, annual_limit: 1500, ortho_used: 0, ortho_limit: 1500, plan_year: 2026, planYear: 2026, annualMaxAmt: 1500 },
}

const DEMO_DEPENDENTS: Record<string, { name: string; rel: string; dob: string; covered: boolean }[]> = {
  'ESI-10001': [
    { name: 'Sarah Rivera', rel: 'Spouse', dob: '1989-03-14', covered: true },
    { name: 'Lily Rivera', rel: 'Child', dob: '2015-07-22', covered: true },
    { name: 'Noah Rivera', rel: 'Child', dob: '2018-11-05', covered: true },
  ],
  'ESI-10003': [],
  'ESI-10012': [
    { name: 'Diana Webb', rel: 'Spouse', dob: '1982-09-30', covered: true },
    { name: 'Lucas Webb', rel: 'Child', dob: '1999-07-22', covered: true },
  ],
}

function AccBar({ used, limit, label, color = 'blue' }: { used: number; limit: number; label: string; color?: string }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  const barColor = pct >= 95 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : color === 'violet' ? 'bg-violet-500' : 'bg-blue-500'
  const maxReached = pct >= 100

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-slate-600 font-medium">{label}</span>
        <span className={cn('text-xs font-bold', maxReached ? 'text-red-600' : 'text-slate-700')}>
          {maxReached ? 'MAX REACHED' : `$${used} / $${limit}`}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-slate-400">{pct.toFixed(0)}% used</span>
        <span className="text-[10px] text-slate-400">Remaining: ${Math.max(0, limit - used)}</span>
      </div>
    </div>
  )
}

export function WorkerDetail({ employeeId }: { employeeId: string }) {
  const worker = DEMO_WORKERS[employeeId]
  const election = DEMO_ELECTIONS[employeeId]
  const accumulators = DEMO_ACCUMULATORS[employeeId]
  const dependents = DEMO_DEPENDENTS[employeeId] || []

  if (!worker) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 text-sm">Worker not found: {employeeId}</p>
        <Link href="/workers" className="text-blue-600 text-sm hover:underline mt-2 inline-block">← Back to Workers</Link>
      </div>
    )
  }

  const carrier = getDentalCarrierForState(worker.work_state)
  const tierLabel = worker.benefit_tier ? COVERAGE_TIER_LABELS[worker.benefit_tier as keyof typeof COVERAGE_TIER_LABELS] : 'Unknown'

  const deadlineDays = worker.enrollmentDeadline
    ? Math.ceil((new Date(worker.enrollmentDeadline).getTime() - Date.now()) / 86400000)
    : null

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Back link */}
      <Link href="/workers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> All Workers
      </Link>

      {/* Worker header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-xl font-bold text-white shrink-0">
            {worker.first_name[0]}{worker.last_name[0]}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{worker.first_name} {worker.last_name}</h1>
                <p className="text-slate-500 text-sm mt-0.5">{worker.jobTitle} · {worker.department}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-semibold',
                  worker.worker_status === 'ACTIVE' ? 'badge-active' : 'badge-terminated')}>
                  {worker.worker_status}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" /> {worker.employee_id}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" /> {worker.org}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {worker.city}, {worker.work_state}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Hired {worker.hireDate}
              </span>
              <span className="flex items-center gap-1 text-blue-600 font-medium">
                <Heart className="w-3 h-3" /> {carrier}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {worker.avg_weekly_hours} hrs/week
              </span>
            </div>
          </div>
        </div>

        {/* Deadline alert */}
        {deadlineDays !== null && (
          <div className={cn('mt-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium',
            deadlineDays <= 3 ? 'bg-red-50 border border-red-300 text-red-800' :
            deadlineDays <= 7 ? 'bg-amber-50 border border-amber-300 text-amber-800' :
            'bg-blue-50 border border-blue-200 text-blue-800')}>
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Enrollment deadline: {worker.enrollmentDeadline} ({deadlineDays > 0 ? `${deadlineDays} days remaining` : 'EXPIRED'})
            <Link href="/enroll/dental" className="ml-auto text-xs font-bold hover:underline">
              Start Enrollment →
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Benefit eligibility */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-500" /> Benefit Eligibility
            </h2>
            <div className="space-y-2">
              {[
                ['Eligibility Tier', tierLabel],
                ['Hours Threshold', `${worker.avg_weekly_hours}+ hrs (Full Benefits)`],
                ['Coverage Track', worker.avg_weekly_hours >= 30 ? 'Full Benefits' : 'Limited'],
                ['Coverage Start', worker.coverageStartDate || 'Pending enrollment'],
                ['Supervisor', worker.supervisor],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-xs text-slate-500">{k}</span>
                  <span className="text-xs font-medium text-slate-800 text-right max-w-[55%]">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dependents */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-500" /> Dependents
            </h2>
            {dependents.length === 0 ? (
              <p className="text-xs text-slate-400">No dependents on file</p>
            ) : (
              <div className="space-y-2.5">
                {dependents.map(dep => {
                  const age = Math.floor((Date.now() - new Date(dep.dob).getTime()) / (365.25 * 86400000))
                  const agingOut = dep.rel === 'Child' && age >= 25
                  return (
                    <div key={dep.name} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-bold text-teal-700 shrink-0">
                        {dep.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-800">{dep.name}</p>
                        <p className="text-[10px] text-slate-400">{dep.rel} · Age {age}</p>
                      </div>
                      {agingOut && (
                        <span className="text-[9px] text-amber-700 bg-amber-100 px-1.5 rounded font-bold">Age-out</span>
                      )}
                      {dep.covered && !agingOut && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: dental election + accumulators */}
        <div className="lg:col-span-2 space-y-5">
          {/* Current election */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-400" /> Dental Election – Plan Year 2026
              </h2>
              {election?.status && (
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold',
                  election.status === 'ACTIVE' ? 'badge-active' :
                  election.status === 'IN_PROGRESS' ? 'badge-pending' :
                  election.status === 'WAIVED' ? 'badge-waived' : 'bg-slate-100 text-slate-500')}>
                  {election.status}
                </span>
              )}
            </div>

            {election?.status === 'IN_PROGRESS' || !election?.planName ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Enrollment not started</p>
                    <p className="text-xs text-amber-600 mt-0.5">No plan has been elected for Plan Year 2026. Deadline applies.</p>
                  </div>
                  <Link href="/enroll/dental"
                    className="ml-auto text-xs font-bold text-blue-600 bg-white border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 whitespace-nowrap">
                    Start Enrollment →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Plan', election.planName],
                  ['Plan Type', election.planType],
                  ['Coverage Tier', election.coverage_tier ? (COVERAGE_TIER_LABELS as Record<string, string>)[election.coverage_tier] ?? election.coverage_tier : '—'],
                  ['Monthly Premium', election.monthlyPremium ? `$${election.monthlyPremium}/mo` : '—'],
                  ['Carrier', carrier],
                  ['Elected On', election.election_date || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="bg-slate-50 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{k}</p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Accumulators */}
          {accumulators && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-500" /> Dental Accumulators – YTD 2026
              </h2>

              {election?.status === 'IN_PROGRESS' || !election?.planName ? (
                <p className="text-xs text-slate-400">No active election — accumulators not applicable</p>
              ) : (
                <div className="space-y-4">
                  <AccBar
                    used={accumulators.deductible_used ?? 0}
                    limit={accumulators.deductible_limit ?? 50}
                    label="Annual Deductible"
                    color="blue"
                  />
                  <AccBar
                    used={accumulators.annual_used ?? 0}
                    limit={accumulators.annual_limit ?? 1500}
                    label="Annual Maximum Benefit"
                    color="blue"
                  />
                  <AccBar
                    used={accumulators.ortho_used ?? 0}
                    limit={accumulators.ortho_limit ?? 1500}
                    label="Orthodontia Lifetime Maximum"
                    color="violet"
                  />

                  {(accumulators.annual_used ?? 0) >= 1500 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <p className="text-xs text-red-800 font-medium">Annual maximum reached. All remaining dental costs this plan year are 100% member responsibility.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Activity timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-slate-400" /> Enrollment Timeline
            </h2>
            <div className="relative pl-4">
              <div className="absolute left-1.5 top-0 bottom-0 w-px bg-slate-200" />
              {[
                { date: worker.hireDate, label: 'Hired', sub: `${worker.org}`, icon: '🧑‍💼', color: 'bg-blue-500' },
                ...(worker.coverageStartDate ? [{ date: worker.coverageStartDate, label: 'Coverage Started', sub: election?.planName || 'PPO', icon: '✅', color: 'bg-emerald-500' }] : []),
                ...(worker.enrollmentDeadline ? [{ date: worker.enrollmentDeadline, label: 'Enrollment Deadline', sub: 'Action required', icon: '⚠️', color: 'bg-amber-500' }] : []),
              ].map((ev, i) => (
                <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
                  <div className={cn('absolute -left-1.5 mt-1 w-3 h-3 rounded-full border-2 border-white', ev.color)} />
                  <div className="pl-3">
                    <p className="text-xs font-semibold text-slate-800">{ev.label}</p>
                    <p className="text-[10px] text-slate-400">{ev.date} · {ev.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
