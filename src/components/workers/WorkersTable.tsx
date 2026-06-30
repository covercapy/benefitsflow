'use client'

import { useEffect, useState } from 'react'
import { formatDate, getDaysUntilDeadline, getDeadlineUrgency, getBenefitTierLabel, getInitials, cn } from '@/lib/utils'
import { getDentalCarrierForState } from '@/types'
import { Search, Filter, ChevronRight, AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useRole } from '@/lib/role-context'

// Demo data (mirrors seed data)
const DEMO_WORKERS = [
  { id: 'w1', employeeId: 'ESI-10001', name: 'Jordan Rivera', title: 'HR Solutions Analyst – Workday', org: 'HR Technology Team', state: 'CA', hireDate: '2026-06-01', category: 'FAST_TRACK', tier: 'FULL', deadline: '2026-07-01', dentalStatus: 'ACTIVE', dentalPlan: 'Cigna Dental PPO', coverageTier: 'EF', role: 'HRIS_ANALYST' },
  { id: 'w2', employeeId: 'ESI-10002', name: 'Taylor Chen', title: 'Benefits Partner', org: 'HR Technology Team', state: 'CA', hireDate: '2026-05-15', category: 'FAST_TRACK', tier: 'FULL', deadline: '2026-06-14', dentalStatus: 'ACTIVE', dentalPlan: 'Cigna DHMO', coverageTier: 'EO', role: 'BENEFITS_PARTNER' },
  { id: 'w3', employeeId: 'ESI-10003', name: 'Morgan Walsh', title: 'HR Director', org: 'Ensign Services, Inc.', state: 'CA', hireDate: '2025-03-10', category: 'FAST_TRACK', tier: 'FULL', deadline: '2025-04-09', dentalStatus: 'ACTIVE', dentalPlan: 'Cigna Dental PPO', coverageTier: 'ES', role: 'HR_LEADERSHIP' },
  { id: 'w4', employeeId: 'ESI-10004', name: 'Elena Vasquez', title: 'Registered Nurse', org: 'Sunrise Post-Acute Care', state: 'CA', hireDate: '2026-06-15', category: 'FAST_TRACK', tier: 'FULL', deadline: '2026-07-15', dentalStatus: 'ACTIVE', dentalPlan: 'Cigna Dental PPO', coverageTier: 'EF', role: 'EMPLOYEE' },
  { id: 'w5', employeeId: 'ESI-10005', name: 'Marcus Williams', title: 'Registered Nurse', org: 'Sunrise Post-Acute Care', state: 'CA', hireDate: '2026-05-01', category: 'FAST_TRACK', tier: 'FULL', deadline: '2026-05-31', dentalStatus: 'ACTIVE', dentalPlan: 'Cigna Dental PPO', coverageTier: 'EO', role: 'EMPLOYEE' },
  { id: 'w6', employeeId: 'ESI-10006', name: 'Priya Sharma', title: 'Registered Nurse', org: 'Sunrise Post-Acute Care', state: 'CA', hireDate: '2026-04-20', category: 'FAST_TRACK', tier: 'FULL', deadline: '2026-05-20', dentalStatus: 'IN_PROGRESS', dentalPlan: '—', coverageTier: '—', role: 'EMPLOYEE' },
  { id: 'w7', employeeId: 'ESI-10007', name: 'Dmitri Petrov', title: 'Director of Nursing', org: 'Sunrise Post-Acute Care', state: 'CA', hireDate: '2026-03-01', category: 'FAST_TRACK', tier: 'FULL', deadline: '2026-03-31', dentalStatus: 'ACTIVE', dentalPlan: 'Cigna Dental PPO', coverageTier: 'EF', role: 'MANAGER' },
  { id: 'w8', employeeId: 'ESI-10008', name: 'Carmen Lopez', title: 'Dietary Aide', org: 'Sunrise Post-Acute Care', state: 'CA', hireDate: '2026-06-01', category: 'STANDARD', tier: 'FULL', deadline: '2026-07-01', dentalStatus: 'NOT_STARTED', dentalPlan: '—', coverageTier: '—', role: 'EMPLOYEE' },
  { id: 'w11', employeeId: 'ESI-10011', name: 'Aisha Montgomery', title: 'Registered Nurse', org: 'Emerald Coast Rehabilitation', state: 'OR', hireDate: '2026-05-01', category: 'FAST_TRACK', tier: 'FULL', deadline: '2026-05-31', dentalStatus: 'ACTIVE', dentalPlan: 'Delta Dental PPO', coverageTier: 'EO', role: 'EMPLOYEE' },
  { id: 'w14', employeeId: 'ESI-10014', name: 'Robert Johnson', title: 'Director of Nursing', org: 'Blue Ridge Care Center', state: 'ID', hireDate: '2026-03-15', category: 'FAST_TRACK', tier: 'FULL', deadline: '2026-04-14', dentalStatus: 'ACTIVE', dentalPlan: 'Delta Dental PPO', coverageTier: 'ES', role: 'MANAGER' },
  { id: 'w17', employeeId: 'ESI-10017', name: 'Angela Davis', title: 'Administrator', org: 'Canyon View Nursing', state: 'AZ', hireDate: '2026-05-01', category: 'FAST_TRACK', tier: 'FULL', deadline: '2026-05-31', dentalStatus: 'WAIVED', dentalPlan: 'Waived', coverageTier: '—', role: 'MANAGER' },
  { id: 'w18', employeeId: 'ESI-10018', name: 'Miguel Santos', title: 'Registered Nurse', org: 'Canyon View Nursing', state: 'AZ', hireDate: '2026-05-15', category: 'FAST_TRACK', tier: 'FULL', deadline: '2026-06-14', dentalStatus: 'ACTIVE', dentalPlan: 'Cigna DHMO', coverageTier: 'EF', role: 'EMPLOYEE' },
  { id: 'w23', employeeId: 'ESI-10023', name: 'Ashley Kim', title: 'Housekeeper', org: 'Sunrise Post-Acute Care', state: 'CA', hireDate: '2026-05-01', category: 'STANDARD', tier: 'LIMITED', deadline: '2026-05-31', dentalStatus: 'NOT_STARTED', dentalPlan: '—', coverageTier: '—', role: 'EMPLOYEE' },
  { id: 'w25', employeeId: 'ESI-10025', name: 'Rachel Green', title: 'Registered Nurse (On-Call)', org: 'Sunrise Post-Acute Care', state: 'CA', hireDate: '2026-05-20', category: 'STANDARD', tier: 'CASUAL', deadline: '—', dentalStatus: 'INELIGIBLE', dentalPlan: '—', coverageTier: '—', role: 'EMPLOYEE' },
]

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  ACTIVE: { label: 'Active', class: 'badge-active', icon: CheckCircle2 },
  IN_PROGRESS: { label: 'In Progress', class: 'badge-in-progress', icon: Clock },
  NOT_STARTED: { label: 'Not Started', class: 'badge-pending', icon: AlertTriangle },
  WAIVED: { label: 'Waived', class: 'badge-waived', icon: XCircle },
  INELIGIBLE: { label: 'Not Eligible', class: 'badge-waived', icon: XCircle },
}

