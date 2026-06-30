'use client'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Clock, Check, X, Plus, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const PTO_REQUESTS = [
  { employee: 'Jordan Rivera', type: 'PTO', dates: 'Jul 21–25, 2026', days: 5, status: 'Pending Approval' as const },
  { employee: 'Marcus Williams', type: 'PTO', dates: 'Jul 14–15, 2026', days: 2, status: 'Approved' as const },
  { employee: 'Maya Johnson', type: 'PTO', dates: 'Jun 30–Jul 2, 2026', days: 3, status: 'Approved' as const },
  { employee: 'Lisa Tran', type: 'Sick', dates: 'Jul 7, 2026', days: 1, status: 'Approved' as const },
  { employee: 'Chris Patel', type: 'PTO', dates: 'Aug 4–8, 2026', days: 5, status: 'Pending Approval' as const },
]

const CALENDAR_EVENTS: Record<number, { label: string; color: string }[]> = {
  4:  [{ label: '🇺🇸 Independence Day', color: 'bg-red-100 text-red-700' }],
  7:  [{ label: 'Lisa Tran — Sick', color: 'bg-yellow-100 text-yellow-700' }],
  14: [{ label: 'Marcus — PTO', color: 'bg-teal-100 text-teal-700' }],
  15: [{ label: 'Marcus — PTO', color: 'bg-teal-100 text-teal-700' }],
  21: [{ label: 'Jordan — PTO', color: 'bg-blue-100 text-blue-700' }],
  22: [{ label: 'Jordan — PTO', color: 'bg-blue-100 text-blue-700' }],
  23: [{ label: 'Jordan — PTO', color: 'bg-blue-100 text-blue-700' }],
  24: [{ label: 'Jordan — PTO', color: 'bg-blue-100 text-blue-700' }],
  25: [{ label: 'Jordan — PTO', color: 'bg-blue-100 text-blue-700' }],
  30: [{ label: 'Maya — PTO', color: 'bg-teal-100 text-teal-700' }],
  31: [{ label: 'Maya — PTO', color: 'bg-teal-100 text-teal-700' }],
}

export default function TimeOffPage() {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ from: '', to: '', type: 'PTO', notes: '' })
  const [submitted, setSubmitted] = useState(false)

  const statusColor = { 'Approved': 'bg-emerald-100 text-emerald-700', 'Pending Approval': 'bg-amber-100 text-amber-700', 'Denied': 'bg-red-100 text-red-700' }

  // July 2026: starts on Wednesday (day 3), 31 days
  const firstDay = 3
  const daysInMonth = 31
  const calCells = Array.from({ length: 6*7 }, (_, i) => {
    const day = i - firstDay + 1
    return day >= 1 && day <= daysInMonth ? day : null
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => { setShowModal(false); setSubmitted(false); setForm({ from:'',to:'',type:'PTO',notes:'' }) }, 1500)
  }

  return (
    <AppShell pageTitle="Time Off" pageSubtitle="PTO management, requests, and team calendar">
      <div className="space-y-5">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-900">PTO Balance</p>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">15 <span className="text-base font-normal text-slate-500">days</span></p>
            <div className="mt-2 space-y-1 text-xs text-slate-500">
              <div className="flex justify-between"><span>Used YTD</span><span className="font-medium">5 days</span></div>
              <div className="flex justify-between"><span>Accrued YTD</span><span className="font-medium">20 days</span></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-900">Sick Leave</p>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-amber-600">5 <span className="text-base font-normal text-slate-500">days</span></p>
            <div className="mt-2 text-xs text-slate-500">
              <div className="flex justify-between"><span>Used YTD</span><span className="font-medium">3 days</span></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-900">Holidays Remaining</p>
              <Calendar className="w-4 h-4 text-violet-500" />
            </div>
            <p className="text-3xl font-bold text-violet-600">6 <span className="text-base font-normal text-slate-500">days</span></p>
            <div className="mt-2 text-xs text-slate-500 space-y-0.5">
              <p>Jul 4 · Independence Day</p>
              <p>Sep 1 · Labor Day</p>
              <p>Nov 27 · Thanksgiving</p>
              <p>+ 3 more</p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Team Calendar — July 2026</h3>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Request Time Off
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-slate-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calCells.map((day, i) => (
              <div key={i} className={cn('min-h-[60px] rounded-lg p-1 text-xs', day ? 'bg-slate-50 hover:bg-slate-100' : '')}>
                {day && (
                  <>
                    <p className={cn('text-xs font-semibold mb-1', day === 4 ? 'text-red-600' : 'text-slate-600')}>{day}</p>
                    {(CALENDAR_EVENTS[day] || []).map((ev, j) => (
                      <span key={j} className={cn('block text-[9px] rounded px-1 py-0.5 mb-0.5 leading-tight truncate', ev.color)}>{ev.label}</span>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 flex-wrap text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-teal-200 rounded-sm inline-block" />PTO</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-200 rounded-sm inline-block" />My PTO</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-200 rounded-sm inline-block" />Sick</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-200 rounded-sm inline-block" />Holiday</span>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm">Recent Requests</h3>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>{['Employee','Type','Dates','Days','Status'].map(h=><th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-2">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PTO_REQUESTS.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{r.employee}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{r.type}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{r.dates}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{r.days}</td>
                  <td className="px-4 py-3"><span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', statusColor[r.status])}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Request Time Off</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3"><Check className="w-6 h-6 text-emerald-600" /></div>
                <p className="font-semibold text-slate-900">Request submitted!</p>
                <p className="text-sm text-slate-500 mt-1">Pending manager approval</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-slate-500 block mb-1">From</label><input type="date" value={form.from} onChange={e=>setForm({...form,from:e.target.value})} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700" /></div>
                  <div><label className="text-xs text-slate-500 block mb-1">To</label><input type="date" value={form.to} onChange={e=>setForm({...form,to:e.target.value})} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700" /></div>
                </div>
                <div><label className="text-xs text-slate-500 block mb-1">Type</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"><option>PTO</option><option>Sick</option><option>Personal</option></select></div>
                <div><label className="text-xs text-slate-500 block mb-1">Notes (optional)</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 resize-none" placeholder="Optional notes for your manager..." /></div>
                <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors">Submit Request</button>
              </form>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}
