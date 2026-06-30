'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { UserRole } from '@/types'
import { Bell, Search, HelpCircle } from 'lucide-react'
import { RoleContext, EMPLOYEE_ROLES } from '@/lib/role-context'
import { ROLE_LABELS } from '@/types'
import { createClient } from '@/lib/supabase/client'

// Fallback personas for "View As" impersonation (HRIS_ANALYST only)
const ROLE_PERSONAS: Record<UserRole, { name: string; employeeId: string }> = {
  EMPLOYEE:         { name: 'Jordan Rivera',  employeeId: 'ESI-10001' },
  MANAGER:          { name: 'Maya Johnson',   employeeId: 'ESI-10009' },
  BENEFITS_PARTNER: { name: 'Taylor Chen',    employeeId: 'ESI-10002' },
  HRIS_ANALYST:     { name: 'Nathan Song',    employeeId: 'ESI-10000' },
  HR_LEADERSHIP:    { name: 'Morgan Walsh',   employeeId: 'ESI-10003' },
}

interface AppShellProps {
  children: React.ReactNode
  pageTitle?: string
  pageSubtitle?: string
}

export function AppShell({ children, pageTitle, pageSubtitle }: AppShellProps) {
  const router = useRouter()
  const supabase = createClient()

  // Session-derived identity
  const [sessionRole, setSessionRole] = useState<UserRole>('EMPLOYEE')
  const [sessionName, setSessionName] = useState('Loading...')
  const [sessionId, setSessionId] = useState('')
  const [isHrisAnalyst, setIsHrisAnalyst] = useState(false)

  // Current view role — HRIS Analyst can switch to "View As" other roles
  const [currentRole, setCurrentRole] = useState<UserRole>('EMPLOYEE')
  const [viewName, setViewName] = useState('Loading...')
  const [viewId, setViewId] = useState('')

  useEffect(() => {
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const meta = session.user.user_metadata
      const role = (meta?.role as UserRole) || 'EMPLOYEE'
      const name = meta?.display_name || session.user.email || 'User'
      const workerId = meta?.worker_id || session.user.id.slice(0, 8).toUpperCase()

      setSessionRole(role)
      setSessionName(name)
      setSessionId(workerId)
      setIsHrisAnalyst(role === 'HRIS_ANALYST')

      // Default view = own role (HRIS Analyst can switch later)
      setCurrentRole(role)
      setViewName(name)
      setViewId(workerId)
    }
    loadSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleRoleChange(role: UserRole) {
    // Only HRIS Analyst can impersonate other roles
    if (!isHrisAnalyst) return
    const persona = ROLE_PERSONAS[role]
    setCurrentRole(role)
    setViewName(persona.name)
    setViewId(persona.employeeId)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole: handleRoleChange }}>
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        currentRole={currentRole}
        workerName={viewName}
        employeeId={viewId}
        // Only show role switcher to HRIS Analyst (impersonation)
        onRoleChange={isHrisAnalyst ? handleRoleChange : undefined}
        onLogout={handleLogout}
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

          {/* Impersonation indicator for HRIS Analyst */}
          {isHrisAnalyst && currentRole !== sessionRole && (
            <span className="text-[10px] font-semibold bg-violet-100 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
              Viewing as {ROLE_LABELS[currentRole]}
            </span>
          )}

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