export function WorkersTable() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [workers, setWorkers] = useState(DEMO_WORKERS)
  const [dataMode, setDataMode] = useState<'loading' | 'live' | 'preview'>('loading')
  const { currentRole } = useRole()

  useEffect(() => {
    fetch('/api/workers', { cache: 'no-store' })
      .then(async response => response.ok ? response.json() : Promise.reject())
      .then(({ workers: rows }) => {
        setWorkers(rows.map((row: Record<string, unknown>) => ({
          id: row.employee_id as string,
          employeeId: row.employee_id as string,
          name: row.display_name as string,
          title: (row.job_title as string) || '—',
          org: (row.organization as string) || '—',
          state: (row.work_state as string) || '—',
          hireDate: row.hire_date as string,
          category: (row.employee_category as string) || 'STANDARD',
          tier: (row.benefit_tier as string) || 'CASUAL',
          deadline: (row.enrollment_deadline as string) || '—',
          dentalStatus: (row.dental_status as string) || 'NOT_STARTED',
          dentalPlan: (row.dental_plan as string) || '—',
          coverageTier: (row.dental_coverage_tier as string) || '—',
          role: (row.security_role as string || 'EMPLOYEE').replaceAll(' ', '_'),
        })))
        setDataMode('live')
      })
      .catch(() => setDataMode('preview'))
  }, [])

  // Role-based column visibility
  const showCarrier    = currentRole !== 'MANAGER'
  const showTier       = currentRole === 'HRIS_ANALYST' || currentRole === 'HR_LEADERSHIP'
  const showDeadline   = currentRole !== 'MANAGER'
  const showOrgCol     = currentRole === 'HRIS_ANALYST' || currentRole === 'HR_LEADERSHIP'

  // Managers only see their direct-report org
  const visibleWorkers = currentRole === 'MANAGER'
    ? workers.filter(w => w.org.includes('Sunrise Post-Acute Care'))
    : workers

  const filtered = visibleWorkers.filter(w => {
    const matchSearch = search === '' ||
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      w.org.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || w.dentalStatus === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID, or organization..."
            className="text-sm text-slate-700 placeholder-slate-400 outline-none flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs text-slate-600 border border-slate-200 rounded-lg px-2 py-1.5 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="WAIVED">Waived</option>
          </select>
        </div>
        <span className="text-xs text-slate-400">{filtered.length} workers · {dataMode === 'live' ? 'Live' : dataMode === 'loading' ? 'Loading' : 'Preview'}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th className="text-left">Worker</th>
              {showCarrier   && <th className="text-left">State / Carrier</th>}
              {showTier      && <th className="text-left"><span className="text-violet-600">Benefit Tier</span></th>}
              <th className="text-left">Dental Status</th>
              <th className="text-left">Plan</th>
              {showDeadline  && <th className="text-left">Deadline</th>}
              {showOrgCol    && <th className="text-left"><span className="text-violet-600">Organization</span></th>}
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => {
              const status = STATUS_CONFIG[w.dentalStatus] || STATUS_CONFIG.NOT_STARTED
              const StatusIcon = status.icon
              const carrier = getDentalCarrierForState(w.state)
              const days = w.deadline !== '—' ? getDaysUntilDeadline(w.deadline) : null
              const urgency = days !== null ? getDeadlineUrgency(days) : null

              return (
                <tr key={w.id} className="cursor-pointer group">
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                        showTier ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700')}>
                        {getInitials(w.name.split(' ')[0], w.name.split(' ')[1])}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{w.name}</p>
                        <p className="text-xs text-slate-400">{w.employeeId} · {w.title}</p>
                      </div>
                    </div>
                  </td>
                  {showCarrier && (
                    <td>
                      <p className="text-sm text-slate-700">{w.state}</p>
                      <p className="text-xs text-slate-400">{carrier}</p>
                    </td>
                  )}
                  {showTier && (
                    <td>
                      <span className="text-xs text-violet-700 font-medium">{getBenefitTierLabel(w.tier)}</span>
                      <p className="text-[10px] text-slate-400">{w.category === 'FAST_TRACK' ? 'Fast-track' : 'Standard (60-day)'}</p>
                    </td>
                  )}
                  <td>
                    <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', status.class)}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="text-sm text-slate-600">{w.dentalPlan}</td>
                  {showDeadline && (
                    <td>
                      {days !== null && (
                        <span className={cn('text-xs font-medium', {
                          'text-red-600': urgency === 'urgent' || urgency === 'expired',
                          'text-amber-600': urgency === 'warning',
                          'text-slate-500': urgency === 'safe',
                        })}>
                          {urgency === 'expired' ? 'Expired' : `${days}d left`}
                        </span>
                      )}
                    </td>
                  )}
                  {showOrgCol && (
                    <td className="text-xs text-slate-500">{w.org}</td>
                  )}
                  <td>
                    <Link href={`/workers/${w.employeeId}`}
                      className="text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
