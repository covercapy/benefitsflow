'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { UserRole, ROLE_LABELS } from '@/types'
import { Bell, Search, Sun, Moon, Calendar, Eye } from 'lucide-react'
import { RoleContext } from '@/lib/role-context'
import { createClient } from '@/lib/supabase/client'
import { ThemeProvider, useTheme } from '@/lib/theme-context'

// HRIS Analyst can impersonate any role to preview the experience
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

interface AppShellInnerProps extends AppShellProps {
  currentRole: UserRole
  sessionRole: UserRole
  isHrisAnalyst: boolean
  viewName: string
  viewId: string
  handleRoleChange: (role: UserRole) => void
  handleLogout: () => void
}

function AppShellInner({
  children, pageTitle, pageSubtitle,
  currentRole, sessionRole, isHrisAnalyst,
  viewName, viewId,
  handleRoleChange, handleLogout,
}: AppShellInnerProps) {
  const { theme, toggle } = useTheme()
  const bgCls = 'bg-[#f5f5fa]'

  function getGreeting(name: string): string {
    const h = new Date().getHours()
    const timeGreeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
    const firstName = name.split(' ')[0] || name
    return `${timeGreeting}, ${firstName}!`
  }

  function getGreetingEmoji(): string {
    const h = new Date().getHours()
    return h < 12 ? '☀️' : h < 17 ? '🌤️' : '🌙'
  }

  const isImpersonating = isHrisAnalyst && currentRole !== sessionRole

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole: handleRoleChange, viewWorkerId: viewId, viewDisplayName: viewName }}>
    <div className={`flex min-h-screen ${bgCls}`}>
      <Sidebar
        currentRole={currentRole}
        workerName={viewName}
        employeeId={viewId}
        onLogout={handleLogout}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center px-6 gap-4 shrink-0">
          {/* Personalized greeting */}
          <div className="flex items-center gap-2">
            <span className="text-lg">{getGreetingEmoji()}</span>
            <h2 className="text-sm font-semibold text-slate-800">
              {viewName && viewName !== 'Loading...' ? getGreeting(viewName) : 'Welcome to BenefitsFlow'}
            </h2>
          </div>

          <div className="flex-1" />

          {/* View As — HRIS Analyst only */}
          {isHrisAnalyst && (
            <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-lg px-3 py-1.5">
              <Eye className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              <span className="text-[11px] font-semibold text-violet-600 shrink-0">View as:</span>
              <select
                value={currentRole}
                onChange={e => handleRoleChange(e.target.value as UserRole)}
                className="text-xs text-violet-700 font-semibold bg-transparent outline-none cursor-pointer"
              >
                {(Object.keys(ROLE_LABELS) as UserRole[]).map(role => (
                  <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                ))}
              </select>
              {isImpersonating && (
                <button
                  onClick={() => handleRoleChange(sessionRole)}
                  className="text-[10px] font-bold text-violet-500 hover:text-violet-700 border border-violet-300 rounded px-1.5 py-0.5 hover:bg-violet-100 transition-colors ml-1"
                >
                  Reset
                </button>
              )}
            </div>
          )}

          {/* Search bar — right side */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search anything"
              className="bg-transparent text-xs text-slate-600 placeholder-slate-400 flex-1 outline-none min-w-0"
            />
            <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded shrink-0">⌘F</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Calendar icon */}
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <Calendar className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
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

export function AppShell({ children, pageTitle, pageSubtitle }: AppShellProps) {
  const supabase = createClient()

  // Session-derived identity (never changes after load)
  const [sessionRole, setSessionRole] = useState<UserRole>('EMPLOYEE')
  const [sessionName, setSessionName] = useState('Loading...')
  const [sessionId, setSessionId] = useState('')
  const [isHrisAnalyst, setIsHrisAnalyst] = useState(false)

  // Current view (HRIS Analyst can impersonate other roles)
  const [currentRole, setCurrentRole] = useState<UserRole>('EMPLOYEE')
  const [viewName, setViewName] = useState('Loading...')
  const [viewId, setViewId] = useState('')

  useEffect(() => {
    async function loadSession() {
      let response: Response
      try {
        response = await fetch('/api/session', { cache: 'no-store' })
      } catch {
        return
      }
      if (!response.ok) {
        window.location.href = '/login'
        return
      }

      const { profile } = await response.json()
      const role = profile.primary_role as UserRole
      const name = profile.display_name as string
      const workerId = profile.worker_id as string

      setSessionRole(role)
      setSessionName(name)
      setSessionId(workerId)
      setIsHrisAnalyst(role === 'HRIS_ANALYST')

      setCurrentRole(role)
      setViewName(name)
      setViewId(workerId)
    }
    void loadSession()
  }, [])

  function handleRoleChange(role: UserRole) {
    // Only HRIS Analyst may switch the view — all others are locked to their session role
    if (!isHrisAnalyst) return
    if (role === sessionRole) {
      // Restore to own identity
      setCurrentRole(sessionRole)
      setViewName(sessionName)
      setViewId(sessionId)
    } else {
      const persona = ROLE_PERSONAS[role]
      setCurrentRole(role)
      setViewName(persona.name)
      setViewId(persona.employeeId)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <ThemeProvider>
      <AppShellInner
        pageTitle={pageTitle}
        pageSubtitle={pageSubtitle}
        currentRole={currentRole}
        sessionRole={sessionRole}
        isHrisAnalyst={isHrisAnalyst}
        viewName={viewName}
        viewId={viewId}
        handleRoleChange={handleRoleChange}
        handleLogout={handleLogout}
      >
        {children}
      </AppShellInner>
    </ThemeProvider>
  )
}
