'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Users, CheckCircle2, Clock, AlertTriangle,
  ChevronRight, Heart, Building2, Bell, Stethoscope, FileText
} from 'lucide-react'

interface TeamMember {
  name: string
  title: string
  workerId: string
  hireDate: string
  enrollmentState: 'ENROLLED' | 'ELIGIBLE' | 'WAITING' | 'WAIVED'
  plan?: string
  tier?: string
  premium?: number
  daysUntilDeadline?: number
}

interface TimeException {
  id: string
  employeeName: string
  type: string
  date: string
  detail: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

const MAYA_TEAM: TeamMember[] = [
  { name: 'Jordan Rivera',   title: 'HR Solutions Analyst', workerId: 'ESI-10001', hireDate: '2024-01-15', enrollmentState: 'ENROLLED',  plan: 'Cigna PPO Enhanced', tier: 'EF', premium: 189 },
  { name: 'Elena Vasquez',   title: 'Registered Nurse',     workerId: 'ESI-10004', hireDate: '2026-06-01', enrollmentState: 'WAITING',   daysUntilDeadline: 61 },
  { name: 'Marcus Williams', title: 'Registered Nurse',     workerId: 'ESI-10005', hireDate: '2026-03-31', enrollmentState: 'ELIGIBLE',  daysUntilDeadline: 29 },
  { name: 'Chris Patel',     title: 'Medical Tech',         workerId: 'ESI-10006', hireDate: '2025-08-12', enrollmentState: 'ENROLLED',  plan: 'Cigna PPO Base',    tier: 'ES', premium: 94 },
  { name: 'Lisa Tran',       title: 'Care Coordinator',     workerId: 'ESI-10007', hireDate: '2023-11-06', enrollmentState: 'WAIVED' },
]

const PENDING_TIME_EXCEPTIONS: TimeException[] = [
  {
    id: 'te-001',
    employeeName: 'Marcus Williams',
    type: 'Missed Clock-Out',
    date: '2026-06-27',
    detail: 'No clock-out recorded for 12-hr shift · System shows 8 hrs',
    status: 'PENDING',
  },
]

const STATE_CONFIG = {
  ENROLLED: { label: 'Enrolled',  bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
  ELIGIBLE: { label: 'Eligible',  bg: 'bg-blue-100',    text: 'text-blue-700',    icon: Clock },
  WAITING:  { label: 'Waiting',   bg: 'bg-amber-100',   text: 'text-amber-700',   icon: Clock },
  WAIVED:   { label: 'Waived',    bg: 'bg-slate-100',   text: 'text-slate-500',   icon: Heart },
}

interface ManagerDashboardProps {
  workerId: string
  displayName: string
}

export function ManagerDashboard({ workerId: _workerId, displayName }: ManagerDashboardProps) {
  const managerName = displayName || 'Maya Johnson'
  const org = 'Sunrise Post-Acute Care'

  const enrolled = MAYA_TEAM.filter(m => m.enrollmentState === 'ENROLLED').length
  const eligible = MAYA_TEAM.filter(m => m.enrollmentState === 'ELIGIBLE').length
  const waiting  = MAYA_TEAM.filter(m => m.enrollmentState === 'WAITING').length
  const enrollRate = Math.round((enrolled / MAYA_TEAM.length) * 100)

  const urgentMember = MAYA_TEAM.find(m => m.enrollmentState === 'ELIGIBLE' && (m.daysUntilDeadline ?? 99) <= 7)

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-[#1a2332] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-transparent pointer-events-none" />
        <div className="relative">
          <p className="text-slate-400 text-sm">Team Overview</p>
          <h2 className="text-2xl font-bold mt-0.5">{managerName}</h2>
          <p className="text-slate-400 text-sm mt-1">Team Manager · {org}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-slate-300 flex-wrap">
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{MAYA_TEAM.length} direct reports</span>
            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{org}</span>
            <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" />{enrollRate}% enrollment rate</span>
          </div>
        </div>
      </div>

      {/* Urgent alert */}
      {urgentMember && (
        <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-red-800">
            <strong>{urgentMember.name}</strong> has only {urgentMember.daysUntilDeadline} days left in their enrollment window. Encourage them to enroll.
          </div>
          <Link href="/workers" className="text-sm font-semibold text-red-700 underline shrink-0">View →</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{MAYA_TEAM.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Team size</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{enrolled}</p>
          <p className="text-xs text-slate-500 mt-0.5">Enrolled</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{eligible}</p>
          <p className="text-xs text-slate-500 mt-0.5">Eligible – action needed</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{waiting}</p>
          <p className="text-xs text-slate-500 mt-0.5">In waiting period</p>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Team Members — Dental Enrollment</h3>
          <Link href="/workers" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            Full directory <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {MAYA_TEAM.map(member => {
            const cfg = STATE_CONFIG[member.enrollmentState]
            const Icon = cfg.icon
            const hireDateStr = new Date(member.hireDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            return (
              <div key={member.workerId} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                {/* Avatar */}
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                {/* Name + title + hire date */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.title} · Hired {hireDateStr}</p>
                </div>
                {/* Plan info */}
                <div className="hidden sm:block text-right min-w-[120px]">
                  {member.plan ? (
                    <>
                      <p className="text-xs font-medium text-slate-700">{member.plan}</p>
                      <p className="text-xs text-slate-400">{member.tier} · ${member.premium}/mo</p>
                    </>
                  ) : member.daysUntilDeadline !== undefined ? (
                    <p className={cn('text-xs font-medium', member.daysUntilDeadline <= 7 ? 'text-red-600' : 'text-slate-500')}>
                      {member.enrollmentState === 'ELIGIBLE' ? `${member.daysUntilDeadline}d to enroll` : `${member.daysUntilDeadline}d until eligible`}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">—</p>
                  )}
                </div>
                {/* Status badge */}
                <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0', cfg.bg, cfg.text)}>
                  <Icon className="w-3 h-3" />
                  {cfg.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Time Exceptions */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Time Exceptions</h3>
            {PENDING_TIME_EXCEPTIONS.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {PENDING_TIME_EXCEPTIONS.length}
              </span>
            )}
          </div>
          <Link href="/processes" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            All exceptions <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {PENDING_TIME_EXCEPTIONS.length === 0 ? (
          <div className="px-5 py-6 text-center text-sm text-slate-400">No pending time exceptions</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {PENDING_TIME_EXCEPTIONS.map(ex => (
              <div key={ex.id} className="px-5 py-3.5 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{ex.employeeName}
                    <span className="ml-2 text-xs font-normal text-slate-500">— {ex.type}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{ex.detail}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{new Date(ex.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="px-3 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                    Approve
                  </button>
                  <button className="px-3 py-1 text-xs font-semibold border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link href="/workers" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all group">
          <Users className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">Team Directory</p>
          <p className="text-xs text-slate-500 mt-0.5">View all workers</p>
        </Link>
        <Link href="/processes" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-violet-300 hover:shadow-sm transition-all group relative">
          <Bell className="w-5 h-5 text-violet-600 mb-2" />
          <p className="text-sm font-semibold text-slate-900 group-hover:text-violet-600 flex items-center gap-2">
            Approvals
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold">1</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">1 pending action</p>
        </Link>
        <Link href="/reports" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-sm transition-all group">
          <Stethoscope className="w-5 h-5 text-emerald-600 mb-2" />
          <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600">Reports</p>
          <p className="text-xs text-slate-500 mt-0.5">Enrollment metrics</p>
        </Link>
      </div>
    </div>
  )
}
