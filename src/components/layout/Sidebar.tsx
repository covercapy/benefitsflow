'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserRole, ROLE_LABELS } from '@/types'
import {
  LayoutDashboard, Users, Heart, FileText, BarChart3,
  Settings, Shield, Bell, Building2, ChevronRight,
  Stethoscope, Eye, DollarSign, ClipboardList, Calculator
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles?: UserRole[]
  badge?: number
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Benefits', href: '/enroll', icon: Heart, roles: ['EMPLOYEE','MANAGER'] },
  { label: 'Workers', href: '/workers', icon: Users, roles: ['BENEFITS_PARTNER','HRIS_ANALYST','HR_LEADERSHIP','MANAGER'] },
  { label: 'Dental Enrollment', href: '/enroll/dental', icon: Stethoscope },
  { label: 'Cost Estimator', href: '/enroll/estimator', icon: Calculator },
  { label: 'Vision', href: '/enroll/vision', icon: Eye },
  { label: 'FSA / HSA', href: '/enroll/fsa', icon: DollarSign },
  { label: 'Inbox', href: '/inbox', icon: Bell, badge: 3 },
  { label: 'Reports', href: '/reports', icon: BarChart3, roles: ['BENEFITS_PARTNER','HRIS_ANALYST','HR_LEADERSHIP'] },
  { label: 'Audit Log', href: '/audit', icon: Shield, roles: ['HRIS_ANALYST','HR_LEADERSHIP'] },
  { label: 'Organizations', href: '/organizations', icon: Building2, roles: ['HRIS_ANALYST','HR_LEADERSHIP'] },
  { label: 'Process Center', href: '/processes', icon: ClipboardList, roles: ['BENEFITS_PARTNER','HRIS_ANALYST','HR_LEADERSHIP'] },
]

interface SidebarProps {
  currentRole: UserRole
  workerName: string
  employeeId: string
  onRoleChange?: (role: UserRole) => void
}

export function Sidebar({ currentRole, workerName, employeeId, onRoleChange }: SidebarProps) {
  const pathname = usePathname()

  const visibleItems = navItems.filter(item =>
    !item.roles || item.roles.includes(currentRole)
  )

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
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
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
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {visibleItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-nav-item', isActive && 'active')}
            >
              <Icon className="icon" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          BenefitsFlow HRIS Lab · Fictional data only<br />
          Not affiliated with Ensign, Workday, Cigna, or Delta Dental
        </p>
      </div>
    </aside>
  )
}
