'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Search, ChevronDown, ChevronUp,
  CheckCircle2, Download, Info, Lock
} from 'lucide-react'

type EventType = 'ENROLLMENT' | 'QLE' | 'DEPENDENT' | 'ELIGIBILITY' | 'PLAN_CHANGE' | 'SYSTEM' | 'SECURITY'

interface AuditEntry {
  id: string
  timestamp: string
  eventType: EventType
  worker: string
  employeeId: string
  performedBy: string
  performedByRole: string
  businessProcess?: string
  object: string
  field: string
  oldValue: string | null
  newValue: string
  reason?: string
  ipAddress: string
  sessionId: string
}

const AUDIT_DATA: AuditEntry[] = [
  {
    id: 'A001', timestamp: '2026-06-29T14:32:11Z',
    eventType: 'ENROLLMENT',
    worker: 'Jordan Rivera', employeeId: 'ESI-10001',
    performedBy: 'Jordan Rivera', performedByRole: 'EMPLOYEE',
    businessProcess: 'Benefits Event – New Hire Enrollment',
    object: 'Dental Election', field: 'status',
    oldValue: 'IN_PROGRESS', newValue: 'ACTIVE',
    reason: 'Employee completed 5-step enrollment wizard',
    ipAddress: '192.168.1.101', sessionId: 'sess_r7Xk2',
  },
  {
    id: 'A002', timestamp: '2026-06-29T14:31:05Z',
    eventType: 'ENROLLMENT',
    worker: 'Jordan Rivera', employeeId: 'ESI-10001',
    performedBy: 'Jordan Rivera', performedByRole: 'EMPLOYEE',
    businessProcess: 'Benefits Event – New Hire Enrollment',
    object: 'Dental Election', field: 'coverage_tier',
    oldValue: null, newValue: 'EF',
    reason: 'Employee selected Employee + Family tier',
    ipAddress: '192.168.1.101', sessionId: 'sess_r7Xk2',
  },
  {
    id: 'A003', timestamp: '2026-06-28T09:17:44Z',
    eventType: 'QLE',
    worker: 'Marcus Webb', employeeId: 'ESI-10012',
    performedBy: 'Marcus Webb', performedByRole: 'EMPLOYEE',
    businessProcess: 'Benefits Event – QLE (Marriage)',
    object: 'QLE Event', field: 'status',
    oldValue: null, newValue: 'PENDING_REVIEW',
    reason: 'Employee submitted marriage QLE with supporting document',
    ipAddress: '10.0.0.55', sessionId: 'sess_wP9Mn',
  },
  {
    id: 'A004', timestamp: '2026-06-27T16:45:22Z',
    eventType: 'DEPENDENT',
    worker: 'Jordan Rivera', employeeId: 'ESI-10001',
    performedBy: 'Jordan Rivera', performedByRole: 'EMPLOYEE',
    businessProcess: 'Benefits Event – New Hire Enrollment',
    object: 'Dependent', field: 'record_created',
    oldValue: null, newValue: 'Sarah Rivera (Spouse)',
    reason: 'Dependent added during enrollment wizard step 3',
    ipAddress: '192.168.1.101', sessionId: 'sess_r7Xk2',
  },
  {
    id: 'A005', timestamp: '2026-06-27T11:30:00Z',
    eventType: 'ELIGIBILITY',
    worker: 'Elena Vasquez', employeeId: 'ESI-10003',
    performedBy: 'SYSTEM', performedByRole: 'SYSTEM',
    businessProcess: 'Onboarding – Eligibility Sync',
    object: 'Worker Eligibility', field: 'benefit_tier',
    oldValue: null, newValue: 'FULL',
    reason: 'Auto-calculated by trg_worker_eligibility: weekly_hours=40 ≥ 30 threshold',
    ipAddress: 'internal', sessionId: 'sys_trigger',
  },
  {
    id: 'A006', timestamp: '2026-06-27T11:30:00Z',
    eventType: 'ELIGIBILITY',
    worker: 'Elena Vasquez', employeeId: 'ESI-10003',
    performedBy: 'SYSTEM', performedByRole: 'SYSTEM',
    businessProcess: 'Onboarding – Eligibility Sync',
    object: 'Worker Eligibility', field: 'enrollment_deadline',
    oldValue: null, newValue: '2026-07-08',
    reason: 'Auto-calculated: hire_date 2026-06-08 + 30 days (FAST_TRACK)',
    ipAddress: 'internal', sessionId: 'sys_trigger',
  },
  {
    id: 'A007', timestamp: '2026-06-20T08:05:33Z',
    eventType: 'PLAN_CHANGE',
    worker: 'Taylor Chen', employeeId: 'ESI-10002',
    performedBy: 'Maria Santos', performedByRole: 'BENEFITS_PARTNER',
    businessProcess: 'Benefits Event – Manual Correction',
    object: 'Dental Election', field: 'plan_id',
    oldValue: 'PPO Enhanced', newValue: 'DHMO Standard',
    reason: 'Employee requested plan correction — original election submitted in error',
    ipAddress: '10.0.1.12', sessionId: 'sess_bP3Rq',
  },
  {
    id: 'A008', timestamp: '2026-06-15T13:22:10Z',
    eventType: 'SYSTEM',
    worker: '(all)', employeeId: '—',
    performedBy: 'SYSTEM', performedByRole: 'SYSTEM',
    businessProcess: 'Monthly Carrier Export – Cigna',
    object: 'Carrier Export File', field: 'export_status',
    oldValue: 'PENDING', newValue: 'PARTIAL (18/19 accepted)',
    reason: 'Elena Vasquez record rejected: missing dependent SSN field',
    ipAddress: 'internal', sessionId: 'sys_export_job',
  },
  {
    id: 'A009', timestamp: '2026-06-10T10:00:00Z',
    eventType: 'SECURITY',
    worker: 'Jordan Rivera', employeeId: 'ESI-10001',
    performedBy: 'Jordan Rivera', performedByRole: 'HRIS_ANALYST',
    businessProcess: '—',
    object: 'User Session', field: 'role_switch',
    oldValue: 'EMPLOYEE', newValue: 'HRIS_ANALYST',
    reason: 'Demo role switcher used',
    ipAddress: '192.168.1.101', sessionId: 'sess_r7Xk2',
  },
  {
    id: 'A010', timestamp: '2026-06-08T09:01:05Z',
    eventType: 'ELIGIBILITY',
    worker: 'Elena Vasquez', employeeId: 'ESI-10003',
    performedBy: 'HR Onboarding Bot', performedByRole: 'SYSTEM',
    businessProcess: 'Onboarding – Worker Creation',
    object: 'Worker', field: 'worker_status',
    oldValue: null, newValue: 'ACTIVE',
    reason: 'New worker record created on hire date',
    ipAddress: 'internal', sessionId: 'sys_onboard',
  },
  {
    id: 'A011', timestamp: '2026-06-01T00:01:00Z',
    eventType: 'SYSTEM',
    worker: '(all)', employeeId: '—',
    performedBy: 'SYSTEM', performedByRole: 'SYSTEM',
    businessProcess: 'Annual Accumulator Reset',
    object: 'Dental Accumulators', field: 'plan_year',
    oldValue: '2025', newValue: '2026',
    reason: 'Scheduled Jan 1 plan year rollover: deductible_used, annual_used reset to $0',
    ipAddress: 'internal', sessionId: 'sys_yr_rollover',
  },
  {
    id: 'A012', timestamp: '2026-05-15T14:10:22Z',
    eventType: 'DEPENDENT',
    worker: 'Marcus Webb', employeeId: 'ESI-10012',
    performedBy: 'Maria Santos', performedByRole: 'BENEFITS_PARTNER',
    businessProcess: 'Benefits Admin – Dependent Verification',
    object: 'Dependent', field: 'verification_status',
    oldValue: 'PENDING', newValue: 'VERIFIED',
    reason: 'Marriage certificate received and approved. Diana Webb verified as spouse.',
    ipAddress: '10.0.1.12', sessionId: 'sess_bP3Rq',
  },
]

