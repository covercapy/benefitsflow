'use client'

import { useEffect, useState } from 'react'
import { cn, formatDate } from '@/lib/utils'
import {
  CheckCircle2, Clock, AlertTriangle, ChevronRight,
  Upload, FileText, User, X, Check,
  ShieldCheck, Calendar, Info, Heart, RefreshCw
} from 'lucide-react'

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
type TaskType = 'ENROLLMENT' | 'QLE' | 'DOCUMENT' | 'DEPENDENT_VERIFICATION' | 'SYSTEM'

interface InboxTask {
  id: string
  type: TaskType
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: TaskStatus
  title: string
  description: string
  dueDate: string
  worker?: string
  employeeId?: string
  actionLabel?: string
  actionHref?: string
  metadata?: Record<string, string>
}


const TYPE_CONFIG: Record<TaskType, { icon: React.ElementType; color: string; label: string }> = {
  ENROLLMENT: { icon: Heart, color: 'text-blue-600 bg-blue-50', label: 'Enrollment' },
  QLE: { icon: Calendar, color: 'text-violet-600 bg-violet-50', label: 'Life Event' },
  DOCUMENT: { icon: FileText, color: 'text-amber-600 bg-amber-50', label: 'Document' },
  DEPENDENT_VERIFICATION: { icon: User, color: 'text-teal-600 bg-teal-50', label: 'Dependent' },
  SYSTEM: { icon: RefreshCw, color: 'text-slate-600 bg-slate-100', label: 'System' },
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; class: string }> = {
  PENDING: { label: 'Pending', class: 'badge-pending' },
  IN_PROGRESS: { label: 'In Progress', class: 'badge-active' },
  COMPLETED: { label: 'Completed', class: 'bg-emerald-100 text-emerald-700' },
  OVERDUE: { label: 'Overdue', class: 'badge-overdue' },
}

const PRIORITY_CLASS: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700 text-[9px] font-bold',
  MEDIUM: 'bg-amber-100 text-amber-700 text-[9px] font-bold',
  LOW: 'bg-slate-100 text-slate-600 text-[9px] font-bold',
}

