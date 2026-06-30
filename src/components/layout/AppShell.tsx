'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { UserRole } from '@/types'
import { Bell, Search, HelpCircle } from 'lucide-react'
import { RoleContext, EMPLOYEE_ROLES } from '@/lib/role-context'
import { ROLE_LABELS } from '@/types'

// Role-based personas — name + ID change when role switches
const ROLE_PERSONAS: Record<UserRole, { name: string; employeeId: string }> = {
  EMPLOYEE:         { name: 'Jordan Rivera',  employeeId: 'ESI-10001' },
  MANAGER:          { name: 'Lisa Park',       employeeId: 'ESI-10009' },
  BENEFITS_PARTNER: { name: 'Taylor Chen',     employeeId: 'ESI-10002' },
  HRIS_ANALYST:     { name: 'Nathan Song',      employeeId: 'ESI-10000' },
  HR_LEADERSHIP:    { name: 'Morgan Walsh',    employeeId: 'ESI-10003' },
}

interface AppShellProps {
  children: React.ReactNode
  pageTitle?: string
  pageSubtitle?: string
}

export function AppShell({ children, pageTitle, pageSubtitle }: AppShellProps) {
  const [currentRole, setCurrentRole] = useState<UserRole>('HRIS_ANALYST')
  const persona = ROLE_PERSONAS[currentRole]

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole: setCurrentRole }}>
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        currentRole={currentRole}
        workerName={persona.name}
        employeeId={persona.employeeId}
        onRoleChange={setCurrentRole}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 shrink-0">
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search workers, benefits, reports..."
              className="bg-transparent text-sm text-slate-600 placeholder-slate-400 flex-1 outline-none"
            />
          </div>

          <div className="flex-1" />

          {/* Role badge */}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
            EMPLOYEE_ROLES.includes(currentRole)
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
              : 'bg-blue-100 text-blue-700 border-blue-200'
          }`}>
            {ROLE_LABELS[currentRole]}
          </span>

          {/* Demo badge */}
          <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Portfolio Demo · Fictional Data
          </span>

          {/* Notifications */}
          <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>

          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
            <HelpCircle className="w-4 h-4" />
          </button>
        </header>

        {/* Page header */}
        {(pageTitle || pageSubtitle) && (
          <div className="px-6 pt-6 pb-2">
            {pageTitle && <h1 className="text-xl font-semibold text-slate-900">{pageTitle}</h1>}
            {pageSubtitle && <p className="text-sm text-slate-500 mt-0.5">{pageSubtitle}</p>}
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 px-6 py-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
    </RoleContext.Provider>
  )
}
