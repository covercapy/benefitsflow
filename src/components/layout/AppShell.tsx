'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { UserRole } from '@/types'
import { Bell, Search, Sun, Moon, Calendar } from 'lucide-react'
import { RoleContext } from '@/lib/role-context'
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

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole: () => {}, viewWorkerId: viewId, viewDisplayName: viewName }}>
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

          {/* Search bar — right side */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-52">
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
