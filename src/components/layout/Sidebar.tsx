'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'
import { Theme } from '@/lib/theme-context'
import {
  LayoutDashboard, User, Users, Calendar, FolderOpen,
  Clock, BarChart3, DollarSign, Heart, FileText,
  Link2, Receipt, Settings, HelpCircle, Shield,
  LogOut, Building2
} from 'lucide-react'

interface NavItem { label: string; href: string; icon: React.ElementType; badge?: number }

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard',    href: '/dashboard',  icon: LayoutDashboard },
      { label: 'Employee',     href: '/employees',  icon: User },
      { label: 'Calendar',     href: '/calendar',   icon: Calendar },
      { label: 'Projects',     href: '/projects',   icon: FolderOpen },
      { label: 'Team Member',  href: '/workers',    icon: Users },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Time off',     href: '/time-off',   icon: Clock },
      { label: 'Reports',      href: '/reports',    icon: BarChart3 },
      { label: 'Payrolls',     href: '/payroll',    icon: DollarSign },
      { label: 'Benefits',     href: '/enroll',     icon: Heart },
    ],
  },
  {
    label: 'Company',
    items: [
      { label: 'Documents',    href: '/documents',  icon: FileText },
      { label: 'Integrations', href: '/integrations', icon: Link2 },
      { label: 'Invoices',     href: '/invoices',   icon: Receipt },
      { label: 'Settings',     href: '/settings',   icon: Settings },
      { label: 'Help & Center',href: '/help',       icon: HelpCircle },
    ],
  },
]

interface SidebarProps {
  currentRole: UserRole
  workerName: string
  employeeId: string
  onLogout?: () => void
  theme?: Theme
}

export function Sidebar({ currentRole, workerName, employeeId, onLogout, theme = 'dark' }: SidebarProps) {
  const pathname = usePathname()
  const isLight = theme === 'light'
  const isHR = ['BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP'].includes(currentRole)

  function NavLink({ item }: { item: NavItem }) {
    const Icon = item.icon
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')) || (item.href === '/enroll' && pathname.startsWith('/enroll'))
    if (isLight) {
      return (
        <Link href={item.href} className={cn(
          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
          isActive
            ? 'bg-violet-50 text-violet-700 border-l-2 border-violet-600 font-semibold rounded-l-none'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        )}>
          <Icon className="w-4 h-4 shrink-0" />
          <span className="flex-1">{item.label}</span>
          {item.badge && <span className="bg-violet-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{item.badge}</span>}
        </Link>
      )
    }
    return (
      <Link href={item.href} className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
        isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
      )}>
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1">{item.label}</span>
        {item.badge && <span className="bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{item.badge}</span>}
      </Link>
    )
  }

  // sidebar container styles
  const sidebarCls = isLight
    ? 'flex flex-col w-60 min-h-screen bg-white border-r border-slate-200 text-slate-900 shrink-0'
    : 'flex flex-col w-60 min-h-screen bg-[#1a2332] text-white shrink-0'

  const logoBorderCls = isLight ? 'border-b border-slate-100' : 'border-b border-white/10'
  const profileBorderCls = isLight ? 'border-b border-slate-100' : 'border-b border-white/10'
  const sectionLabelCls = isLight ? 'text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1.5' : 'text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1.5'
  const footerCls = isLight ? 'px-4 py-3 border-t border-slate-100 space-y-2' : 'px-4 py-3 border-t border-white/10 space-y-2'
  const logoutCls = isLight
    ? 'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all'
    : 'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all'
  const disclaimerCls = isLight ? 'text-[10px] text-slate-400 text-center leading-relaxed' : 'text-[10px] text-slate-600 text-center leading-relaxed'
  const avatarBg = isHR ? 'bg-violet-600' : currentRole === 'MANAGER' ? 'bg-emerald-600' : 'bg-blue-600'
  const nameCls = isLight ? 'text-sm font-medium text-slate-900 truncate' : 'text-sm font-medium text-white truncate'
  const idCls = isLight ? 'text-xs text-slate-400' : 'text-xs text-slate-400'
  return (
    <aside className={sidebarCls}>
      {/* Logo */}
      <div className={cn('px-5 py-5', logoBorderCls)}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <p className={cn('font-bold text-sm leading-tight', isLight ? 'text-slate-900' : 'text-white')}>BenefitsFlow</p>
            <p className={cn('text-[10px] leading-tight', isLight ? 'text-slate-400' : 'text-slate-400')}>HRIS Lab · Demo</p>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className={cn('px-4 py-3', profileBorderCls)}>
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0', avatarBg)}>
            {workerName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className={cn(nameCls)}>{workerName}</p>
            <p className={idCls}>{employeeId}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <p className={sectionLabelCls}>{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map(item => <NavLink key={item.href} item={item} />)}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={footerCls}>
        {onLogout && (
          <button onClick={onLogout} className={logoutCls}>
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        )}
        <p className={disclaimerCls}>BenefitsFlow HRIS Lab · Fictional data only</p>
      </div>
    </aside>
  )
}
