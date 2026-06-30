'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserRole, ROLE_LABELS } from '@/types'
import {
  LayoutDashboard, Users, Heart, BarChart3,
  Shield, Bell, Building2,
  Stethoscope, Eye, DollarSign, ClipboardList, Calculator, LogOut
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

// ── Personal enrollment nav (blue) — shown to all roles ─────
const PERSONAL_NAV: NavItem[] = [
  { label: 'Dashboard',        href: '/dashboard',        icon: LayoutDashboard },
  { label: 'My Benefits',      href: '/enroll',           icon: Heart },
  { label: 'Dental Enrollment',href: '/enroll/dental',    icon: Stethoscope },
  { label: 'Cost Estimator',   href: '/enroll/estimator', icon: Calculator },
  { label: 'Vision',           href: '/enroll/vision',    icon: Eye },
  { label: 'FSA / HSA',        href: '/enroll/fsa',       icon: DollarSign },
  { label: 'Inbox',            href: '/inbox',            icon: Bell, badge: 3 },
]

// ── Admin / HR nav (purple) — shown to HR roles only ────────
const ADMIN_NAV: NavItem[] = [
  { label: 'Workers',          href: '/workers',          icon: Users },
  { label: 'Reports',          href: '/reports',          icon: BarChart3 },
  { label: 'Organizations',    href: '/organizations',    icon: Building2 },
  { label: 'Process Center',   href: '/processes',        icon: ClipboardList },
  { label: 'Audit Log',        href: '/audit',            icon: Shield },
]

const HR_ROLES: UserRole[] = ['BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP']
const MANAGER_ADMIN: NavItem[] = [
  { label: 'Workers',          href: '/workers',          icon: Users },
]

interface SidebarProps {
  currentRole: UserRole
  workerName: string
  employeeId: string
  onRoleChange?: (role: UserRole) => void
  onLogout?: () => void
}

export function Sidebar({ currentRole, workerName, employeeId, onRoleChange, onLogout }: SidebarProps) {
  const pathname = usePathname()

  const isHR = HR_ROLES.includes(currentRole)
  const isManager = currentRole === 'MANAGER'

  // Admin items visible to this role
  const adminItems = isHR
    ? ADMIN_NAV
    : isManager
    ? MANAGER_ADMIN
    : []

  // Filter admin-only items from personal nav for pure employee view
  const personalItems = PERSONAL_NAV.filter(item => {
    // Managers get My Benefits + Inbox but not enrollment wizard steps
    if (isManager && ['/enroll', '/enroll/dental', '/enroll/vision', '/enroll/fsa', '/enroll/estimator'].includes(item.href)) return false
    return true
  })

  function NavLink({ item, variant }: { item: NavItem; variant: 'personal' | 'admin' }) {
    const Icon = item.icon
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
          isActive
            ? variant === 'admin'
              ? 'bg-violet-600 text-white'
              : 'bg-blue-600 text-white'
            : variant === 'admin'
            ? 'text-violet-200 hover:bg-violet-900/40 hover:text-white'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-[#1a2332] text-white shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-tight">BenefitsFlow</p>
            <p className="text-[10px] text-slate-400 leading-tight">HRIS Lab · Demo</p>
          </div>
        </div>
      </div>

      {/* Worker Profile */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0',
            isHR ? 'bg-violet-600' : isManager ? 'bg-emerald-600' : 'bg-blue-600'
          )}>
            {workerName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{workerName}</p>
            <p className="text-xs text-slate-400">{employeeId}</p>
          </div>
        </div>
      </div>

      {/* Role Switcher */}
      {onRoleChange && (
        <div className="px-4 py-2 border-b border-white/10">
          <label className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">View As</label>
          <select
            value={currentRole}
            onChange={e => onRoleChange(e.target.value as UserRole)}
            className="mt-1 w-full bg-[#243447] text-slate-200 text-xs rounded-md px-2 py-1.5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {(Object.keys(ROLE_LABELS) as UserRole[]).map(role => (
              <option key={role} value={role}>{ROLE_LABELS[role]}</option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">

        {/* Personal section — blue */}
        <div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1.5">
            My Workspace
          </p>
          <div className="space-y-0.5">
            {personalItems.map(item => (
              <NavLink key={item.href} item={item} variant="personal" />
            ))}
          </div>
        </div>

        {/* Admin section — purple, only for HR/Manager */}
        {adminItems.length > 0 && (
          <div>
            <p className="text-[9px] font-bold text-violet-400 uppercase tracking-widest px-3 mb-1.5">
              {isHR ? 'HR Administration' : 'Team Management'}
            </p>
            <div className="space-y-0.5">
              {adminItems.map(item => (
                <NavLink key={item.href} item={item} variant="admin" />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 space-y-2">
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        )}
        <p className="text-[10px] text-slate-600 text-center leading-relaxed">
          BenefitsFlow HRIS Lab · Fictional data only
        </p>
      </div>
    </aside>
  )
}
