'use client'

import { useEffect, useState } from 'react'
import { cn, formatCurrency } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts'
import { Download, TrendingUp, AlertTriangle, CheckCircle2, FileText, Users, Stethoscope, DollarSign } from 'lucide-react'

type ReportTab = 'enrollment' | 'accumulators' | 'carrier' | 'export'

// ── Seed / mock data ────────────────────────────────────────
const ENROLLMENT_BY_ORG = [
  { org: 'HR Tech Team', eligible: 3, enrolled: 3, waived: 0, notStarted: 0 },
  { org: 'Sunrise SJC', eligible: 8, enrolled: 5, waived: 0, notStarted: 3 },
  { org: 'Emerald Portland', eligible: 3, enrolled: 2, waived: 0, notStarted: 1 },
  { org: 'Blue Ridge Boise', eligible: 3, enrolled: 2, waived: 0, notStarted: 1 },
  { org: 'Canyon View AZ', eligible: 4, enrolled: 2, waived: 1, notStarted: 1 },
  { org: 'Lakewood Denver', eligible: 2, enrolled: 2, waived: 0, notStarted: 0 },
]

const ENROLLMENT_TREND = [
  { week: 'Wk 1', enrolled: 2, cumulative: 2 },
  { week: 'Wk 2', enrolled: 4, cumulative: 6 },
  { week: 'Wk 3', enrolled: 5, cumulative: 11 },
  { week: 'Wk 4', enrolled: 3, cumulative: 14 },
  { week: 'Wk 5', enrolled: 2, cumulative: 16 },
]

const PLAN_DISTRIBUTION = [
  { name: 'Cigna PPO', value: 8, color: '#2563eb' },
  { name: 'Delta Dental PPO', value: 6, color: '#0891b2' },
  { name: 'Cigna DHMO', value: 2, color: '#10b981' },
  { name: 'Waived', value: 1, color: '#6b7280' },
  { name: 'Not Started', value: 3, color: '#f59e0b' },
]

const ACCUMULATORS = [
  { name: 'Jordan Rivera', plan: 'Cigna PPO', deductibleUsed: 50, deductibleMax: 50, annualUsed: 847.50, annualMax: 1500, orthoUsed: 0, orthoMax: 1500 },
  { name: 'Morgan Walsh', plan: 'Cigna PPO', deductibleUsed: 50, deductibleMax: 50, annualUsed: 285.00, annualMax: 1500, orthoUsed: 0, orthoMax: 1500 },
  { name: 'Elena Vasquez', plan: 'Cigna PPO', deductibleUsed: 50, deductibleMax: 50, annualUsed: 1500.00, annualMax: 1500, orthoUsed: 750, orthoMax: 1500 },
  { name: 'Robert Johnson', plan: 'Delta Dental PPO', deductibleUsed: 50, deductibleMax: 50, annualUsed: 680.00, annualMax: 1500, orthoUsed: 0, orthoMax: 1500 },
  { name: 'Aisha Montgomery', plan: 'Delta Dental PPO', deductibleUsed: 0, deductibleMax: 50, annualUsed: 0, annualMax: 1500, orthoUsed: 0, orthoMax: 1500 },
  { name: 'Taylor Chen', plan: 'Cigna DHMO', deductibleUsed: 0, deductibleMax: 0, annualUsed: 15, annualMax: 0, orthoUsed: 0, orthoMax: 0 },
]

const CARRIER_EXPORT = [
  { carrier: 'Cigna Dental', exportDate: '2026-06-30', records: 10, accepted: 9, rejected: 1, status: 'PARTIAL' },
  { carrier: 'Delta Dental', exportDate: '2026-06-30', records: 6, accepted: 6, rejected: 0, status: 'ACCEPTED' },
]

const CARRIER_EXPORT_DETAIL = [
  { worker: 'Jordan Rivera', id: 'ESI-10001', plan: 'Cigna PPO', tier: 'EF', effectiveDate: '2026-07-01', status: 'ACCEPTED', error: '' },
  { worker: 'Taylor Chen', id: 'ESI-10002', plan: 'Cigna DHMO', tier: 'EO', effectiveDate: '2026-06-01', status: 'ACCEPTED', error: '' },
  { worker: 'Elena Vasquez', id: 'ESI-10004', plan: 'Cigna PPO', tier: 'EF', effectiveDate: '2026-07-01', status: 'REJECTED', error: 'Dependent SSN missing — resubmit required' },
  { worker: 'Marcus Williams', id: 'ESI-10005', plan: 'Cigna PPO', tier: 'EO', effectiveDate: '2026-06-01', status: 'ACCEPTED', error: '' },
  { worker: 'Aisha Montgomery', id: 'ESI-10011', plan: 'Delta Dental PPO', tier: 'EO', effectiveDate: '2026-06-01', status: 'ACCEPTED', error: '' },
  { worker: 'Robert Johnson', id: 'ESI-10014', plan: 'Delta Dental PPO', tier: 'ES', effectiveDate: '2026-04-01', status: 'ACCEPTED', error: '' },
  { worker: 'Miguel Santos', id: 'ESI-10018', plan: 'Cigna DHMO', tier: 'EF', effectiveDate: '2026-06-01', status: 'ACCEPTED', error: '' },
]