// QLE Submission Form (inline mock)
function QLEForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [qleType, setQleType] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function submitQle() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const response = await fetch('/api/qle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qleType, eventDate }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'QLE submission failed')
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'QLE submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const QLE_TYPES = [
    { value: 'MARRIAGE', label: 'Marriage' },
    { value: 'BIRTH_ADOPTION', label: 'Birth or Adoption' },
    { value: 'DIVORCE', label: 'Divorce / Legal Separation' },
    { value: 'DEPENDENT_LOSS', label: 'Dependent Loss of Coverage' },
    { value: 'EMPLOYMENT_CHANGE', label: 'Employment Status Change' },
    { value: 'MOVE', label: 'Move / Relocation' },
  ]

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-1">QLE Submitted</h3>
        <p className="text-sm text-slate-500 mb-4">Your qualifying life event has been submitted for review. You'll receive a task in your inbox once approved and your 30-day enrollment window opens.</p>
        <button onClick={onClose} className="text-sm text-blue-600 hover:underline">Close</button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-slate-900">Report a Life Event</h3>
          <p className="text-xs text-slate-500">Step {step} of 3</p>
        </div>
        <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-5">
        {[1,2,3].map(s => (
          <div key={s} className={cn('h-1 flex-1 rounded-full transition-colors', s <= step ? 'bg-blue-600' : 'bg-slate-200')} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Select the type of life event</p>
          {QLE_TYPES.map(t => (
            <label key={t.value} className={cn('flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
              qleType === t.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300')}>
              <input type="radio" name="qle" value={t.value} checked={qleType === t.value}
                onChange={() => setQleType(t.value)} className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-sm text-slate-700">{t.label}</span>
            </label>
          ))}
          <button disabled={!qleType} onClick={() => setStep(2)}
            className="w-full mt-2 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors">
            Next →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Date of event</label>
            <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-800">
                You have <strong>30 days</strong> from the event date to make coverage changes. After submission, your HR team will review and open your enrollment window.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 border border-slate-200 text-slate-700 text-sm py-2 rounded-lg hover:bg-slate-50">Back</button>
            <button disabled={!eventDate} onClick={() => setStep(3)}
              className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-40 hover:bg-blue-700">Next →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-700">Upload supporting documentation</p>
          <div className="border border-slate-200 bg-slate-50 rounded-xl p-5 text-center">
            <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">Evidence task will be created after submission</p>
            <p className="text-xs text-slate-400 mt-1">The Benefits Partner will request the required certificate or coverage notice.</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-500">
            <p className="font-medium text-slate-700 mb-1">Summary</p>
            <p>Event: {QLE_TYPES.find(t => t.value === qleType)?.label}</p>
            <p>Date: {eventDate}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="flex-1 border border-slate-200 text-slate-700 text-sm py-2 rounded-lg hover:bg-slate-50">Back</button>
            <button onClick={submitQle} disabled={submitting}
              className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Submitting…' : 'Submit QLE'}
            </button>
          </div>
          {submitError && <p className="text-xs text-red-600">{submitError}</p>}
        </div>
      )}
    </div>
  )
}

export function InboxView() {
  const [filter, setFilter] = useState<'ALL' | TaskStatus>('ALL')
  const [showQLEForm, setShowQLEForm] = useState(false)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [baseTasks, setBaseTasks] = useState<InboxTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/inbox', { cache: 'no-store' })
      .then(async response => response.ok ? response.json() : Promise.reject())
      .then(({ tasks }) => setBaseTasks(tasks.map((task: any) => {
        const worker = Array.isArray(task.workers) ? task.workers[0] : task.workers
        const due = task.due_date || new Date(task.created_at).toISOString().slice(0, 10)
        const overdue = task.status !== 'COMPLETED' && new Date(due).getTime() < Date.now()
        const type: TaskType = task.task_type?.includes('QLE') ? 'QLE'
          : task.task_type?.includes('DOCUMENT') ? 'DOCUMENT'
          : task.task_type?.includes('DEPENDENT') ? 'DEPENDENT_VERIFICATION'
          : 'ENROLLMENT'
        return {
          id: task.id,
          type,
          priority: overdue ? 'HIGH' : 'MEDIUM',
          status: overdue ? 'OVERDUE' : task.status,
          title: task.title,
          description: task.description || '',
          dueDate: due,
          worker: worker ? `${worker.first_name} ${worker.last_name}` : undefined,
          employeeId: worker?.employee_id,
          actionLabel: 'Open Task',
          actionHref: '/inbox',
          metadata: task.related_id ? { 'Related Record': task.related_id } : undefined,
        }
      })))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const tasks = baseTasks.map(t => ({
    ...t,
    status: completedIds.has(t.id) ? 'COMPLETED' as TaskStatus : t.status,
  }))

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter)
  const pendingCount = tasks.filter(t => t.status === 'PENDING' || t.status === 'OVERDUE').length

  const markComplete = async (id: string) => {
    if (/^[0-9a-f-]{36}$/i.test(id)) {
      const response = await fetch('/api/inbox', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', taskId: id }),
      })
      if (!response.ok) return
    }
    setCompletedIds(prev => new Set([...prev, id]))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {(['ALL', 'PENDING', 'IN_PROGRESS', 'OVERDUE', 'COMPLETED'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300')}>
                {f === 'ALL' ? `All (${tasks.length})` :
                  f === 'PENDING' ? `Pending (${tasks.filter(t => t.status === 'PENDING').length})` :
                  f === 'OVERDUE' ? `Overdue (${tasks.filter(t => t.status === 'OVERDUE').length})` :
                  f === 'IN_PROGRESS' ? `In Progress (${tasks.filter(t => t.status === 'IN_PROGRESS').length})` :
                  `Done (${tasks.filter(t => t.status === 'COMPLETED').length})`}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setShowQLEForm(true)}
          className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Calendar className="w-3.5 h-3.5" />
          Report Life Event
        </button>
      </div>

      {/* QLE Modal */}
      {showQLEForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <QLEForm onClose={() => setShowQLEForm(false)} />
          </div>
        </div>
      )}

      {/* Summary strip */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{pendingCount} action{pendingCount > 1 ? 's' : ''}</strong> require your attention — including 1 overdue item.
          </p>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-3">
        {loading && (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-4/5" />
                    <div className="h-3 bg-slate-100 rounded w-1/3 mt-3" />
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No pending tasks</p>
            <p className="text-xs text-slate-400 mt-1">
              {filter === 'ALL' ? 'Your inbox is clear — nothing needs attention right now.' : 'No tasks in this category.'}
            </p>
          </div>
        )}
        {!loading && filtered.map(task => {
          const typeConfig = TYPE_CONFIG[task.type]
          const statusConfig = STATUS_CONFIG[task.status]
          const Icon = typeConfig.icon
          const isOverdue = task.status === 'OVERDUE'
          const isDone = task.status === 'COMPLETED'

          return (
            <div key={task.id}
              className={cn('bg-white rounded-xl border transition-all',
                isOverdue ? 'border-red-300 shadow-sm shadow-red-100' :
                isDone ? 'border-slate-100 opacity-75' : 'border-slate-200 hover:border-blue-300 hover:shadow-sm')}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Type icon */}
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', typeConfig.color)}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={cn('text-sm font-semibold', isDone ? 'text-slate-400 line-through' : 'text-slate-900')}>
                          {task.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={cn('px-1.5 py-0.5 rounded font-medium', PRIORITY_CLASS[task.priority])}>{task.priority}</span>
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', statusConfig.class)}>{statusConfig.label}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed mb-3">{task.description}</p>

                    {/* Metadata chips */}
                    {task.metadata && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(task.metadata).map(([k, v]) => (
                          <span key={k} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            <span className="font-medium">{k}:</span> {v}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>Due {task.dueDate}</span>
                        {task.worker && (
                          <>
                            <span className="mx-1">·</span>
                            <User className="w-3 h-3" />
                            <span>{task.worker} · {task.employeeId}</span>
                          </>
                        )}
                      </div>
                      {!isDone && task.actionLabel && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => markComplete(task.id)}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-600 transition-colors">
                            <Check className="w-3 h-3" /> Mark done
                          </button>
                          <a href={task.actionHref}
                            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                            {task.actionLabel} <ChevronRight className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Workday business process explainer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <div className="text-[11px] text-slate-500 space-y-1">
            <p><strong className="text-slate-700">About this inbox:</strong> In Workday, the Inbox (also called the Action Items list) surfaces pending business process steps assigned to the current user. Each task in a business process — approval, review, document submission, notification — routes to the correct role based on routing rules configured in the process definition.</p>
            <p>This view mirrors that pattern: QLE approvals route to Benefits Partner, document tasks route to the employee, system tasks are informational. In a full Workday implementation, each of these would be a named Business Process step in the Benefits Event BP or the Onboarding BP.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
