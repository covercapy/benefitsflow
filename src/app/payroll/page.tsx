'use client'
import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Info, Clock, Cloud, CloudOff, CheckCircle2 } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cn } from '@/lib/utils'

interface DbSession { id: string; worker_id: string; display_name: string; clock_in: string; clock_out: string | null; duration_minutes: number | null; pay_period: string }
interface WorkerSummary { worker_id: string; display_name: string; total_minutes: number; session_count: number }

const HOURLY_RATES: Record<string, number> = {
  'ESI-10000': 44.23,  // Nathan Song — $92k
  'ESI-10001': 40.87,  // Jordan Rivera — $85k
  'ESI-10002': 37.50,  // Taylor Chen — $78k
  'ESI-10004': 34.62,  // Elena Vasquez — $72k
  'ESI-10005': 35.58,  // Marcus Williams — $74k
  'ESI-10006': 27.88,  // Chris Patel — $58k
  'ESI-10007': 20.19,  // Lisa Tran — $42k part-time
  'ESI-10009': 50.48,  // Maya Johnson — $105k
}

function TimesheetsTab() {
  const [sessions, setSessions] = useState<DbSession[]>([])
  const [byWorker, setByWorker] = useState<WorkerSummary[]>([])
  const [payPeriod, setPayPeriod] = useState('')
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error' | 'empty'>('loading')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/time-sessions')
        const json = await res.json()
        if (json.error) { setStatus('error'); return }
        setSessions(json.sessions || [])
        setByWorker(json.by_worker || [])
        setPayPeriod(json.pay_period || '')
        setStatus(json.sessions?.length > 0 ? 'loaded' : 'empty')
      } catch {
        setStatus('error')
      }
    }
    load()
  }, [])

  const totalMinutes = byWorker.reduce((s, w) => s + w.total_minutes, 0)
  const totalWages = byWorker.reduce((s, w) => s + (w.total_minutes / 60) * (HOURLY_RATES[w.worker_id] || 35), 0)

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3 py-8 text-slate-400 text-sm">
        <div className="w-4 h-4 border-2 border-slate-300 border-t-violet-500 rounded-full animate-spin" />
        Loading timesheet data from Supabase…
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
        <CloudOff className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-800 text-sm">time_sessions table not found</p>
          <p className="text-amber-700 text-xs mt-1">Run the SQL migration in Supabase to enable time tracking:</p>
          <code className="block bg-amber-100 text-amber-900 text-xs rounded-lg px-3 py-2 mt-2 font-mono">supabase/migrations/20260630_time_sessions.sql</code>
          <p className="text-amber-600 text-xs mt-2">Once created, employees can clock in/out from the Time &amp; Attendance page and sessions will appear here.</p>
        </div>
      </div>
    )
  }

  if (status === 'empty') {
    return (
      <div className="text-center py-10 text-slate-400">
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium text-sm text-slate-500">No sessions this pay period</p>
        <p className="text-xs mt-1">Clock in from Time &amp; Attendance → sessions will appear here</p>
        {payPeriod && <p className="text-xs mt-2 text-violet-600 font-medium">Pay period: {payPeriod}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header with period info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Timesheets — Current Pay Period</p>
          {payPeriod && <p className="text-xs text-slate-400 mt-0.5">{payPeriod} · {sessions.filter(s => s.clock_out).length} completed sessions</p>}
        </div>
        <span className="flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-full">
          <Cloud className="w-3 h-3" />Live from Supabase
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Total Hours</p>
          <p className="text-xl font-bold text-slate-900">{(totalMinutes / 60).toFixed(1)}h</p>
          <p className="text-xs text-slate-400">{byWorker.length} workers</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Estimated Wages</p>
          <p className="text-xl font-bold text-emerald-700">${totalWages.toFixed(2)}</p>
          <p className="text-xs text-slate-400">based on hourly rates</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Sessions</p>
          <p className="text-xl font-bold text-slate-900">{sessions.length}</p>
          <p className="text-xs text-slate-400">{sessions.filter(s => !s.clock_out).length} still active</p>
        </div>
      </div>

      {/* Per-worker summary table */}
      {byWorker.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hours by Employee</p>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>{['Employee','Worker ID','Sessions','Hours','Hourly Rate','Est. Wages','Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-2">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {byWorker.map(w => {
                const hours = w.total_minutes / 60
                const rate = HOURLY_RATES[w.worker_id] || 35
                const wages = hours * rate
                const hasActive = sessions.some(s => s.worker_id === w.worker_id && !s.clock_out)
                return (
                  <tr key={w.worker_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{w.display_name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">{w.worker_id}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{w.session_count}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{hours.toFixed(2)}h</td>
                    <td className="px-4 py-3 text-sm text-slate-600">${rate.toFixed(2)}/hr</td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-700">${wages.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {hasActive
                        ? <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full animate-pulse">Active</span>
                        : <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Complete</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-sm font-bold text-slate-900">Total</td>
                <td className="px-4 py-3 text-sm font-bold text-slate-900">{(totalMinutes/60).toFixed(2)}h</td>
                <td className="px-4 py-3 text-sm font-bold text-emerald-700">${totalWages.toFixed(2)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Raw sessions detail */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">All Sessions</p>
          <span className="text-xs text-slate-400">{sessions.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>{['Employee','Date','Clock In','Clock Out','Duration','Pay Period'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-2">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map(s => {
                const inDate = new Date(s.clock_in)
                const outDate = s.clock_out ? new Date(s.clock_out) : null
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-900">{s.display_name}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{inDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-700">{inDate.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-700">
                      {outDate ? outDate.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true}) : <span className="text-emerald-600 font-bold">In Progress</span>}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-slate-900">
                      {s.duration_minutes != null ? `${Math.floor(s.duration_minutes/60)}h ${s.duration_minutes%60}m` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-400 font-mono">{s.pay_period}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit to payroll */}
      {submitted ? (
        <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" />Timesheets submitted to payroll run for {payPeriod}
        </div>
      ) : (
        <button onClick={() => setSubmitted(true)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
          <CheckCircle2 className="w-4 h-4" />Submit Timesheets to Payroll Run
        </button>
      )}
    </div>
  )
}

interface AttendanceRecord {
  id: string
  work_date: string
  worker_id: string
  display_name: string
  first_clock_in: string
  last_clock_out: string | null
  total_minutes: number
  shift_count: number
  pay_period: string
}

const ATTENDANCE_HOURLY_RATES: Record<string, number> = {
  'ESI-10000': 44.23,
  'ESI-10001': 40.87,
  'ESI-10002': 37.50,
  'ESI-10004': 34.62,
  'ESI-10005': 35.58,
  'ESI-10006': 27.88,
  'ESI-10007': 20.19,
  'ESI-10009': 50.48,
  'ESI-10010': 28.85,
}

function DailyAttendanceTab() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [payPeriod, setPayPeriod] = useState('')
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error' | 'empty'>('loading')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/attendance/daily?all=1')
        const json = await res.json()
        if (json.error) { setStatus('error'); return }
        setRecords(json.records || [])
        setPayPeriod(json.pay_period || '')
        setStatus(json.records?.length > 0 ? 'loaded' : 'empty')
      } catch {
        setStatus('error')
      }
    }
    load()
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3 py-8 text-slate-400 text-sm">
        <div className="w-4 h-4 border-2 border-slate-300 border-t-violet-500 rounded-full animate-spin" />
        Loading attendance records from Supabase…
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
        <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-800 text-sm">daily_attendance table not found</p>
          <p className="text-amber-700 text-xs mt-1">Run this in Supabase SQL Editor:</p>
          <code className="block bg-amber-100 text-amber-900 text-xs rounded-lg px-3 py-2 mt-2 font-mono">supabase/migrations/20260630_daily_attendance.sql</code>
          <p className="text-amber-600 text-xs mt-2">Clock-outs will populate this table automatically once the migration is applied.</p>
        </div>
      </div>
    )
  }

  if (status === 'empty') {
    return (
      <div className="text-center py-10 text-slate-400">
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium text-sm text-slate-500">No attendance records this pay period</p>
        <p className="text-xs mt-1">Complete a clock-in/clock-out cycle from Time &amp; Attendance — records appear here automatically</p>
        {payPeriod && <p className="text-xs mt-2 text-violet-600 font-medium">Pay period: {payPeriod}</p>}
      </div>
    )
  }

  // Group by date
  const byDate: Record<string, AttendanceRecord[]> = {}
  for (const r of records) {
    byDate[r.work_date] = byDate[r.work_date] || []
    byDate[r.work_date].push(r)
  }
  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a))

  const totalMinutes = records.reduce((s, r) => s + (r.total_minutes || 0), 0)
  const totalWages = records.reduce((s, r) => {
    const rate = ATTENDANCE_HOURLY_RATES[r.worker_id] || 35
    return s + (r.total_minutes / 60) * rate
  }, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Daily Attendance — Current Pay Period</p>
          {payPeriod && <p className="text-xs text-slate-400 mt-0.5">{payPeriod} · {records.length} records · {sortedDates.length} days</p>}
        </div>
        <span className="flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-full">
          <Cloud className="w-3 h-3" />Live from Supabase
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Days Worked</p>
          <p className="text-xl font-bold text-slate-900">{sortedDates.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Total Hours</p>
          <p className="text-xl font-bold text-slate-900">{(totalMinutes / 60).toFixed(1)}h</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Est. Wages</p>
          <p className="text-xl font-bold text-emerald-700">${totalWages.toFixed(2)}</p>
        </div>
      </div>

      {sortedDates.map(date => {
        const dayRecords = byDate[date]
        const dayMinutes = dayRecords.reduce((s, r) => s + (r.total_minutes || 0), 0)
        const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        return (
          <div key={date} className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700">{formattedDate}</p>
              <span className="text-xs text-slate-400">{(dayMinutes / 60).toFixed(1)}h total · {dayRecords.length} employees</span>
            </div>
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  {['Employee', 'Worker ID', 'Clock In', 'Clock Out', 'Hours', 'Hourly Rate', 'Est. Wages'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dayRecords.map(r => {
                  const rate = ATTENDANCE_HOURLY_RATES[r.worker_id] || 35
                  const wages = (r.total_minutes / 60) * rate
                  const clockIn = new Date(r.first_clock_in)
                  const clockOut = r.last_clock_out ? new Date(r.last_clock_out) : null
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-sm font-medium text-slate-900">{r.display_name}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">{r.worker_id}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-slate-700">{clockIn.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-slate-700">
                        {clockOut ? clockOut.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : <span className="text-emerald-600 font-semibold">Active</span>}
                      </td>
                      <td className="px-4 py-2.5 text-sm font-semibold text-slate-900">{(r.total_minutes / 60).toFixed(2)}h</td>
                      <td className="px-4 py-2.5 text-xs text-slate-600">${rate.toFixed(2)}/hr</td>
                      <td className="px-4 py-2.5 text-sm font-bold text-emerald-700">${wages.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

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

type Tab = 'runs' | 'stubs' | 'deductions' | 'tax' | 'timesheets' | 'attendance'

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
    { key: 'timesheets', label: '🕐 Timesheets' },
    { key: 'attendance', label: '📅 Daily Attendance' },
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

          {/* Timesheets */}
          {tab === 'timesheets' && <TimesheetsTab />}

          {/* Daily Attendance */}
          {tab === 'attendance' && <DailyAttendanceTab />}

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
