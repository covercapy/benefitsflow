'use client'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Search, ChevronRight, X, Edit, Building2, Calendar } from 'lucide-react'
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
type Employee = typeof EMPLOYEES[number]

type FilterType = 'All' | 'Full Time' | 'Part Time'

export default function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('All')
  const [selected, setSelected] = useState<Employee | null>(null)

  const filtered = EMPLOYEES.filter(e => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.title.toLowerCase().includes(search.toLowerCase()) || e.dept.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || e.type === filter
    return matchSearch && matchFilter
  })

  function tenure(hire: string) {
    const d = Math.floor((Date.now() - new Date(hire).getTime()) / 86400000)
    const yr = Math.floor(d/365); const mo = Math.floor((d%365)/30)
    if (yr === 0) return mo === 0 ? `${d}d` : `${mo}mo`
    return `${yr}yr ${mo}mo`
  }

  return (
    <AppShell pageTitle="Employee Directory" pageSubtitle="All workers across Ensign Services organizations">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Workers', value: 8 },
          { label: 'Active', value: 8 },
          { label: 'Full Time', value: 7 },
          { label: 'Part Time', value: 1 },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-5">
        {/* List */}
        <div className="flex-1 min-w-0">
          {/* Controls */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, title, or department..." className="bg-transparent text-sm text-slate-700 placeholder-slate-400 flex-1 outline-none" />
            </div>
            <div className="flex gap-1">
              {(['All', 'Full Time', 'Part Time'] as FilterType[]).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-2 rounded-lg text-xs font-medium transition-all', filter === f ? 'bg-violet-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50')}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(emp => (
              <button key={emp.id} onClick={() => setSelected(emp)} className={cn('text-left bg-white border rounded-xl p-4 hover:shadow-md transition-all', selected?.id === emp.id ? 'border-violet-400 ring-1 ring-violet-300' : 'border-slate-200')}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-sm font-bold text-violet-700 shrink-0">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm truncate">{emp.name}</p>
                    <p className="text-xs text-slate-500 truncate">{emp.title}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500"><Building2 className="w-3.5 h-3.5" />{emp.dept}</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500"><Calendar className="w-3.5 h-3.5" />Hired {new Date(emp.hire).toLocaleDateString('en-US',{month:'short',year:'numeric'})} · {tenure(emp.hire)}</div>
                </div>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">{emp.status}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{emp.type}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-72 shrink-0 bg-white border border-slate-200 rounded-xl p-5 h-fit sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Worker Profile</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center text-xl font-bold text-violet-700 mx-auto mb-4">
              {selected.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-center mb-4">
              <p className="font-bold text-slate-900">{selected.name}</p>
              <p className="text-sm text-slate-500">{selected.title}</p>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">{selected.status}</span>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ['Worker ID', selected.id],
                ['Department', selected.dept],
                ['Organization', selected.org],
                ['Manager', selected.manager],
                ['Type', selected.type],
                ['Hire Date', new Date(selected.hire).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})],
                ['Tenure', tenure(selected.hire)],
                ['Pay Grade', selected.salary >= 90000 ? 'Grade 9' : selected.salary >= 75000 ? 'Grade 7' : selected.salary >= 60000 ? 'Grade 6' : 'Grade 5'],
                ['PTO Balance', `${selected.pto.balance} days (${selected.pto.used} used)`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <span className="text-slate-500 shrink-0">{k}</span>
                  <span className="text-slate-900 font-medium text-right text-xs">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <button className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"><Edit className="w-3.5 h-3.5" />Edit Profile</button>
              <button className="w-full border border-slate-200 text-slate-600 text-xs font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors">View Full History</button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
