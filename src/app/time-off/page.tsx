'use client'
import { useState, useEffect, useRef } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Clock, Check, X, Plus, Calendar, LogIn, LogOut, Timer, AlertCircle, CloudOff, Cloud } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Punch { type: 'in' | 'out'; time: Date; label: string; synced: boolean }
interface PTORequest { employee: string; type: string; dates: string; days: number; status: 'Pending Approval' | 'Approved' | 'Denied' }
interface DbSession { id: string; worker_id: string; display_name: string; clock_in: string; clock_out: string | null; duration_minutes: number | null; pay_period: string }

const PTO_REQUESTS: PTORequest[] = [
  { employee: 'Jordan Rivera',   type: 'PTO',  dates: 'Jul 21–25, 2026',    days: 5, status: 'Pending Approval' },
  { employee: 'Marcus Williams', type: 'PTO',  dates: 'Jul 14–15, 2026',    days: 2, status: 'Approved' },
  { employee: 'Maya Johnson',    type: 'PTO',  dates: 'Jun 30–Jul 2, 2026', days: 3, status: 'Approved' },
  { employee: 'Lisa Tran',       type: 'Sick', dates: 'Jul 7, 2026',        days: 1, status: 'Approved' },
  { employee: 'Chris Patel',     type: 'PTO',  dates: 'Aug 4–8, 2026',      days: 5, status: 'Pending Approval' },
]

const CALENDAR_EVENTS: Record<number, { label: string; color: string }[]> = {
  4:  [{ label: '🇺🇸 Independence Day', color: 'bg-red-100 text-red-700' }],
  7:  [{ label: 'Lisa Tran — Sick',     color: 'bg-yellow-100 text-yellow-700' }],
  14: [{ label: 'Marcus — PTO',         color: 'bg-teal-100 text-teal-700' }],
  15: [{ label: 'Marcus — PTO',         color: 'bg-teal-100 text-teal-700' }],
  21: [{ label: 'Jordan — PTO',         color: 'bg-blue-100 text-blue-700' }],
  22: [{ label: 'Jordan — PTO',         color: 'bg-blue-100 text-blue-700' }],
  23: [{ label: 'Jordan — PTO',         color: 'bg-blue-100 text-blue-700' }],
  24: [{ label: 'Jordan — PTO',         color: 'bg-blue-100 text-blue-700' }],
  25: [{ label: 'Jordan — PTO',         color: 'bg-blue-100 text-blue-700' }],
  30: [{ label: 'Maya — PTO',           color: 'bg-teal-100 text-teal-700' }],
  31: [{ label: 'Maya — PTO',           color: 'bg-teal-100 text-teal-700' }],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtTime(d: Date) { return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }) }
function fmtShort(d: Date) { return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }
function fmtElapsed(ms: number) {
  const s = Math.floor(ms / 1000); const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const sec = s % 60
  return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}
