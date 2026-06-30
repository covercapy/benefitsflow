'use client'
import { AppShell } from '@/components/layout/AppShell'
import { cn } from '@/lib/utils'

interface CalEvent { label: string; color: string; time?: string }
const EVENTS: Record<number, CalEvent[]> = {
  4:  [{ label: 'Independence Day', color: 'bg-red-100 text-red-700' }],
  7:  [{ label: 'Lisa Tran — Sick', color: 'bg-yellow-100 text-yellow-700' }],
  10: [{ label: 'Enrollment Reminder', color: 'bg-blue-100 text-blue-700', time: '9am' }],
  14: [{ label: 'Marcus — PTO', color: 'bg-teal-100 text-teal-700' }],
  15: [{ label: 'Marcus — PTO', color: 'bg-teal-100 text-teal-700' }, { label: 'Payroll Run', color: 'bg-violet-100 text-violet-700', time: '2pm' }],
  21: [{ label: 'Jordan — PTO', color: 'bg-sky-100 text-sky-700' }, { label: 'Q3 HR Review', color: 'bg-orange-100 text-orange-700', time: '10am' }],
  22: [{ label: 'Jordan — PTO', color: 'bg-sky-100 text-sky-700' }],
  23: [{ label: 'Jordan — PTO', color: 'bg-sky-100 text-sky-700' }],
  24: [{ label: 'Jordan — PTO', color: 'bg-sky-100 text-sky-700' }],
  25: [{ label: 'Jordan — PTO', color: 'bg-sky-100 text-sky-700' }],
  28: [{ label: 'Benefits Q3 Audit', color: 'bg-blue-100 text-blue-700', time: '1pm' }],
  30: [{ label: 'Maya — PTO', color: 'bg-teal-100 text-teal-700' }],
  31: [{ label: 'Month End Close', color: 'bg-slate-100 text-slate-600', time: 'EOD' }],
}

const UPCOMING = [
  { day: 4,  label: 'Independence Day (Holiday)', color: 'bg-red-100 text-red-700' },
  { day: 10, label: 'Open Enrollment Reminder', color: 'bg-blue-100 text-blue-700' },
  { day: 14, label: 'Marcus Williams — PTO starts', color: 'bg-teal-100 text-teal-700' },
  { day: 15, label: 'Payroll Run — Jun 16-30', color: 'bg-violet-100 text-violet-700' },
  { day: 21, label: 'Quarterly HR Review', color: 'bg-orange-100 text-orange-700' },
]

export default function CalendarPage() {
  const firstDay = 3 // July 1 2026 is Wednesday
  const daysInMonth = 31
  const calCells = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1
    return (day >= 1 && day <= daysInMonth) ? day : null
  })

  return (
    <AppShell pageTitle="Calendar" pageSubtitle="Company events, HR milestones, and team schedule — July 2026">
      <div className="flex gap-5">
        {/* Calendar */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">July 2026</h2>
            <div className="flex gap-2 text-xs text-slate-400">
              <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50">← Jun</button>
              <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50">Aug →</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-slate-400 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calCells.map((day, i) => (
              <div key={i} className={cn('min-h-[80px] rounded-lg p-1.5 border', day ? 'border-slate-100 bg-white hover:bg-slate-50' : 'border-transparent')}>
                {day && (
                  <>
                    <p className={cn('text-xs font-bold mb-1', day === 4 ? 'text-red-500' : 'text-slate-700')}>{day}</p>
                    {(EVENTS[day] || []).map((ev, j) => (
                      <div key={j} className={cn('text-[9px] leading-tight rounded px-1 py-0.5 mb-0.5 truncate', ev.color)}>
                        {ev.time && <span className="font-bold">{ev.time} </span>}{ev.label}
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex gap-3 mt-4 flex-wrap text-xs text-slate-500">
            {[
              { label: 'Holiday', cls: 'bg-red-200' },
              { label: 'PTO/Leave', cls: 'bg-teal-200' },
              { label: 'My PTO', cls: 'bg-sky-200' },
              { label: 'Payroll', cls: 'bg-violet-200' },
              { label: 'Benefits', cls: 'bg-blue-200' },
              { label: 'HR Events', cls: 'bg-orange-200' },
            ].map(l => <span key={l.label} className="flex items-center gap-1"><span className={cn('w-3 h-3 rounded-sm inline-block', l.cls)}/>{l.label}</span>)}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Upcoming Events</h3>
            <div className="space-y-2">
              {UPCOMING.map((ev, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">Jul {ev.day}</div>
                  <span className={cn('text-xs px-2 py-1 rounded-lg flex-1 leading-tight', ev.color)}>{ev.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
            <p className="text-xs font-bold text-violet-800 mb-1">Benefits Milestone</p>
            <p className="text-xs text-violet-700">Marcus Williams&apos; enrollment window closes <strong>Jul 29</strong>. 29 days remaining.</p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
