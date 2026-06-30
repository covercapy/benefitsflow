'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Building2, Users, Heart, MapPin, Search, TrendingUp
} from 'lucide-react'

const ORGS = [
  {
    id: 'ESI', name: 'Ensign Services, Inc.', type: 'Service Center',
    state: 'CA', city: 'San Juan Capistrano', workers: 142,
    enrolled: 138, waived: 2, notStarted: 2, carrier: 'Cigna',
    enrollmentPct: 97, tier: 'CORPORATE',
    children: ['SPC', 'ECRC', 'CSVN', 'BCCC', 'CNC'],
  },
  {
    id: 'SPC', name: 'Sunrise Post-Acute Care', type: 'Skilled Nursing Facility',
    state: 'CA', city: 'Laguna Hills', workers: 89,
    enrolled: 74, waived: 8, notStarted: 7, carrier: 'Cigna',
    enrollmentPct: 83, tier: 'FACILITY',
    children: [],
  },
  {
    id: 'ECRC', name: 'Emerald Coast Rehabilitation', type: 'Rehabilitation Center',
    state: 'OR', city: 'Portland', workers: 54,
    enrolled: 49, waived: 3, notStarted: 2, carrier: 'Delta Dental',
    enrollmentPct: 91, tier: 'FACILITY',
    children: [],
  },
  {
    id: 'CSVN', name: 'Cascade Senior Living', type: 'Assisted Living',
    state: 'OR', city: 'Salem', workers: 67,
    enrolled: 55, waived: 9, notStarted: 3, carrier: 'Delta Dental',
    enrollmentPct: 82, tier: 'FACILITY',
    children: [],
  },
  {
    id: 'BCCC', name: 'Blue Ridge Care Center', type: 'Long-Term Care',
    state: 'ID', city: 'Boise', workers: 41,
    enrolled: 38, waived: 2, notStarted: 1, carrier: 'Delta Dental',
    enrollmentPct: 93, tier: 'FACILITY',
    children: [],
  },
  {
    id: 'CNC', name: 'Canyon View Nursing & Care', type: 'Skilled Nursing Facility',
    state: 'AZ', city: 'Phoenix', workers: 73,
    enrolled: 59, waived: 10, notStarted: 4, carrier: 'Cigna',
    enrollmentPct: 81, tier: 'FACILITY',
    children: [],
  },
]

const CARRIER_COLOR: Record<string, string> = {
  Cigna:         'bg-blue-100 text-blue-700',
  'Delta Dental': 'bg-teal-100 text-teal-700',
}

const TIER_COLOR: Record<string, string> = {
  CORPORATE: 'bg-amber-100 text-amber-700',
  FACILITY:  'bg-slate-100 text-slate-600',
}

export function OrganizationsView() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<typeof ORGS[0] | null>(null)

  const filtered = ORGS.filter(o =>
    !search || [o.name, o.city, o.state, o.carrier, o.type]
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
  )

  const totalWorkers = ORGS.reduce((s, o) => s + o.workers, 0)
  const totalEnrolled = ORGS.reduce((s, o) => s + o.enrolled, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total facilities', value: ORGS.length, icon: Building2, color: 'text-blue-600' },
          { label: 'Total workers', value: totalWorkers.toLocaleString(), icon: Users, color: 'text-slate-700' },
          { label: 'Enrolled in dental', value: totalEnrolled, icon: Heart, color: 'text-rose-500' },
          { label: 'Avg enrollment rate', value: `${Math.round(totalEnrolled / totalWorkers * 100)}%`, icon: TrendingUp, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
            <s.icon className={cn('w-5 h-5 mb-2', s.color)} />
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Org list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search org, city, state..."
              className="bg-transparent text-xs flex-1 outline-none text-slate-700 placeholder-slate-400" />
          </div>

          <div className="space-y-2">
            {filtered.map(org => {
              const pct = org.enrollmentPct
              const barColor = pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-amber-500' : 'bg-red-500'
              return (
                <button key={org.id} onClick={() => setSelected(org)}
                  className={cn('w-full text-left bg-white rounded-xl border-2 px-4 py-3 transition-all',
                    selected?.id === org.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300')}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">{org.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{org.type}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <span className={cn('text-[9px] font-bold px-1.5 rounded-full', TIER_COLOR[org.tier])}>{org.id}</span>
                      <span className={cn('text-[9px] font-bold px-1.5 rounded-full', CARRIER_COLOR[org.carrier])}>{org.carrier}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="text-[10px] text-slate-500">{org.city}, {org.state}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">{org.workers} workers</span>
                  </div>
                  {/* Enrollment bar */}
                  <div className="mt-2">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', barColor)} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between mt-0.5 text-[9px] text-slate-400">
                      <span>{org.enrolled} enrolled</span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Org detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <h2 className="text-base font-bold text-slate-900">{selected.name}</h2>
                    </div>
                    <p className="text-xs text-slate-500">{selected.type} · {selected.city}, {selected.state}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={cn('text-[10px] font-bold px-2 py-1 rounded-full', CARRIER_COLOR[selected.carrier])}>
                      {selected.carrier}
                    </span>
                    <span className={cn('text-[10px] font-bold px-2 py-1 rounded-full', TIER_COLOR[selected.tier])}>
                      {selected.tier}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total workers', value: selected.workers, color: 'text-slate-900' },
                    { label: 'Enrolled', value: selected.enrolled, color: 'text-emerald-700' },
                    { label: 'Not enrolled', value: selected.notStarted + selected.waived, color: selected.notStarted > 0 ? 'text-amber-700' : 'text-slate-400' },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-xl px-3 py-3 text-center">
                      <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enrollment breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400" /> Dental Enrollment Breakdown
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Active enrollment',  count: selected.enrolled,    pct: (selected.enrolled / selected.workers * 100), color: 'bg-emerald-500', badge: 'badge-active' },
                    { label: 'Waived coverage',    count: selected.waived,      pct: (selected.waived / selected.workers * 100),   color: 'bg-slate-300',  badge: 'badge-waived' },
                    { label: 'Not yet enrolled',   count: selected.notStarted,  pct: (selected.notStarted / selected.workers * 100), color: 'bg-amber-400', badge: 'badge-pending' },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full', row.badge)}>{row.label}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">{row.count} ({row.pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', row.color)} style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carrier assignment rule */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-xs font-semibold text-blue-900 mb-1">Carrier Assignment Rule</p>
                <p className="text-[11px] text-blue-800">
                  {selected.state === 'OR' || selected.state === 'ID' || selected.state === 'WA'
                    ? `Workers in ${selected.state} are auto-assigned to Delta Dental (group #19192) via the vw_worker_dental_carrier view. This applies to all ${selected.workers} workers at this facility.`
                    : `Workers in ${selected.state} are auto-assigned to Cigna (group #2499682) via the vw_worker_dental_carrier view. PPO and DHMO options both available.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
              <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Select an organization to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
