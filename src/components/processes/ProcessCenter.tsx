'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  ClipboardList, ChevronRight, CheckCircle2, Play,
  Info, Zap
} from 'lucide-react'

// ── Business Process definitions (mirrors Workday BP architecture) ─────────
const PROCESSES = [
  {
    id: 'bp-ben-event',
    name: 'Benefits Event – New Hire Enrollment',
    category: 'Benefits',
    trigger: 'Worker hire date + 1 day',
    steps: [
      { id: 1, name: 'Initiate Benefits Event',       actor: 'SYSTEM',           type: 'AUTO',     desc: 'Auto-triggered by trg_worker_eligibility on hire' },
      { id: 2, name: 'Employee: Elect Plans',          actor: 'EMPLOYEE',         type: 'ACTION',   desc: '5-step wizard: plan → provider → dependents → tier → review' },
      { id: 3, name: 'Submit Dependent Docs',          actor: 'EMPLOYEE',         type: 'ACTION',   desc: 'Upload marriage cert / birth cert within 31 days' },
      { id: 4, name: 'Benefits Partner: Verify Docs',  actor: 'BENEFITS_PARTNER', type: 'APPROVAL', desc: 'Review and approve dependent documentation' },
      { id: 5, name: 'System: Activate Coverage',      actor: 'SYSTEM',           type: 'AUTO',     desc: 'Set dental_elections.status = ACTIVE, notify carrier' },
      { id: 6, name: 'System: Send Carrier File',      actor: 'SYSTEM',           type: 'AUTO',     desc: 'Generate 834 EDI export to Cigna or Delta Dental' },
    ],
    activeInstances: 3,
    deadline: '30 days from hire',
    status: 'ACTIVE',
  },
  {
    id: 'bp-qle',
    name: 'Benefits Event – Qualifying Life Event (QLE)',
    category: 'Benefits',
    trigger: 'Employee submits QLE in inbox',
    steps: [
      { id: 1, name: 'Employee: Submit QLE',           actor: 'EMPLOYEE',         type: 'ACTION',   desc: 'Select event type, enter date, upload document' },
      { id: 2, name: 'Benefits Partner: Approve QLE',  actor: 'BENEFITS_PARTNER', type: 'APPROVAL', desc: 'Review event date and document validity' },
      { id: 3, name: 'System: Open Enrollment Window', actor: 'SYSTEM',           type: 'AUTO',     desc: 'Set 30-day election window starting from event date' },
      { id: 4, name: 'Employee: Make Elections',       actor: 'EMPLOYEE',         type: 'ACTION',   desc: 'Change plan / tier / dependents within 30-day window' },
      { id: 5, name: 'System: Apply Changes',          actor: 'SYSTEM',           type: 'AUTO',     desc: 'Update elections, notify carrier, write audit log' },
    ],
    activeInstances: 1,
    deadline: '30 days from QLE event date',
    status: 'ACTIVE',
  },
  {
    id: 'bp-onboard',
    name: 'Onboarding – Worker Activation',
    category: 'HR',
    trigger: 'New worker record created',
    steps: [
      { id: 1, name: 'HR: Create Worker Record',       actor: 'BENEFITS_PARTNER', type: 'ACTION',   desc: 'Enter hire date, job profile, org, work state, hours' },
      { id: 2, name: 'System: Calc Eligibility',       actor: 'SYSTEM',           type: 'AUTO',     desc: 'trg_worker_eligibility: tier, coverage track, deadline' },
      { id: 3, name: 'System: Send Welcome Email',     actor: 'SYSTEM',           type: 'AUTO',     desc: 'Notify employee with enrollment link and deadline' },
      { id: 4, name: 'Benefits Event: Initiate',       actor: 'SYSTEM',           type: 'AUTO',     desc: 'Spawn "Benefits Event – New Hire Enrollment" BP' },
      { id: 5, name: 'Manager: Complete Onboard Tasks',actor: 'MANAGER',          type: 'ACTION',   desc: 'IT provisioning, badge, buddy assignment' },
    ],
    activeInstances: 2,
    deadline: 'No deadline (milestone-based)',
    status: 'ACTIVE',
  },
  {
    id: 'bp-open-enroll',
    name: 'Open Enrollment – Annual',
    category: 'Benefits',
    trigger: 'Scheduled: Nov 1 annually',
    steps: [
      { id: 1, name: 'System: Open Enrollment Window', actor: 'SYSTEM',           type: 'AUTO',     desc: 'Set window Nov 1–30, notify all active workers' },
      { id: 2, name: 'Employee: Review & Re-elect',    actor: 'EMPLOYEE',         type: 'ACTION',   desc: 'Worker reviews current elections and makes changes' },
      { id: 3, name: 'System: Auto-Renew Non-Actives', actor: 'SYSTEM',           type: 'AUTO',     desc: 'Workers who don\'t act roll forward with existing elections' },
      { id: 4, name: 'Benefits Partner: Audit',        actor: 'BENEFITS_PARTNER', type: 'ACTION',   desc: 'Review exceptions, waivers, incomplete elections' },
      { id: 5, name: 'System: Close & Generate Files', actor: 'SYSTEM',           type: 'AUTO',     desc: 'Lock elections Nov 30, generate carrier files for Jan 1' },
    ],
    activeInstances: 0,
    deadline: 'Nov 30 (hard close)',
    status: 'INACTIVE',
  },
  {
    id: 'bp-termination',
    name: 'Benefits Event – Termination / COBRA',
    category: 'Benefits',
    trigger: 'Worker status set to TERMINATED',
    steps: [
      { id: 1, name: 'HR: Terminate Worker',           actor: 'BENEFITS_PARTNER', type: 'ACTION',   desc: 'Set worker_status = TERMINATED, effective date' },
      { id: 2, name: 'System: End Coverage',           actor: 'SYSTEM',           type: 'AUTO',     desc: 'Terminate all elections end of termination month' },
      { id: 3, name: 'System: Send COBRA Notice',      actor: 'SYSTEM',           type: 'AUTO',     desc: 'Mail COBRA election notice within 14 days (ERISA)' },
      { id: 4, name: 'Employee: COBRA Election',       actor: 'EMPLOYEE',         type: 'ACTION',   desc: '60-day window to elect COBRA continuation' },
      { id: 5, name: 'System: Notify Carriers',        actor: 'SYSTEM',           type: 'AUTO',     desc: 'Send termination records to Cigna / Delta Dental' },
    ],
    activeInstances: 0,
    deadline: 'COBRA election: 60 days',
    status: 'ACTIVE',
  },
  {
    id: 'bp-accumulator-reset',
    name: 'Plan Year Rollover – Accumulator Reset',
    category: 'System',
    trigger: 'Scheduled: Jan 1 annually',
    steps: [
      { id: 1, name: 'System: Reset Deductibles',      actor: 'SYSTEM',           type: 'AUTO',     desc: 'Set deductible_used = 0 for all dental_accumulators' },
      { id: 2, name: 'System: Reset Annual Max',       actor: 'SYSTEM',           type: 'AUTO',     desc: 'Set annual_used = 0 (ortho lifetime max NOT reset)' },
      { id: 3, name: 'System: Roll Plan Year',         actor: 'SYSTEM',           type: 'AUTO',     desc: 'Insert new accumulator rows for plan_year = current year' },
      { id: 4, name: 'System: Audit Log Entry',        actor: 'SYSTEM',           type: 'AUTO',     desc: 'Write rollover confirmation to audit_log' },
    ],
    activeInstances: 0,
    deadline: 'Completes Jan 1 00:01 UTC',
    status: 'ACTIVE',
  },
]