// ── Component ────────────────────────────────────────────────
export function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState<ReportTab>('enrollment')
  const [enrollmentData, setEnrollmentData] = useState(ENROLLMENT_BY_ORG)
  const [planData, setPlanData] = useState(PLAN_DISTRIBUTION)
  const [accumulatorData, setAccumulatorData] = useState(ACCUMULATORS)

  useEffect(() => {
    fetch('/api/reports/overview', { cache: 'no-store' })
      .then(async response => response.ok ? response.json() : Promise.reject())
      .then(data => {
        setEnrollmentData(data.enrollmentByOrg)
        setPlanData(data.planDistribution)
        setAccumulatorData(data.accumulators)
      })
      .catch(() => {})
  }, [])

  const totalEligible = enrollmentData.reduce((s, r) => s + r.eligible, 0)
  const totalEnrolled = enrollmentData.reduce((s, r) => s + r.enrolled, 0)
  const totalWaived = enrollmentData.reduce((s, r) => s + r.waived, 0)
  const totalNotStarted = enrollmentData.reduce((s, r) => s + r.notStarted, 0)
  const enrollmentRate = Math.round((totalEnrolled / totalEligible) * 100)

  const TABS: { id: ReportTab; label: string; icon: React.ElementType }[] = [
    { id: 'enrollment', label: 'Enrollment Completion', icon: TrendingUp },
    { id: 'accumulators', label: 'Dental Accumulators', icon: DollarSign },
    { id: 'carrier', label: 'Carrier Export Audit', icon: FileText },
    { id: 'export', label: 'Waiver Report', icon: Users },
  ]

  return (
    <div className="space-y-5">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Eligible', value: totalEligible, sub: 'Active workers', color: 'blue', icon: Users },
          { label: 'Dental Enrolled', value: `${totalEnrolled} (${enrollmentRate}%)`, sub: 'of eligible workers', color: 'emerald', icon: Stethoscope },
          { label: 'Waived', value: totalWaived, sub: 'No dental coverage', color: 'slate', icon: AlertTriangle },
          { label: 'Not Started', value: totalNotStarted, sub: 'Action required', color: 'amber', icon: AlertTriangle },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', {
                'bg-blue-50 text-blue-600': k.color === 'blue',
                'bg-emerald-50 text-emerald-600': k.color === 'emerald',
                'bg-amber-50 text-amber-600': k.color === 'amber',
                'bg-slate-50 text-slate-500': k.color === 'slate',
              })}>
                <k.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-500">{k.label}</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{k.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center',
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'enrollment' && <EnrollmentTab data={enrollmentData} trend={ENROLLMENT_TREND} planDist={planData} />}
      {activeTab === 'accumulators' && <AccumulatorsTab data={accumulatorData} />}
      {activeTab === 'carrier' && <CarrierExportTab summary={CARRIER_EXPORT} detail={CARRIER_EXPORT_DETAIL} />}
      {activeTab === 'export' && <WaiverReportTab />}
    </div>
  )
}

