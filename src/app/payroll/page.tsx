'use client'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Info } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cn } from '@/lib/utils'

const EMPLOYEES = [
  { id: 'ESI-10001', name: 'Jordan Rivera',   title: 'HR Solutions Analyst',  dept: 'HR Technology',       org: 'Ensign Services',         manager: 'Maya Johnson',   status: 'Active' as const, type: 'Full Time' as const, hire: '2024-01-15', salary: 85000, pto: { used: 5,  balance: 15 } },
  { id: 'ESI-10004', name: 'Elena Vasquez',   title: 'Registered Nurse',       dept: 'Clinical Care',       org: 'Sunrise Post-Acute Care',  manager: 'Maya Johnson',   status: 'Active' as const, type: 'Full Time' as const, hire: '2026-06-01', salary: 72000, pto: { used: 0,  balance: 0  } },
  { id: 'ESI-10005', name: 'Marcus Williams', title: 'Registered Nurse',       dept: 'Clinical Care',       org: 'Sunrise Post-Acute Care',  manager: 'Maya Johnson',   status: 'Active' as const, type: 'Full Time' as const, hire: '2026-03-31', salary: 74000, pto: { used: 3,  balance: 17 } },
  { id: 'ESI-10006', name: 'Chris Patel',     title: 'Medical Technician',     dept: 'Clinical Support',    org: 'Sunrise Post-Acute Care',  manager: 'Maya Johnson',   status: 'Active' as const, type: 'Full Time' as const, hire: '2025-08-10', salary: 58000, pto: { used: 7,  balance: 13 } },
  { id: 'ESI-10007', name: 'Lisa Tran',       title: 'Care Coordinator',       dept: 'Patient Services',    org: 'Sunrise Post-Acute Care',  manager: 'Maya Johnson',   status: 'Active' as const, type: 'Part Time' as const, hire: '2025-03-22', salary: 42000, pto: { used: 2,  balance: 8  } },
  { id: 'ESI-10009', name: 'Maya Johnson',    title: 'Team Manager',           dept: 'Operations',          org: 'Sunrise Post-Acute Care',  manager: 'Nathan Song',    status: 'Active' as const, type: 'Full Time' as const, hire: '2022-07-11', salary: 105000, pto: { used: 8, balance: 12 } },
  { id: 'ESI-10000', name: 'Nathan Song',     title: 'HRIS Analyst',           dept: 'HR Technology',       org: 'Ensign Services',          manager: 'Morgan Walsh',   status: 'Active' as const, type: 'Full Time' as const, hire: '2023-04-03', salary: 92000, pto: { used: 6,  balance: 14 } },
  { id: 'ESI-10002', name: 'Taylor Chen',     title: 'Benefits Partner',       dept: 'Total Rewards',       org: 'Ensign Services',          manager: 'Morgan Walsh',   status: 'Active' as const, type: 'Full Time' as const, hire: '2024-09-16', salary: 78000, pto: { used: 4,  balance: 16 } },
] as const

type Tab = 'runs' | 'stubs' | 'deductions' | 'tax'

const PAY_RUNS = [
  { period: 'Jun 16–30, 2026', runDate: 'Jun 30, 2026', status: 'Processing', gross: 43250, deductions: 8640, net: 34610 },
  { period: 'Jun 1–15, 2026',  runDate: 'Jun 13, 2026', status: 'Completed',  gross: 43250, deductions: 8640, net: 34610 },
  { period: 'May 16–31, 2026', runDate: 'May 30, 2026', status: 'Completed',  gross: 43250, deductions: 8640, net: 34610 },
  { period: 'May 1–15, 2026',  runDate: 'May 13, 2026', status: 'Completed',  gross: 43250, deductions: 8640, net: 34610 },
  { period: 'Apr 16–30, 2026', runDate: 'Apr 30, 2026', status: 'Completed',  gross: 43250, deductions: 8640, net: 34610 },
  { period: 'Apr 1–15, 2026',  runDate: 'Apr 13, 2026', status: 'Completed',  gross: 43250, deductions: 8640, net: 34610 },
]

