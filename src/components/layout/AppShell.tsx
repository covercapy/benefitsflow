'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { UserRole, ROLE_LABELS } from '@/types'
import { Bell, Search, HelpCircle, Sun, Moon } from 'lucide-react'
import { RoleContext, EMPLOYEE_ROLES } from '@/lib/role-context'
import { createClient } from '@/lib/supabase/client'
import { ThemeProvider, useTheme } from '@/lib/theme-context'


interface AppShellProps {
  children: React.ReactNode
  pageTitle?: string
  pageSubtitle?: string
}

interface AppShellInnerProps extends AppShellProps {
  currentRole: UserRole
  viewName: string
  viewId: string
  handleLogout: () => void
}

function AppShellInner({
  children, pageTitle, pageSubtitle,
  currentRole, viewName, viewId,
  handleLogout,
}: AppShellInnerProps) {
  const { theme, toggle } = useTheme()
  const bgCls = theme === 'dark' ? 'bg-slate-50' : 'bg-[#f8f7fc]'

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole: () => {}, viewWorkerId: viewId, viewDisplayName: viewName }}>
    <div className={`flex min-h-screen ${bgCls}`}>
      <Sidebar
        currentRole={currentRole}
        workerName={viewName}
        employeeId={viewId}
        onLogout={handleLogout}
        theme={theme}
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

          {/* Theme toggle */}
          <button onClick={toggle} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500" title="Toggle skin">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

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

export function AppShell({ children, pageTitle, pageSubtitle }: AppShellProps) {
  const supabase = createClient()

  // Current view role
  const [currentRole, setCurrentRole] = useState<UserRole>('EMPLOYEE')
  const [viewName, setViewName] = useState('Loading...')
  const [viewId, setViewId] = useState('')

  useEffect(() => {
    async function loadSession() {
      let response: Response
      try {
        response = await fetch('/api/session', { cache: 'no-store' })
      } catch {
        // Network error — don't immediately boot; just show loading state
        return
      }
      if (!response.ok) {
        // Only redirect if we're sure the user isn't in cookie-session mode.
        // Cookie sessions will now return 200 from /api/session after the fix.
        // A genuine 401 here means truly unauthenticated.
        window.location.href = '/login'
        return
      }

      const { profile } = await response.json()
      const role = profile.primary_role as UserRole
      const name = profile.display_name as string
      const workerId = profile.worker_id as string
      setCurrentRole(role)
      setViewName(name)
      setViewId(workerId)
    }
    void loadSession()
  }, [])

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
        viewName={viewName}
        viewId={viewId}
        handleLogout={handleLogout}
      >
        {children}
      </AppShellInner>
    </ThemeProvider>
  )
}