// ── Enrollment Tab ──────────────────────────────────────────
function EnrollmentTab({ data, trend, planDist }: { data: typeof ENROLLMENT_BY_ORG, trend: typeof ENROLLMENT_TREND, planDist: typeof PLAN_DISTRIBUTION }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* By org */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Enrollment by Organization</h3>
            <ExportBtn label="CSV" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="org" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="enrolled" name="Enrolled" fill="#2563eb" radius={[3,3,0,0]} stackId="a" />
              <Bar dataKey="waived" name="Waived" fill="#6b7280" radius={[0,0,0,0]} stackId="a" />
              <Bar dataKey="notStarted" name="Not Started" fill="#f59e0b" radius={[3,3,0,0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Plan distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={planDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {planDist.map((p, i) => <Cell key={i} fill={p.color} />)}
              </Pie>
              <Tooltip formatter={v => `${v} workers`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enrollment trend */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Cumulative Enrollment Trend – 2026</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="cumulative" name="Cumulative Enrolled" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="enrolled" name="New This Week" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table drill-down */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Enrollment Completion by Organization</h3>
          <ExportBtn label="Export" />
        </div>
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Organization</th>
              <th className="text-right">Eligible</th>
              <th className="text-right">Enrolled</th>
              <th className="text-right">Waived</th>
              <th className="text-right">Not Started</th>
              <th className="text-right">Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const rate = Math.round((row.enrolled / row.eligible) * 100)
              return (
                <tr key={i}>
                  <td className="font-medium text-slate-800">{row.org}</td>
                  <td className="text-right text-slate-600">{row.eligible}</td>
                  <td className="text-right text-emerald-700 font-medium">{row.enrolled}</td>
                  <td className="text-right text-slate-500">{row.waived}</td>
                  <td className="text-right text-amber-600 font-medium">{row.notStarted}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${rate}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 w-8 text-right">{rate}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-semibold">
              <td className="px-4 py-2.5 text-sm">Total</td>
              <td className="px-4 py-2.5 text-sm text-right">{data.reduce((s,r)=>s+r.eligible,0)}</td>
              <td className="px-4 py-2.5 text-sm text-right text-emerald-700">{data.reduce((s,r)=>s+r.enrolled,0)}</td>
              <td className="px-4 py-2.5 text-sm text-right">{data.reduce((s,r)=>s+r.waived,0)}</td>
              <td className="px-4 py-2.5 text-sm text-right text-amber-600">{data.reduce((s,r)=>s+r.notStarted,0)}</td>
              <td className="px-4 py-2.5 text-sm text-right font-bold text-blue-700">
                {Math.round(data.reduce((s,r)=>s+r.enrolled,0)/data.reduce((s,r)=>s+r.eligible,0)*100)}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ── Accumulators Tab ─────────────────────────────────────────
function AccumulatorsTab({ data }: { data: typeof ACCUMULATORS }) {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
        <strong>Calculated field report.</strong> Deductible remaining, annual max remaining, and ortho lifetime remaining are computed from the <code>vw_dental_accumulators</code> view — the same pattern as Workday calculated fields on benefit plans.
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">2026 Dental Accumulator Report</h3>
          <ExportBtn label="Export" />
        </div>
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Worker</th>
              <th>Plan</th>
              <th className="text-right">Deductible Used</th>
              <th className="text-right">Deductible Met?</th>
              <th className="text-right">Annual Used</th>
              <th className="text-right">Annual Remaining</th>
              <th className="text-right">Ortho Used</th>
              <th className="text-right">Ortho Remaining</th>
            </tr>
          </thead>
          <tbody>
            {data.map((w, i) => {
              const deductibleMet = w.deductibleUsed >= w.deductibleMax
              const annualRemaining = w.annualMax === 0 ? null : w.annualMax - w.annualUsed
              const orthoRemaining = w.orthoMax === 0 ? null : w.orthoMax - w.orthoUsed
              const annualPct = w.annualMax === 0 ? 0 : (w.annualUsed / w.annualMax) * 100
              const orthoPct = w.orthoMax === 0 ? 0 : (w.orthoUsed / w.orthoMax) * 100

              return (
                <tr key={i}>
                  <td className="font-medium text-slate-800">{w.name}</td>
                  <td className="text-slate-500 text-xs">{w.plan}</td>
                  <td className="text-right text-slate-700">
                    {w.deductibleMax === 0 ? '—' : `$${w.deductibleUsed} / $${w.deductibleMax}`}
                  </td>
                  <td className="text-right">
                    {w.deductibleMax === 0 ? '—' : (
                      <span className={cn('text-xs font-semibold', deductibleMet ? 'text-emerald-600' : 'text-amber-600')}>
                        {deductibleMet ? '✓ Met' : 'No'}
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    <div>
                      <span className="text-slate-700">${w.annualUsed.toFixed(0)}</span>
                      {w.annualMax > 0 && (
                        <div className="accumulator-bar w-20 ml-auto mt-1">
                          <div className={cn('accumulator-bar-fill', annualPct >= 95 ? 'bg-red-500' : annualPct >= 70 ? 'bg-amber-500' : 'bg-blue-500')}
                            style={{ width: `${Math.min(100, annualPct)}%` }} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-right font-semibold">
                    {annualRemaining === null ? <span className="text-teal-600">Unlimited</span> :
                     annualRemaining === 0 ? <span className="text-red-600">$0 — MAX REACHED</span> :
                     <span className={annualRemaining < 300 ? 'text-amber-600' : 'text-slate-700'}>${annualRemaining.toFixed(0)}</span>}
                  </td>
                  <td className="text-right text-slate-700">
                    {w.orthoMax === 0 ? '—' : (
                      <div>
                        ${w.orthoUsed.toFixed(0)}
                        <div className="accumulator-bar w-16 ml-auto mt-1">
                          <div className="accumulator-bar-fill bg-violet-500" style={{ width: `${Math.min(100, orthoPct)}%` }} />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="text-right font-semibold">
                    {orthoRemaining === null ? '—' :
                     orthoRemaining === 0 ? <span className="text-red-600">$0 — LIFETIME MAX</span> :
                     <span className="text-slate-700">${orthoRemaining.toFixed(0)}</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-800">
        <strong>Note:</strong> Elena Vasquez has hit her $1,500 annual maximum and used $750 of the $1,500 orthodontia lifetime maximum (child Carlos, braces in progress).
        Her deductible is also fully met. These fields would trigger a real-time alert in the Benefits Partner dashboard.
      </div>
    </div>
  )
}

// ── Carrier Export Tab ───────────────────────────────────────
function CarrierExportTab({ summary, detail }: { summary: typeof CARRIER_EXPORT, detail: typeof CARRIER_EXPORT_DETAIL }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {summary.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{s.carrier}</p>
                <p className="text-xs text-slate-400">Export: {s.exportDate}</p>
              </div>
              <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border',
                s.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200')}>
                {s.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-slate-900">{s.records}</p>
                <p className="text-[10px] text-slate-400">Records Sent</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-600">{s.accepted}</p>
                <p className="text-[10px] text-slate-400">Accepted</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600">{s.rejected}</p>
                <p className="text-[10px] text-slate-400">Rejected</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Export Line Detail</h3>
          <ExportBtn label="Resubmit Rejected" danger />
        </div>
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Worker</th>
              <th>Plan</th>
              <th>Tier</th>
              <th>Effective</th>
              <th>Status</th>
              <th>Error / Notes</th>
            </tr>
          </thead>
          <tbody>
            {detail.map((r, i) => (
              <tr key={i}>
                <td>
                  <p className="font-medium text-slate-800 text-sm">{r.worker}</p>
                  <p className="text-xs text-slate-400">{r.id}</p>
                </td>
                <td className="text-sm text-slate-600">{r.plan}</td>
                <td className="text-sm text-slate-600">{r.tier}</td>
                <td className="text-sm text-slate-600">{r.effectiveDate}</td>
                <td>
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border',
                    r.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200')}>
                    {r.status}
                  </span>
                </td>
                <td className={cn('text-xs', r.error ? 'text-red-700 font-medium' : 'text-slate-400')}>
                  {r.error || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Waiver Report Tab ────────────────────────────────────────
function WaiverReportTab() {
  const waivers = [
    { name: 'Angela Davis', id: 'ESI-10017', org: 'Canyon View Nursing – Phoenix', state: 'AZ', waivedDate: '2026-05-31', reason: 'Has coverage through spouse', hireDate: '2026-05-01' },
  ]
  const notStarted = [
    { name: 'Carmen Lopez', id: 'ESI-10008', org: 'Sunrise Post-Acute Care – SJC', state: 'CA', deadline: '2026-07-01', daysLeft: 1 },
    { name: 'James Patterson', id: 'ESI-10009', org: 'Sunrise Post-Acute Care – SJC', state: 'CA', deadline: '2026-07-15', daysLeft: 15 },
    { name: 'Yuki Tanaka', id: 'ESI-10013', org: 'Emerald Coast Rehabilitation', state: 'OR', deadline: '2026-07-10', daysLeft: 10 },
  ]

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Dental Waivers</h3>
          <ExportBtn label="Export" />
        </div>
        <table className="w-full data-table">
          <thead><tr><th>Worker</th><th>Organization</th><th>Waived Date</th><th>Reason</th></tr></thead>
          <tbody>
            {waivers.map((w, i) => (
              <tr key={i}>
                <td><p className="font-medium text-slate-800">{w.name}</p><p className="text-xs text-slate-400">{w.id}</p></td>
                <td className="text-sm text-slate-600">{w.org}</td>
                <td className="text-sm text-slate-600">{w.waivedDate}</td>
                <td className="text-sm text-slate-500">{w.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Not Started — Action Required</h3>
          <span className="text-xs text-red-600 font-semibold">{notStarted.length} workers at risk</span>
        </div>
        <table className="w-full data-table">
          <thead><tr><th>Worker</th><th>Organization</th><th>Deadline</th><th>Days Left</th></tr></thead>
          <tbody>
            {notStarted.map((w, i) => (
              <tr key={i}>
                <td><p className="font-medium text-slate-800">{w.name}</p><p className="text-xs text-slate-400">{w.id}</p></td>
                <td className="text-sm text-slate-600">{w.org}</td>
                <td className="text-sm text-slate-600">{w.deadline}</td>
                <td>
                  <span className={cn('text-xs font-bold', w.daysLeft <= 3 ? 'text-red-600' : 'text-amber-600')}>
                    {w.daysLeft}d remaining
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ExportBtn({ label, danger }: { label: string, danger?: boolean }) {
  return (
    <button className={cn('flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
      danger ? 'border-red-200 text-red-700 hover:bg-red-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}>
      <Download className="w-3 h-3" /> {label}
    </button>
  )
}