const STUB_EARNINGS = [
  { label: 'Regular Pay', hours: 80, rate: 40.87, amount: 3269.23 },
  { label: 'Overtime', hours: 0, rate: 0, amount: 0 },
]
const STUB_DEDUCTIONS = [
  { label: 'Federal Income Tax', amount: 489.23, type: 'tax' },
  { label: 'CA State Income Tax', amount: 163.46, type: 'tax' },
  { label: 'Social Security (6.2%)', amount: 202.69, type: 'tax' },
  { label: 'Medicare (1.45%)', amount: 47.40, type: 'tax' },
  { label: 'Health Insurance — Employee Share', amount: 150.00, type: 'benefit' },
  { label: 'Dental Insurance', amount: 18.00, type: 'benefit' },
  { label: '401(k) 4% Pre-Tax', amount: 130.77, type: 'retirement' },
]
const EMPLOYER_CONTRIB = [
  { label: 'Health Premium (employer share)', amount: 300.00 },
  { label: '401(k) Match (4%)', amount: 130.77 },
  { label: 'FICA Employer Match', amount: 250.09 },
]

const PIE_DATA = [
  { name: 'Federal/State Tax', value: 65, color: '#ef4444' },
  { name: 'Health', value: 15, color: '#3b82f6' },
  { name: 'Dental', value: 3, color: '#8b5cf6' },
  { name: '401(k)', value: 12, color: '#10b981' },
  { name: 'Other', value: 5, color: '#f59e0b' },
]

