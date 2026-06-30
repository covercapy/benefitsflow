'use client'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { cn } from '@/lib/utils'
import { X, Plus, StickyNote, Check, Trash2, Clock } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface CalNote { id: string; text: string; color: string; time: string }
interface DayModal { day: number; notes: CalNote[] }

type EventColor = 'bg-red-100 text-red-700' | 'bg-yellow-100 text-yellow-700' | 'bg-teal-100 text-teal-700' |
  'bg-sky-100 text-sky-700' | 'bg-violet-100 text-violet-700' | 'bg-blue-100 text-blue-700' |
  'bg-orange-100 text-orange-700' | 'bg-slate-100 text-slate-600'

interface CalEvent { label: string; color: EventColor; time?: string }

// ─── Seed events ──────────────────────────────────────────────────────────────
const SEED_EVENTS: Record<number, CalEvent[]> = {
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

const UPCOMING_STATIC = [
  { day: 4,  label: 'Independence Day (Holiday)', color: 'bg-red-100 text-red-700' },
  { day: 10, label: 'Open Enrollment Reminder',   color: 'bg-blue-100 text-blue-700' },
  { day: 14, label: 'Marcus Williams — PTO',       color: 'bg-teal-100 text-teal-700' },
  { day: 15, label: 'Payroll Run — Jun 16-30',     color: 'bg-violet-100 text-violet-700' },
  { day: 21, label: 'Q3 HR Review',                color: 'bg-orange-100 text-orange-700' },
]

const NOTE_COLORS = [
  { cls: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-400', label: 'Yellow' },
  { cls: 'bg-blue-100 text-blue-800 border-blue-200',       dot: 'bg-blue-400',   label: 'Blue' },
  { cls: 'bg-violet-100 text-violet-800 border-violet-200', dot: 'bg-violet-400', label: 'Purple' },
  { cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-400', label: 'Green' },
  { cls: 'bg-rose-100 text-rose-800 border-rose-200',       dot: 'bg-rose-400',   label: 'Red' },
]

function fmtNow() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function ordinal(n: number) {
  const s = ['th','st','nd','rd']; const v = n % 100
  return n + (s[(v-20)%10] || s[v] || s[0])
}

// ─── Day Modal ────────────────────────────────────────────────────────────────
interface DayPanelProps {
  modal: DayModal
  events: CalEvent[]
  onClose: () => void
  onAddNote: (note: CalNote) => void
  onDeleteNote: (id: string) => void
}

function DayPanel({ modal, events, onClose, onAddNote, onDeleteNote }: DayPanelProps) {
  const [noteText, setNoteText] = useState('')
  const [colorIdx, setColorIdx] = useState(0)
  const [saved, setSaved] = useState(false)

  function handleAdd() {
    if (!noteText.trim()) return
    onAddNote({
      id: `${Date.now()}`,
      text: noteText.trim(),
      color: NOTE_COLORS[colorIdx].cls,
      time: fmtNow(),
    })
    setNoteText('')
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
  }

  return (
    <div className="w-80 shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: '75vh' }}>
      {/* Header */}
      <div className="bg-violet-600 px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <p className="text-white font-bold text-sm">July {ordinal(modal.day)}, 2026</p>
          <p className="text-violet-200 text-xs">
            {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][[3,4,5,6,0,1,2,3,4,5,6,0,1,2,3,4,5,6,0,1,2,3,4,5,6,0,1,2,3,4,5][modal.day - 1]]}
          </p>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Existing events */}
        {events.length > 0 && (
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Scheduled</p>
            <div className="space-y-1.5">
              {events.map((ev, i) => (
                <div key={i} className={cn('text-xs rounded-lg px-2.5 py-1.5 flex items-center gap-2', ev.color)}>
                  {ev.time && <span className="font-bold shrink-0">{ev.time}</span>}
                  <span>{ev.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes list */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-1.5 mb-2">
            <StickyNote className="w-3.5 h-3.5 text-slate-400" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</p>
            <span className="text-[10px] text-slate-300">({modal.notes.length})</span>
          </div>

          {modal.notes.length === 0 ? (
            <p className="text-xs text-slate-400 py-2 italic">No notes yet. Add one below.</p>
          ) : (
            <div className="space-y-2">
              {modal.notes.map(note => (
                <div key={note.id} className={cn('text-xs rounded-lg px-3 py-2.5 border flex items-start gap-2', note.color)}>
                  <p className="flex-1 leading-relaxed">{note.text}</p>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <button onClick={() => onDeleteNote(note.id)} className="opacity-50 hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="flex items-center gap-0.5 opacity-60">
                      <Clock className="w-2.5 h-2.5" />
                      <span className="text-[9px]">{note.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add note form */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 shrink-0">
        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd() }}
          placeholder="Add a note… (⌘+Enter to save)"
          rows={3}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-violet-500 mb-2"
        />
        {/* Color picker */}
        <div className="flex items-center gap-1.5 mb-2">
          {NOTE_COLORS.map((c, i) => (
            <button key={i} onClick={() => setColorIdx(i)} className={cn('w-5 h-5 rounded-full transition-all', c.dot, colorIdx === i ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'opacity-60 hover:opacity-100')} title={c.label} />
          ))}
          <span className="text-[10px] text-slate-400 ml-1">Note color</span>
        </div>
        <button
          onClick={handleAdd}
          disabled={!noteText.trim()}
          className={cn('w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all', saved ? 'bg-emerald-500 text-white' : noteText.trim() ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed')}
        >
          {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : <><Plus className="w-3.5 h-3.5" /> Add Note</>}
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  // notes per day: { [day]: CalNote[] }
  const [dayNotes, setDayNotes] = useState<Record<number, CalNote[]>>({})

  const firstDay = 3  // July 1, 2026 is a Wednesday
  const daysInMonth = 31
  const calCells = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1
    return (day >= 1 && day <= daysInMonth) ? day : null
  })

  function addNote(day: number, note: CalNote) {
    setDayNotes(prev => ({ ...prev, [day]: [note, ...(prev[day] || [])] }))
  }
  function deleteNote(day: number, id: string) {
    setDayNotes(prev => ({ ...prev, [day]: (prev[day] || []).filter(n => n.id !== id) }))
  }

  // All days that have notes
  const daysWithNotes = Object.keys(dayNotes).filter(d => dayNotes[Number(d)]?.length > 0).map(Number)

  // Upcoming notes for sidebar
  const upcomingNotes = daysWithNotes
    .sort((a, b) => a - b)
    .flatMap(d => (dayNotes[d] || []).map(n => ({ day: d, ...n })))
    .slice(0, 5)

  return (
    <AppShell pageTitle="Calendar" pageSubtitle="Click any day to view events, check notes, and add notes — July 2026">
      <div className="flex gap-5">
        {/* Calendar */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 text-lg">July 2026</h2>
              <div className="flex items-center gap-3">
                {selectedDay && (
                  <span className="text-xs text-violet-600 font-medium">
                    Jul {selectedDay} selected
                  </span>
                )}
                <div className="flex gap-1">
                  <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">← Jun</button>
                  <button className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">Aug →</button>
                </div>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="text-center text-[11px] font-semibold text-slate-400 py-1.5">{d}</div>
              ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7 gap-1">
              {calCells.map((day, i) => {
                if (!day) return <div key={i} className="min-h-[72px]" />
                const events = SEED_EVENTS[day] || []
                const notes = dayNotes[day] || []
                const isSelected = selectedDay === day
                const isToday = day === 30  // June 30 is today but we're showing July — highlight none
                const hasNotes = notes.length > 0
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={cn(
                      'min-h-[72px] rounded-lg p-1.5 text-left transition-all border',
                      isSelected
                        ? 'border-violet-400 bg-violet-50 ring-1 ring-violet-300'
                        : 'border-slate-100 bg-white hover:border-violet-200 hover:bg-violet-50/30'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={cn('text-xs font-bold', day === 4 ? 'text-red-500' : isSelected ? 'text-violet-700' : 'text-slate-700')}>{day}</p>
                      {hasNotes && (
                        <span className="w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                          <span className="text-[8px] text-white font-bold">{notes.length}</span>
                        </span>
                      )}
                    </div>
                    {events.slice(0, 2).map((ev, j) => (
                      <div key={j} className={cn('text-[9px] leading-tight rounded px-1 py-0.5 mb-0.5 truncate', ev.color)}>
                        {ev.time && <span className="font-bold">{ev.time} </span>}{ev.label}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <p className="text-[9px] text-slate-400 pl-1">+{events.length - 2} more</p>
                    )}
                    {notes.slice(0, 1).map(n => (
                      <div key={n.id} className={cn('text-[9px] leading-tight rounded px-1 py-0.5 mb-0.5 truncate border', n.color)}>
                        📝 {n.text}
                      </div>
                    ))}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 flex-wrap text-xs text-slate-400">
              {[
                { label: 'Holiday', cls: 'bg-red-200' },
                { label: 'PTO/Leave', cls: 'bg-teal-200' },
                { label: 'My PTO', cls: 'bg-sky-200' },
                { label: 'Payroll', cls: 'bg-violet-200' },
                { label: 'Benefits', cls: 'bg-blue-200' },
                { label: 'HR Events', cls: 'bg-orange-200' },
                { label: 'Notes', cls: 'bg-violet-500' },
              ].map(l => (
                <span key={l.label} className="flex items-center gap-1">
                  <span className={cn('w-3 h-3 rounded-sm inline-block', l.cls)} />{l.label}
                </span>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 mt-3">
              💡 Click any day to view events, read notes, or add your own notes
            </p>
          </div>
        </div>

        {/* Right panel: day detail OR sidebar */}
        <div className="w-80 shrink-0 space-y-4">
          {selectedDay ? (
            <DayPanel
              modal={{ day: selectedDay, notes: dayNotes[selectedDay] || [] }}
              events={SEED_EVENTS[selectedDay] || []}
              onClose={() => setSelectedDay(null)}
              onAddNote={note => addNote(selectedDay, note)}
              onDeleteNote={id => deleteNote(selectedDay, id)}
            />
          ) : (
            <>
              {/* Upcoming events */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 text-sm mb-3">Upcoming Events</h3>
                <div className="space-y-2">
                  {UPCOMING_STATIC.map((ev, i) => (
                    <button key={i} onClick={() => setSelectedDay(ev.day)} className="w-full flex items-center gap-2 hover:bg-slate-50 rounded-lg p-1 -m-1 transition-colors text-left">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        {ev.day}
                      </div>
                      <span className={cn('text-xs px-2 py-1 rounded-lg flex-1 leading-tight text-left', ev.color)}>{ev.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* My Notes */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <StickyNote className="w-4 h-4 text-violet-500" />
                  <h3 className="font-semibold text-slate-900 text-sm">My Notes</h3>
                  {upcomingNotes.length > 0 && (
                    <span className="text-[10px] bg-violet-100 text-violet-700 font-bold px-1.5 py-0.5 rounded-full ml-auto">{upcomingNotes.length}</span>
                  )}
                </div>
                {upcomingNotes.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-slate-400">No notes yet.</p>
                    <p className="text-[11px] text-slate-300 mt-1">Click any day on the calendar to add one.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upcomingNotes.map((n, i) => (
                      <button key={i} onClick={() => setSelectedDay(n.day)} className="w-full text-left">
                        <div className={cn('text-xs rounded-lg px-3 py-2.5 border hover:opacity-90 transition-opacity', n.color)}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[10px] opacity-70">Jul {n.day}</span>
                            <span className="text-[9px] opacity-60">{n.time}</span>
                          </div>
                          <p className="leading-relaxed line-clamp-2">{n.text}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                <p className="text-xs font-bold text-violet-800 mb-1">Benefits Milestone</p>
                <p className="text-xs text-violet-700">Marcus Williams&apos; enrollment window closes <strong>Jul 29</strong>. 29 days remaining.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}
