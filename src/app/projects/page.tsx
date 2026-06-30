'use client'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Project {
  id: string; name: string; dept: string; dueDate: string; owner: string
  ownerInitials: string; pct: number; stage: 'Planning' | 'In Progress' | 'Review' | 'Complete'
  risk: 'Low' | 'Medium' | 'High'; description: string
  milestones: { label: string; done: boolean }[]
  team: string[]
}

const PROJECTS: Project[] = [
  { id: 'P001', name: 'Q3 Open Enrollment Config', dept: 'Benefits', dueDate: 'Jul 28, 2026', owner: 'Nathan Song', ownerInitials: 'NS', pct: 0, stage: 'Planning', risk: 'High', description: 'Configure Workday benefit plans for Q3 open enrollment including health, dental, vision, and FSA elections.', milestones: [{ label: 'Requirements gathering', done: false },{ label: 'Plan configuration in system', done: false },{ label: 'UAT testing', done: false },{ label: 'Go-live', done: false }], team: ['Nathan Song', 'Taylor Chen', 'Maya Johnson'] },
  { id: 'P002', name: 'Position Control Audit', dept: 'Compliance', dueDate: 'Aug 15, 2026', owner: 'Taylor Chen', ownerInitials: 'TC', pct: 10, stage: 'Planning', risk: 'Medium', description: 'Audit all active positions against budget approvals. Identify gaps in position management and cost center alignment.', milestones: [{ label: 'Pull position report', done: true },{ label: 'Reconcile with budget', done: false },{ label: 'Flag exceptions', done: false },{ label: 'Management review', done: false }], team: ['Taylor Chen', 'Nathan Song'] },
  { id: 'P003', name: 'New Hire Process Optimization', dept: 'HR Ops', dueDate: 'Jul 31, 2026', owner: 'Maya Johnson', ownerInitials: 'MJ', pct: 65, stage: 'In Progress', risk: 'Low', description: 'Redesign the new hire onboarding workflow to reduce time-to-productivity. Includes benefits trigger automation.', milestones: [{ label: 'Current state process map', done: true },{ label: 'Gap analysis', done: true },{ label: 'Future state design', done: true },{ label: 'System configuration', done: false },{ label: 'Pilot and rollout', done: false }], team: ['Maya Johnson', 'Jordan Rivera', 'Nathan Song'] },
  { id: 'P004', name: 'Security Role Remediation', dept: 'IT/Compliance', dueDate: 'Jul 21, 2026', owner: 'Nathan Song', ownerInitials: 'NS', pct: 40, stage: 'In Progress', risk: 'High', description: 'Audit finds users with unnecessary system access. Remediate security roles and document permission matrix.', milestones: [{ label: 'Security audit pull', done: true },{ label: 'Identify violations', done: true },{ label: 'Remove excess access', done: false },{ label: 'Document and sign off', done: false }], team: ['Nathan Song', 'Taylor Chen'] },
  { id: 'P005', name: 'Worker Data Quality Audit', dept: 'Data Quality', dueDate: 'Jun 28, 2026', owner: 'Jordan Rivera', ownerInitials: 'JR', pct: 90, stage: 'Review', risk: 'Low', description: 'Identify and correct inconsistent worker records across all facilities. Produce data quality scorecard.', milestones: [{ label: 'Data extraction', done: true },{ label: 'Exception identification', done: true },{ label: 'Correction workflow', done: true },{ label: 'Leadership review', done: false }], team: ['Jordan Rivera', 'Nathan Song', 'Taylor Chen'] },
  { id: 'P006', name: 'Dental Enrollment Migration', dept: 'Benefits', dueDate: 'Jun 15, 2026', owner: 'Taylor Chen', ownerInitials: 'TC', pct: 100, stage: 'Complete', risk: 'Low', description: 'Migrated dental enrollment data from legacy system. All records validated and confirmed with Cigna.', milestones: [{ label: 'Data mapping', done: true },{ label: 'Migration run', done: true },{ label: 'Validation', done: true },{ label: 'Carrier confirmation', done: true }], team: ['Taylor Chen', 'Nathan Song'] },
]

const STAGES = ['Planning', 'In Progress', 'Review', 'Complete'] as const

export default function ProjectsPage() {
  const [selected, setSelected] = useState<Project | null>(null)

  const riskColor = { Low: 'bg-emerald-100 text-emerald-700', Medium: 'bg-amber-100 text-amber-700', High: 'bg-red-100 text-red-700' }
  const stageColor = { Planning: 'bg-slate-100 text-slate-600', 'In Progress': 'bg-blue-100 text-blue-700', Review: 'bg-amber-100 text-amber-700', Complete: 'bg-emerald-100 text-emerald-700' }

  return (
    <AppShell pageTitle="Projects" pageSubtitle="HR initiatives, HRIS configuration, and compliance projects">
      <div className="flex gap-5">
        {/* Kanban board */}
        <div className="flex-1 grid grid-cols-2 xl:grid-cols-4 gap-4">
          {STAGES.map(stage => {
            const stageProjects = PROJECTS.filter(p => p.stage === stage)
            return (
              <div key={stage}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide', stageColor[stage])}>{stage}</span>
                  <span className="text-xs text-slate-400">{stageProjects.length}</span>
                </div>
                <div className="space-y-3">
                  {stageProjects.map(p => (
                    <button key={p.id} onClick={() => setSelected(p)} className={cn('w-full text-left bg-white border rounded-xl p-4 hover:shadow-md transition-all', selected?.id === p.id ? 'border-violet-400 ring-1 ring-violet-300' : 'border-slate-200')}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-semibold text-slate-900 text-sm leading-tight">{p.name}</p>
                        <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0', riskColor[p.risk])}>{p.risk}</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p.dept}</span>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Progress</span><span>{p.pct}%</span></div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', p.pct === 100 ? 'bg-emerald-500' : p.pct >= 50 ? 'bg-blue-500' : 'bg-violet-500')} style={{ width: `${p.pct}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                        <span>Due {p.dueDate}</span>
                        <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 font-bold text-[10px]">{p.ownerInitials}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-72 shrink-0 bg-white border border-slate-200 rounded-xl p-5 h-fit sticky top-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase">{selected.dept}</span>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{selected.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{selected.description}</p>
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between"><span className="text-slate-400">Owner</span><span className="font-medium">{selected.owner}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Due</span><span className="font-medium">{selected.dueDate}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Progress</span><span className="font-medium">{selected.pct}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Risk</span><span className={cn('font-semibold', { Low:'text-emerald-600',Medium:'text-amber-600',High:'text-red-600' }[selected.risk])}>{selected.risk}</span></div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Milestones</p>
              <div className="space-y-1.5">
                {selected.milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className={cn('w-4 h-4 rounded-full flex items-center justify-center shrink-0 border', m.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300')}>
                      {m.done && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className={m.done ? 'line-through text-slate-400' : 'text-slate-700'}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Team</p>
              <div className="flex gap-1 flex-wrap">
                {selected.team.map(name => (
                  <span key={name} className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{name}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