export default function PayrollPage() {
  const [tab, setTab] = useState<Tab>('runs')
  const [expandedRun, setExpandedRun] = useState<number | null>(null)
  const [stubEmployee, setStubEmployee] = useState('ESI-10001')

  const gross = STUB_EARNINGS.reduce((s, e) => s + e.amount, 0)
  const totalDed = STUB_DEDUCTIONS.reduce((s, d) => s + d.amount, 0)
  const netPay = gross - totalDed

  const tabs: { key: Tab; label: string }[] = [
    { key: 'runs', label: 'Pay Runs' },
    { key: 'stubs', label: 'Pay Stubs' },
    { key: 'deductions', label: 'Deductions Summary' },
    { key: 'tax', label: 'Tax Summary' },
  ]

  return (
    <AppShell pageTitle="Payroll" pageSubtitle="Pay runs, stubs, and compensation transparency">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Current Period', value: 'Jun 16–30', sub: 'Processing', color: 'text-amber-600' },
          { label: 'Gross (Period)', value: '$43,250', sub: '8 employees', color: 'text-slate-900' },
          { label: 'Total Deductions', value: '$8,640', sub: '20% of gross', color: 'text-red-600' },
          { label: 'Net Payout', value: '$34,610', sub: 'Direct deposit', color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={cn('px-5 py-3 text-sm font-medium transition-colors', tab === t.key ? 'border-b-2 border-violet-600 text-violet-700 bg-violet-50/50' : 'text-slate-500 hover:text-slate-700')}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Pay Runs */}
          {tab === 'runs' && (
            <div className="space-y-2">
              {PAY_RUNS.map((run, i) => (
                <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
                  <button onClick={() => setExpandedRun(expandedRun === i ? null : i)} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors text-left">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{run.period}</p>
                      <p className="text-xs text-slate-500">Run: {run.runDate}</p>
                    </div>
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', run.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{run.status}</span>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">${run.gross.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Net: ${run.net.toLocaleString()}</p>
                    </div>
                  </button>
                  {expandedRun === i && (
                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Employee Breakdown</p>
                      <div className="space-y-1">
                        {EMPLOYEES.slice(0,4).map(emp => (
                          <div key={emp.id} className="flex items-center gap-3 text-xs">
                            <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-[10px] shrink-0">{emp.name.split(' ').map(n=>n[0]).join('')}</div>
                            <span className="flex-1 text-slate-700">{emp.name}</span>
                            <span className="text-slate-500">Gross: ${(emp.salary/26).toFixed(2)}</span>
                            <span className="font-semibold text-slate-900">Net: ${((emp.salary/26)*0.8).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pay Stub */}
          {tab === 'stubs' && (
            <div>
              <div className="mb-4">
                <label className="text-xs text-slate-500 mb-1 block">Select Employee</label>
                <select value={stubEmployee} onChange={e => setStubEmployee(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white">
                  {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name} — {e.id}</option>)}
                </select>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-w-lg">
                <div className="bg-violet-600 text-white px-5 py-4">
                  <p className="font-bold text-lg">Pay Statement</p>
                  <p className="text-violet-200 text-sm">Pay Period: Jun 1–15, 2026 · Direct Deposit</p>
                  <p className="text-violet-200 text-sm">{EMPLOYEES.find(e=>e.id===stubEmployee)?.name} · {stubEmployee}</p>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Earnings</p>
                    {STUB_EARNINGS.map(e => (
                      <div key={e.label} className="flex justify-between text-sm py-1">
                        <span className="text-slate-600">{e.label}</span>
                        <span className="font-medium text-slate-900">${e.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-bold border-t border-slate-100 pt-1 mt-1">
                      <span>Gross Pay</span><span>${gross.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Deductions</p>
                    {STUB_DEDUCTIONS.map(d => (
                      <div key={d.label} className="flex justify-between text-sm py-1">
                        <span className="text-slate-600">{d.label}</span>
                        <span className={cn('font-medium', d.type==='benefit'?'text-blue-600':d.type==='retirement'?'text-emerald-600':'text-red-600')}>-${d.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-bold border-t border-slate-100 pt-1 mt-1 text-red-600">
                      <span>Total Deductions</span><span>-${totalDed.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex justify-between items-center">
                    <span className="font-bold text-emerald-800">Net Pay</span>
                    <span className="text-xl font-bold text-emerald-700">${netPay.toFixed(2)}</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-2"><Info className="w-4 h-4 text-blue-600" /><p className="text-xs font-bold text-blue-800">Employer also contributes on your behalf:</p></div>
                    {EMPLOYER_CONTRIB.map(c => (
                      <div key={c.label} className="flex justify-between text-xs text-blue-700 py-0.5">
                        <span>{c.label}</span><span className="font-semibold">${c.amount.toFixed(2)}/period</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deductions Summary */}
          {tab === 'deductions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-3">Team Deduction Breakdown (% of gross)</p>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                      {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-3">Per-period deduction amounts (per employee avg)</p>
                <div className="space-y-2">
                  {STUB_DEDUCTIONS.map(d => (
                    <div key={d.label} className="flex justify-between items-center text-sm py-2 border-b border-slate-100 last:border-0">
                      <span className="text-slate-600">{d.label}</span>
                      <span className="font-semibold text-slate-900">${d.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tax Summary */}
          {tab === 'tax' && (
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-3">YTD Tax Summary — Jordan Rivera (ESI-10001)</p>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-w-sm">
                {[
                  { label: 'Federal Income Tax', ytd: 6259.60, rate: '22%' },
                  { label: 'CA State Income Tax', ytd: 2092.30, rate: '6.3%' },
                  { label: 'Social Security', ytd: 2594.52, rate: '6.2%' },
                  { label: 'Medicare', ytd: 606.72, rate: '1.45%' },
                  { label: 'Total Taxes YTD', ytd: 11553.14, rate: '' },
                ].map((r, i, arr) => (
                  <div key={r.label} className={cn('flex items-center justify-between px-4 py-3', i === arr.length-1 ? 'bg-slate-50 font-bold border-t border-slate-200' : 'border-b border-slate-100')}>
                    <div>
                      <p className="text-sm text-slate-900">{r.label}</p>
                      {r.rate && <p className="text-xs text-slate-400">{r.rate} rate</p>}
                    </div>
                    <span className={cn('text-sm font-semibold', i === arr.length-1 ? 'text-red-600' : 'text-slate-900')}>${r.ytd.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">* YTD totals based on 13 pay periods (Jan 1 – Jun 30, 2026). Estimates only.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