function fmtDuration(ms: number) {
  const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

/** Read authoritative worker identity from the server-validated session. */
async function getWorkerIdentity(): Promise<{ worker_id: string; display_name: string }> {
  const response = await fetch('/api/session', { cache: 'no-store' })
  if (!response.ok) throw new Error('Authenticated worker profile is required')
  const { profile } = await response.json()
  return { worker_id: profile.worker_id, display_name: profile.display_name }
}

// ─── Clock Widget ─────────────────────────────────────────────────────────────
function ClockWidget() {
  const [clockedIn, setClockedIn]     = useState(false)
  const [clockInTime, setClockInTime] = useState<Date | null>(null)
  const [elapsed, setElapsed]         = useState(0)
  const [punches, setPunches]         = useState<Punch[]>([])
  const [now, setNow]                 = useState(new Date())
  const [justActed, setJustActed]     = useState<'in' | 'out' | null>(null)
  const [sessionId, setSessionId]     = useState<string | null>(null)  // Supabase row ID
  const [syncStatus, setSyncStatus]   = useState<'idle' | 'syncing' | 'synced' | 'offline'>('idle')
  const [payPeriod, setPayPeriod]     = useState<string>('')
  const [pastSessions, setPastSessions] = useState<DbSession[]>([])
  const [workerIdentity, setWorkerIdentity] = useState<{ worker_id: string; display_name: string } | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Live clock
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])

  // Load identity + today's sessions on mount
  useEffect(() => {
    getWorkerIdentity().then(async identity => {
      setWorkerIdentity(identity)
      // Load today's sessions from API
      try {
        const res = await fetch(`/api/time-sessions?worker_id=${identity.worker_id}`)
        const json = await res.json()
        if (json.sessions) {
          setPastSessions(json.sessions)
          setPayPeriod(json.pay_period || '')
          // Check if currently clocked in (has session with no clock_out)
          const openSession = json.sessions.find((s: DbSession) => s.clock_out === null)
          if (openSession) {
            const inTime = new Date(openSession.clock_in)
            setClockInTime(inTime)
            setClockedIn(true)
            setElapsed(Date.now() - inTime.getTime())
            setSessionId(openSession.id)
            setSyncStatus('synced')
          }
        }
      } catch { setSyncStatus('offline') }
    })
  }, [])

  // Elapsed timer
  useEffect(() => {
    if (clockedIn && clockInTime) {
      intervalRef.current = setInterval(() => setElapsed(Date.now() - clockInTime.getTime()), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [clockedIn, clockInTime])

  async function handleClockIn() {
    const t = new Date()
    setClockInTime(t); setClockedIn(true); setElapsed(0)
    setPunches(prev => [{ type: 'in', time: t, label: 'Clock In', synced: false }, ...prev])
    setJustActed('in'); setTimeout(() => setJustActed(null), 2000)

    if (!workerIdentity) return
    setSyncStatus('syncing')
    try {
      const res = await fetch('/api/time-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clock_in', worker_id: workerIdentity.worker_id, display_name: workerIdentity.display_name }),
      })
      const json = await res.json()
      if (json.session_id) {
        setSessionId(json.session_id)
        setPayPeriod(json.pay_period || '')
        setSyncStatus('synced')
        setPunches(prev => prev.map((p, i) => i === 0 ? { ...p, synced: true } : p))
      } else {
        setSyncStatus('offline')
      }
    } catch {
      setSyncStatus('offline')
    }
  }

  async function handleClockOut() {
    const t = new Date()
    setClockedIn(false)
    setPunches(prev => [{ type: 'out', time: t, label: 'Clock Out', synced: false }, ...prev])
    setJustActed('out'); setTimeout(() => setJustActed(null), 2000)

    if (!sessionId) { setSyncStatus('offline'); return }
    setSyncStatus('syncing')
    try {
      const res = await fetch('/api/time-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clock_out', worker_id: workerIdentity?.worker_id, session_id: sessionId }),
      })
      const json = await res.json()
      if (json.success) {
        setSyncStatus('synced')
        setPunches(prev => prev.map((p, i) => i === 0 ? { ...p, synced: true } : p))
        // Refresh past sessions
        if (workerIdentity) {
          fetch(`/api/time-sessions?worker_id=${workerIdentity.worker_id}`)
            .then(r => r.json())
            .then(j => { if (j.sessions) setPastSessions(j.sessions) })
            .catch(() => {})
        }
      } else {
        setSyncStatus('offline')
      }
    } catch {
      setSyncStatus('offline')
    }
  }

  // Total ms for today (from live punches)
  const totalMs = punches.reduce((acc, p, i, arr) => {
    if (p.type === 'out') {
      const inPunch = arr.slice(i + 1).find(x => x.type === 'in')
      if (inPunch) return acc + (p.time.getTime() - inPunch.time.getTime())
    }
    return acc
  }, clockedIn && clockInTime ? elapsed : 0)

  // Total minutes from DB (past sessions this period)
  const dbTotalMinutes = pastSessions
    .filter(s => s.clock_out !== null)
    .reduce((acc, s) => acc + (s.duration_minutes || 0), 0)

  const syncIcon = syncStatus === 'synced' ? (
    <span className="flex items-center gap-1 text-emerald-300 text-[10px]"><Cloud className="w-3 h-3" />Synced to Supabase</span>
  ) : syncStatus === 'syncing' ? (
    <span className="flex items-center gap-1 text-white/60 text-[10px]"><div className="w-3 h-3 border border-white/60 border-t-transparent rounded-full animate-spin"/><span>Saving…</span></span>
  ) : syncStatus === 'offline' ? (
    <span className="flex items-center gap-1 text-amber-300 text-[10px]"><CloudOff className="w-3 h-3" />Local only (table not found)</span>
  ) : null

  return (
    <div className="space-y-4">
      {/* Pay period badge */}
      {payPeriod && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Pay Period:</span>
          <span className="text-xs font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{payPeriod}</span>
          <span className="text-xs text-slate-400">· {workerIdentity?.display_name} ({workerIdentity?.worker_id})</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Clock header */}
        <div className={cn('px-6 py-5 transition-colors duration-500', clockedIn ? 'bg-emerald-600' : 'bg-slate-800')}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-0.5">
                {clockedIn ? 'Currently Working' : 'Not Clocked In'}
              </p>
              <p className="text-white font-bold text-2xl">{fmtTime(now)}</p>
              <p className="text-white/60 text-xs mt-0.5">
                {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <div className="mt-1">{syncIcon}</div>
            </div>
            {clockedIn && (
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-white/70 text-xs mb-1 justify-end"><Timer className="w-3.5 h-3.5" /><span>Session</span></div>
                <p className="text-white font-mono font-bold text-3xl tabular-nums">{fmtElapsed(elapsed)}</p>
                {clockInTime && <p className="text-white/60 text-xs mt-1">since {fmtShort(clockInTime)}</p>}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-3">
            {!clockedIn ? (
              <button onClick={handleClockIn} className={cn('flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all', justActed === 'in' ? 'bg-emerald-400 text-white scale-95' : 'bg-white text-slate-900 hover:bg-emerald-50')}>
                <LogIn className="w-4 h-4" />{justActed === 'in' ? 'Clocked In ✓' : 'Clock In'}
              </button>
            ) : (
              <button onClick={handleClockOut} className={cn('flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all', justActed === 'out' ? 'bg-red-400 text-white scale-95' : 'bg-white/20 border border-white/30 text-white hover:bg-white/30')}>
                <LogOut className="w-4 h-4" />{justActed === 'out' ? 'Clocked Out ✓' : 'Clock Out'}
              </button>
            )}
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-sm">
              <Clock className="w-4 h-4 text-white/60" />
              <span>Today: <strong>{fmtDuration(totalMs)}</strong></span>
            </div>
          </div>
        </div>

        {/* Today's punch log */}
        <div className="p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Today&apos;s Punch Log</p>
          {punches.length === 0 ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
              <AlertCircle className="w-4 h-4" />
              <span>No punches recorded yet — clock in to start tracking.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {punches.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', p.type === 'in' ? 'bg-emerald-100' : 'bg-red-100')}>
                    {p.type === 'in' ? <LogIn className="w-3.5 h-3.5 text-emerald-600" /> : <LogOut className="w-3.5 h-3.5 text-red-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{p.label}</p>
                      {p.synced
                        ? <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full font-medium">✓ saved</span>
                        : <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">local</span>}
                    </div>
                    <p className="text-xs text-slate-400">{fmtShort(p.time)}</p>
                  </div>
                  {p.type === 'out' && (() => {
                    const inPunch = punches.slice(i + 1).find(x => x.type === 'in')
                    if (!inPunch) return null
                    return <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{fmtDuration(p.time.getTime() - inPunch.time.getTime())}</span>
                  })()}
                </div>
              ))}
            </div>
          )}

          {/* Weekly bar chart */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">This Week</p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { day: 'Mon', hours: 8.5,  status: 'done'   },
                { day: 'Tue', hours: 8.25, status: 'done'   },
                { day: 'Wed', hours: 9.0,  status: 'done'   },
                { day: 'Thu', hours: 7.75, status: 'done'   },
                { day: 'Fri', hours: clockedIn ? totalMs / 3600000 : 0, status: clockedIn ? 'active' : 'today' },
              ].map(d => (
                <div key={d.day} className="text-center">
                  <p className="text-[10px] text-slate-400 mb-1">{d.day}</p>
                  <div className={cn('h-12 rounded-lg flex items-end justify-center pb-1 relative overflow-hidden', d.status === 'active' ? 'bg-emerald-100' : d.status === 'today' ? 'bg-slate-50 border border-dashed border-slate-200' : 'bg-blue-50')}>
                    <div className={cn('absolute bottom-0 left-0 right-0 rounded-b-lg', d.status === 'active' ? 'bg-emerald-400' : 'bg-blue-400')} style={{ height: `${Math.min(100, (d.hours / 10) * 100)}%` }} />
                    <span className={cn('text-[10px] font-bold relative z-10', d.hours > 0 ? 'text-white' : 'text-slate-300')}>{d.hours > 0 ? `${d.hours.toFixed(1)}h` : '-'}</span>
                  </div>
                  {d.status === 'active' && <span className="text-[8px] text-emerald-600 font-bold">LIVE</span>}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
              <span>Week total</span>
              <span className="font-bold text-slate-900">{(33.5 + totalMs / 3600000).toFixed(1)}h <span className="font-normal text-slate-400">/ 40h</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Past sessions from DB */}
      {pastSessions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Session History — This Pay Period</h3>
              <p className="text-xs text-slate-400">{payPeriod} · {pastSessions.filter(s => s.clock_out).length} completed sessions · {Math.floor(dbTotalMinutes / 60)}h {dbTotalMinutes % 60}m total</p>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Cloud className="w-3 h-3" /> Supabase
            </span>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>{['Date','Clock In','Clock Out','Duration','Status'].map(h => <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-2">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pastSessions.slice(0, 10).map(s => {
                const inDate = new Date(s.clock_in)
                const outDate = s.clock_out ? new Date(s.clock_out) : null
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-xs text-slate-600">{inDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-700">{fmtShort(inDate)}</td>
                    <td className="px-4 py-2.5 text-xs font-mono text-slate-700">{outDate ? fmtShort(outDate) : <span className="text-emerald-600 font-semibold animate-pulse">Active</span>}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-slate-900">
                      {s.duration_minutes != null ? `${Math.floor(s.duration_minutes / 60)}h ${s.duration_minutes % 60}m` : (s.clock_out === null ? '—' : '—')}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', s.clock_out ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                        {s.clock_out ? 'Complete' : 'In Progress'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── PTO Section ──────────────────────────────────────────────────────────────
function PTOSection() {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ from: '', to: '', type: 'PTO', notes: '' })
  const [submitted, setSubmitted] = useState(false)

  const statusColor = { 'Approved': 'bg-emerald-100 text-emerald-700', 'Pending Approval': 'bg-amber-100 text-amber-700', 'Denied': 'bg-red-100 text-red-700' }
  const firstDay = 3; const daysInMonth = 31
  const calCells = Array.from({ length: 42 }, (_, i) => { const d = i - firstDay + 1; return d >= 1 && d <= daysInMonth ? d : null })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitted(true)
    setTimeout(() => { setShowModal(false); setSubmitted(false); setForm({ from:'', to:'', type:'PTO', notes:'' }) }, 1500)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'PTO Balance', value: '15 days', sub: '5 used · 20 accrued YTD', color: 'text-blue-600' },
          { label: 'Sick Leave',  value: '5 days',  sub: '3 used YTD',              color: 'text-amber-600' },
          { label: 'Holidays',    value: '6 left',  sub: 'Jul 4 · Sep 1 · Nov 27…', color: 'text-violet-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm font-semibold text-slate-900 mb-2">{s.label}</p>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Team Calendar — July 2026</h3>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-3 py-2 rounded-lg">
            <Plus className="w-3.5 h-3.5" /> Request Time Off
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-center text-[11px] font-semibold text-slate-400 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calCells.map((day, i) => (
            <div key={i} className={cn('min-h-[52px] rounded-lg p-1', day ? 'bg-slate-50 hover:bg-slate-100' : '')}>
              {day && <>
                <p className={cn('text-xs font-semibold mb-1', day === 4 ? 'text-red-600' : 'text-slate-600')}>{day}</p>
                {(CALENDAR_EVENTS[day] || []).map((ev, j) => <span key={j} className={cn('block text-[9px] rounded px-1 py-0.5 mb-0.5 leading-tight truncate', ev.color)}>{ev.label}</span>)}
              </>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100"><h3 className="font-semibold text-slate-900 text-sm">Recent Requests</h3></div>
        <table className="w-full">
          <thead className="bg-slate-50"><tr>{['Employee','Type','Dates','Days','Status'].map(h => <th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-2">{h}</th>)}</tr></thead>
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
                  <div><label className="text-xs text-slate-500 block mb-1">From</label><input type="date" value={form.from} onChange={e => setForm({...form, from:e.target.value})} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500" /></div>
                  <div><label className="text-xs text-slate-500 block mb-1">To</label><input type="date" value={form.to} onChange={e => setForm({...form, to:e.target.value})} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500" /></div>
                </div>
                <div><label className="text-xs text-slate-500 block mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type:e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500">
                    <option>PTO</option><option>Sick</option><option>Personal</option><option>Bereavement</option><option>FMLA</option>
                  </select>
                </div>
                <div><label className="text-xs text-slate-500 block mb-1">Notes (optional)</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-1 focus:ring-violet-500" placeholder="Optional notes for your manager..." />
                </div>
                <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors">Submit Request</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type Tab = 'clock' | 'pto'
export default function TimeOffPage() {
  const [tab, setTab] = useState<Tab>('clock')
  return (
    <AppShell pageTitle="Time & Attendance" pageSubtitle="Clock in/out logged to Supabase · PTO management · Team calendar">
      <div className="flex gap-1 mb-5 bg-white border border-slate-200 rounded-xl p-1 w-fit">
        <button onClick={() => setTab('clock')} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === 'clock' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-700')}>
          <Timer className="w-4 h-4" />Time Clock
        </button>
        <button onClick={() => setTab('pto')} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === 'pto' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-700')}>
          <Calendar className="w-4 h-4" />PTO & Leave
        </button>
      </div>
      {tab === 'clock' && <ClockWidget />}
      {tab === 'pto'   && <PTOSection />}
    </AppShell>
  )
}