const EVENT_CONFIG: Record<EventType, { label: string; color: string; dot: string }> = {
  ENROLLMENT:  { label: 'Enrollment',   color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  QLE:         { label: 'Life Event',   color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  DEPENDENT:   { label: 'Dependent',    color: 'bg-teal-100 text-teal-700',    dot: 'bg-teal-500' },
  ELIGIBILITY: { label: 'Eligibility',  color: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500' },
  PLAN_CHANGE: { label: 'Plan Change',  color: 'bg-rose-100 text-rose-700',    dot: 'bg-rose-500' },
  SYSTEM:      { label: 'System',       color: 'bg-slate-100 text-slate-600',  dot: 'bg-slate-400' },
  SECURITY:    { label: 'Security',     color: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
}

export function AuditLog() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<EventType | 'ALL'>('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = AUDIT_DATA.filter(entry => {
    const matchesType = typeFilter === 'ALL' || entry.eventType === typeFilter
    const matchesSearch = !search || [entry.worker, entry.employeeId, entry.object, entry.field, entry.newValue, entry.performedBy]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return matchesType && matchesSearch
  })

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Immutability notice */}
      <div className="flex items-center gap-2 bg-slate-800 text-slate-200 rounded-xl px-4 py-3">
        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
        <p className="text-xs">
          <strong className="text-white">Immutable audit trail.</strong> All records are append-only and cryptographically stamped.
          No entry can be modified or deleted after write. Retained 7 years per HIPAA/SOX requirements.
          Export available for compliance review.
        </p>
        <button className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors shrink-0">
          <Download className="w-3 h-3" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search worker, field, value..."
            className="bg-transparent text-xs flex-1 outline-none text-slate-700 placeholder-slate-400" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['ALL', ...Object.keys(EVENT_CONFIG)] as (EventType | 'ALL')[]).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn('text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors',
                typeFilter === t ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400')}>
              {t === 'ALL' ? `All (${AUDIT_DATA.length})` : EVENT_CONFIG[t as EventType].label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total events', value: AUDIT_DATA.length },
          { label: 'This month', value: AUDIT_DATA.filter(e => e.timestamp.startsWith('2026-06')).length },
          { label: 'System events', value: AUDIT_DATA.filter(e => e.performedBy === 'SYSTEM').length },
          { label: 'Manual changes', value: AUDIT_DATA.filter(e => e.performedBy !== 'SYSTEM').length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center">
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Log table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide">Timestamp</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide">Worker</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide">Object · Field</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide">Change</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide">Performed By</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => {
                const cfg = EVENT_CONFIG[entry.eventType]
                const isExpanded = expandedId === entry.id
                return (
                  <>
                    <tr key={entry.id}
                      className={cn('border-b border-slate-50 cursor-pointer transition-colors',
                        isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/60',
                        i % 2 === 0 ? '' : 'bg-slate-50/30')}
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}>
                      <td className="px-4 py-2.5">
                        <p className="text-[11px] font-mono text-slate-600">{entry.timestamp.replace('T', ' ').replace('Z', '')}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full', cfg.color)}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-medium text-slate-800">{entry.worker}</p>
                        <p className="text-[10px] text-slate-400">{entry.employeeId}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-medium text-slate-700">{entry.object}</p>
                        <p className="text-[10px] font-mono text-slate-400">{entry.field}</p>
                      </td>
                      <td className="px-4 py-2.5 max-w-[200px]">
                        {entry.oldValue !== null && (
                          <p className="text-[10px] text-red-500 line-through truncate">{entry.oldValue}</p>
                        )}
                        <p className="text-[11px] font-semibold text-emerald-700 truncate">{entry.newValue}</p>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-xs text-slate-700">{entry.performedBy}</p>
                        <p className="text-[10px] text-slate-400">{entry.performedByRole}</p>
                      </td>
                      <td className="pr-3">
                        {isExpanded
                          ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          : <ChevronDown className="w-3.5 h-3.5 text-slate-300" />}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${entry.id}-detail`} className="bg-slate-50 border-b border-slate-200">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2">
                              {entry.businessProcess && (
                                <div>
                                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Business Process</p>
                                  <p className="text-slate-700 font-medium">{entry.businessProcess}</p>
                                </div>
                              )}
                              {entry.reason && (
                                <div>
                                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Reason / Context</p>
                                  <p className="text-slate-700">{entry.reason}</p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Audit ID</p>
                                <p className="font-mono text-slate-600">{entry.id}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">IP Address · Session</p>
                                <p className="font-mono text-slate-600">{entry.ipAddress} · {entry.sessionId}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">No audit entries match the current filter</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-2 text-[11px] text-slate-400">
        <Info className="w-3 h-3 mt-0.5 shrink-0" />
        In Workday, the equivalent is the <strong className="text-slate-600">Business Process Audit</strong> report and the <strong className="text-slate-600">Business Object Change History</strong> report — available to Security Administrators and custom report writers with appropriate access.
      </div>
    </div>
  )
}