const STEP_ACTOR_COLOR: Record<string, string> = {
  EMPLOYEE:         'bg-blue-100 text-blue-700',
  BENEFITS_PARTNER: 'bg-violet-100 text-violet-700',
  HRIS_ANALYST:     'bg-amber-100 text-amber-700',
  MANAGER:          'bg-teal-100 text-teal-700',
  SYSTEM:           'bg-slate-100 text-slate-600',
  HR_LEADERSHIP:    'bg-rose-100 text-rose-700',
}

const STEP_TYPE_ICON: Record<string, React.ElementType> = {
  AUTO:     Zap,
  ACTION:   Play,
  APPROVAL: CheckCircle2,
}

const CATEGORY_COLOR: Record<string, string> = {
  Benefits: 'bg-blue-50 text-blue-700 border-blue-200',
  HR:       'bg-teal-50 text-teal-700 border-teal-200',
  System:   'bg-slate-50 text-slate-600 border-slate-200',
}

export function ProcessCenter() {
  const [selected, setSelected] = useState(PROCESSES[0])
  const [tab, setTab] = useState<'definition' | 'routing' | 'instances'>('definition')

  const activeCount = PROCESSES.reduce((s, p) => s + p.activeInstances, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Explainer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-[11px] text-blue-800">
          <strong>What this is:</strong> In Workday, every HR action is modeled as a <em>Business Process</em> — a named sequence of steps with defined actors, routing rules, and conditions.
          This page mirrors Workday's Process Center: you can see the BP definition (steps + actors), routing configuration, and currently active process instances.
          Interview talking point: "I designed BenefitsFlow's BP engine to mirror Workday's architecture so I can reason about process configuration, routing rules, and step actions the same way a Workday implementer does."
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Process definitions', value: PROCESSES.length },
          { label: 'Active instances now', value: activeCount },
          { label: 'Automated steps', value: PROCESSES.flatMap(p => p.steps).filter(s => s.type === 'AUTO').length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* BP list */}
        <div className="lg:col-span-2 space-y-2">
          <p className="text-xs font-semibold text-slate-700 px-1">Process Definitions</p>
          {PROCESSES.map(bp => (
            <button key={bp.id} onClick={() => { setSelected(bp); setTab('definition') }}
              className={cn('w-full text-left rounded-xl border px-4 py-3 transition-all',
                selected.id === bp.id
                  ? 'border-blue-400 bg-blue-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-blue-300')}>
              <div className="flex items-start justify-between gap-2">
                <p className={cn('text-xs font-semibold leading-snug', selected.id === bp.id ? 'text-blue-900' : 'text-slate-800')}>
                  {bp.name}
                </p>
                <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 mt-0.5', CATEGORY_COLOR[bp.category])}>
                  {bp.category}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                  bp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                  {bp.status}
                </span>
                {bp.activeInstances > 0 && (
                  <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full">
                    {bp.activeInstances} running
                  </span>
                )}
                <span className="text-[10px] text-slate-400">{bp.steps.length} steps</span>
              </div>
            </button>
          ))}
        </div>

        {/* BP detail */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
            {(['definition', 'routing', 'instances'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn('text-xs font-semibold px-4 py-1.5 rounded-lg capitalize transition-colors',
                  tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'definition' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">{selected.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Trigger: {selected.trigger} · Deadline: {selected.deadline}</p>
              </div>

              {/* Step flow */}
              <div className="p-5 space-y-3">
                {selected.steps.map((step, i) => {
                  const TypeIcon = STEP_TYPE_ICON[step.type]
                  const isLast = i === selected.steps.length - 1
                  return (
                    <div key={step.id} className="relative flex gap-3">
                      {/* Connector line */}
                      {!isLast && (
                        <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-200 z-0" />
                      )}
                      {/* Step number */}
                      <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 z-10">
                        {step.id}
                      </div>
                      {/* Content */}
                      <div className="flex-1 pb-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-xs font-semibold text-slate-900">{step.name}</p>
                          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5', STEP_ACTOR_COLOR[step.actor])}>
                            {step.actor}
                          </span>
                          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5',
                            step.type === 'AUTO' ? 'bg-amber-100 text-amber-700' :
                            step.type === 'APPROVAL' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-blue-100 text-blue-700')}>
                            <TypeIcon className="w-2.5 h-2.5" />
                            {step.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{step.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === 'routing' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Routing Rules – {selected.name}</h2>
              <div className="space-y-3">
                {selected.steps.filter(s => s.type !== 'AUTO').map(step => (
                  <div key={step.id} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-700">Step {step.id}: {step.name}</span>
                      <span className={cn('text-[9px] font-bold px-1.5 rounded-full', STEP_ACTOR_COLOR[step.actor])}>
                        {step.actor}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex gap-2">
                        <span className="text-slate-400 w-24 shrink-0">Route to:</span>
                        <span className="font-medium">{step.actor === 'EMPLOYEE' ? 'Initiating worker\'s Workday inbox' : `Role-based routing → any ${step.actor}`}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-slate-400 w-24 shrink-0">Condition:</span>
                        <span>Always route (no conditions on this step)</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-slate-400 w-24 shrink-0">Timeout:</span>
                        <span>{step.actor === 'EMPLOYEE' ? '30 days → escalate to Benefits Partner' : '5 business days → escalate to HR Leadership'}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-slate-400 w-24 shrink-0">On deny:</span>
                        <span>{step.type === 'APPROVAL' ? 'Return to prior step with comment' : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {selected.steps.every(s => s.type === 'AUTO') && (
                  <p className="text-xs text-slate-400 text-center py-4">All steps in this process are automated — no manual routing rules</p>
                )}
              </div>
            </div>
          )}

          {tab === 'instances' && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Active Instances – {selected.name}</h2>
              </div>
              {selected.activeInstances === 0 ? (
                <div className="p-10 text-center">
                  <CheckCircle2 className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No active instances for this process</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">Worker</th>
                      <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">Current Step</th>
                      <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">Started</th>
                      <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { worker: 'Elena Vasquez',  id: 'ESI-10004', step: 'Step 4: Benefits Partner: Verify Docs',    started: '2026-06-15', due: '2026-07-15' },
                      { worker: 'Maria Gonzalez', id: 'ESI-10015', step: 'Step 3: Benefits Partner: Review QLE',     started: '2026-06-14', due: '2026-07-14' },
                      { worker: 'Carmen Lopez',   id: 'ESI-10008', step: 'Step 2: Employee: Elect Plans',           started: '2026-06-01', due: '2026-07-01' },
                    ].slice(0, selected.activeInstances).map((inst, i) => (
                      <tr key={i} className="border-b border-slate-50 last:border-0">
                        <td className="px-4 py-2.5">
                          <p className="text-xs font-medium text-slate-800">{inst.worker}</p>
                          <p className="text-[10px] text-slate-400">{inst.id}</p>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-600">{inst.step}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-500">{inst.started}</td>
                        <td className="px-4 py-2.5">
                          <span className={cn('text-xs font-bold',
                            new Date(inst.due) < new Date() ? 'text-red-600' :
                            Math.ceil((new Date(inst.due).getTime() - Date.now()) / 86400000) <= 7 ? 'text-amber-600' : 'text-slate-600')}>
                            {inst.due}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Workday parallel callout */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-[10px] text-slate-500">
              <strong className="text-slate-700">Workday equivalent:</strong> This maps directly to Workday's
              <em> Business Process Framework</em> — each BP has a Type (Benefits Event, Onboarding, etc.),
              Steps (Action, Approval, To Do, Checklist), routing conditions, and security policies.
              In a live Workday tenant you'd configure this in <em>Business Process → View Business Process Definition</em>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
