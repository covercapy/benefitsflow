'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'
import {
  LayoutDashboard, User, Users, Calendar,
  Clock, BarChart3, DollarSign, Heart, FileText,
  Link2, Receipt, Settings, HelpCircle,
  LogOut, Plus, Briefcase, Star, Zap, Smile,
  Mail, CheckSquare, Eye, Wallet
} from 'lucide-react'

interface NavItem { label: string; href: string; icon: React.ElementType; badge?: number }
interface NavSection { label: string; items: NavItem[] }

function getNavSections(role: UserRole, inboxCount?: number): NavSection[] {
  if (role === 'EMPLOYEE') {
    return [
      {
        label: 'MY WORKSPACE',
        items: [
          { label: 'Dashboard',         href: '/dashboard',         icon: LayoutDashboard },
          { label: 'My Benefits',        href: '/enroll',            icon: Heart },
          { label: 'Dental Enrollment',  href: '/enroll/dental',     icon: CheckSquare },
          { label: 'Cost Estimator',     href: '/enroll/estimator',  icon: DollarSign },
          { label: 'Vision',             href: '/enroll/vision',     icon: Eye },
          { label: 'FSA / HSA',          href: '/enroll/fsa',        icon: Wallet },
          {
            label: 'Inbox',
            href: '/inbox',
            icon: Mail,
            ...(inboxCount && inboxCount > 0 ? { badge: inboxCount } : {}),
          },
        ],
      },
    ]
  }

  if (role === 'MANAGER') {
    return [
      {
        label: 'WORKSPACE',
        items: [
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { label: 'My Team',   href: '/workers',   icon: Users },
          { label: 'Approvals', href: '/processes', icon: CheckSquare },
          { label: 'Reports',   href: '/reports',   icon: BarChart3 },
        ],
      },
      {
        label: 'PERSONAL',
        items: [
          { label: 'My Benefits', href: '/enroll', icon: Heart },
          {
            label: 'Inbox',
            href: '/inbox',
            icon: Mail,
            ...(inboxCount && inboxCount > 0 ? { badge: inboxCount } : {}),
          },
        ],
      },
    ]
  }

  // HR / Analyst roles: HRIS_ANALYST, BENEFITS_PARTNER, HR_LEADERSHIP
  return [
    {
      label: 'MAIN',
      items: [
        { label: 'Dashboard',   href: '/dashboard',  icon: LayoutDashboard },
        { label: 'Employee',    href: '/employees',  icon: User },
        { label: 'Calendar',    href: '/calendar',   icon: Calendar },
        { label: 'Team Member', href: '/workers',    icon: Users },
      ],
    },
    {
      label: 'MANAGEMENT',
      items: [
        { label: 'Time off',  href: '/time-off', icon: Clock },
        { label: 'Reports',   href: '/reports',  icon: BarChart3 },
        { label: 'Payrolls',  href: '/payroll',  icon: DollarSign },
        { label: 'Benefits',  href: '/enroll',   icon: Heart },
      ],
    },
    {
      label: 'COMPANY',
      items: [
        { label: 'Documents',    href: '/documents',    icon: FileText },
        { label: 'Integrations', href: '/integrations', icon: Link2 },
        { label: 'Invoices',     href: '/invoices',     icon: Receipt },
        { label: 'Settings',     href: '/settings',     icon: Settings },
        { label: 'Help & Center',href: '/help',         icon: HelpCircle },
      ],
    },
  ]
}

// Decorative icon rail app buttons — visual only, for demo
const RAIL_APPS = [
  { color: 'bg-violet-500', icon: Heart, label: 'Benefits' },
  { color: 'bg-emerald-500', icon: Briefcase, label: 'Payroll' },
  { color: 'bg-orange-400', icon: Star, label: 'Reports' },
  { color: 'bg-sky-500', icon: Zap, label: 'Automations' },
  { color: 'bg-rose-400', icon: Smile, label: 'Team' },
]

interface SidebarProps {
  currentRole: UserRole
  workerName: string
  employeeId: string
  onLogout?: () => void
}

export function Sidebar({ currentRole, workerName, employeeId, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const isHR = ['BENEFITS_PARTNER', 'HRIS_ANALYST', 'HR_LEADERSHIP'].includes(currentRole)
  const navSections = getNavSections(currentRole)

  const avatarBg = isHR
    ? 'bg-violet-600'
    : currentRole === 'MANAGER'
    ? 'bg-emerald-600'
    : 'bg-blue-500'

  const initials = workerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  function NavLink({ item }: { item: NavItem }) {
    const Icon = item.icon
    const isActive =
      pathname === item.href ||
      (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')) ||
      (item.href === '/enroll' && pathname.startsWith('/enroll'))

    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all',
          isActive
            ? 'bg-violet-50 text-violet-700 font-semibold'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        )}
      >
        <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-violet-600' : 'text-slate-400')} />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="bg-violet-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <div className="flex min-h-screen shrink-0">
      {/* ── Icon Rail ─────────────────────────────── */}
      <div className="w-[62px] bg-[#f4f4f5] border-r border-slate-200 flex flex-col items-center py-4 gap-3">
        {/* BenefitsFlow brand icon */}
        <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center mb-2 shadow-sm">
          <Heart className="w-4 h-4 text-white fill-white" />
        </div>

        {/* App icons */}
        {RAIL_APPS.map(app => (
          <button
            key={app.label}
            title={app.label}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 hover:shadow-md',
              app.color
            )}
          >
            <app.icon className="w-4 h-4 text-white" />
          </button>
        ))}

        <div className="flex-1" />

        {/* Add button */}
        <button
          title="Add workspace"
          className="w-9 h-9 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-violet-400 hover:text-violet-500 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* User avatar */}
        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm', avatarBg)}>
          {initials}
        </div>
      </div>

      {/* ── Text Sidebar ──────────────────────────── */}
      <aside className="w-[220px] bg-white border-r border-slate-200 flex flex-col min-h-screen">
        {/* Logo + app name */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <div>
            <p className="font-bold text-sm text-slate-900 leading-tight">BenefitsFlow</p>
            <p className="text-[10px] text-slate-400 leading-tight">HRIS · Demo Environment</p>
          </div>
        </div>

        {/* Profile row */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0', avatarBg)}>
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate leading-tight">{workerName}</p>
              <p className="text-[11px] text-slate-400 truncate">{employeeId}</p>
            </div>
          </div>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-5">
          {navSections.map(section => (
            <div key={section.label}>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1.5">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 space-y-2">
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          )}
          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            BenefitsFlow HRIS Lab · Fictional data
          </p>
        </div>
      </aside>
    </div>
  )
}
