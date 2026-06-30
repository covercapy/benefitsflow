'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

import {
  Users, Heart, AlertTriangle, CheckCircle2, Clock,
  TrendingUp, Building2, FileText, ChevronRight, Stethoscope
} from 'lucide-react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { useRole } from '@/lib/role-context'
import { EmployeeDashboard } from './EmployeeDashboard'
import { ManagerDashboard } from './ManagerDashboard'

const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#6b7280']

// DashboardContent reads role + identity from context and routes to the
// correct sub-dashboard. Sub-components receive identity via props so they
// don't need their own /api/session fetches.
export function DashboardContent() {
  const { currentRole, viewWorkerId, viewDisplayName } = useRole()

  if (currentRole === 'EMPLOYEE') return <EmployeeDashboard workerId={viewWorkerId} displayName={viewDisplayName} />
  if (currentRole === 'MANAGER') return <ManagerDashboard workerId={viewWorkerId} displayName={viewDisplayName} />
  return <HRDashboardContent />
}

function HRDashboardContent() {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    enrolledDental: 0,
    waivedDental: 0,
    pendingEnrollment: 0,
    pendingDocuments: 0,
    openInboxTasks: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const [workers, dental, inbox] = await Promise.all([
        supabase.from('workers').select('id, benefit_tier, worker_status').eq('worker_status', 'ACTIVE'),
        supabase.from('dental_elections').select('id, enrollment_status, waived'),
        supabase.from('inbox_tasks').select('id, status').neq('status', 'COMPLETED'),
      ])

      const totalWorkers = workers.data?.length ?? 0
      const enrolledDental = dental.data?.filter(d => d.enrollment_status === 'ACTIVE').length ?? 0
      const waivedDental = dental.data?.filter(d => d.waived).length ?? 0
      const openInboxTasks = inbox.data?.length ?? 0

      setStats({ totalWorkers, enrolledDental, waivedDental, pendingEnrollment: 3, pendingDocuments: 2, openInboxTasks })
      setLoading(false)
    }
    load()
  }, [])

  const enrollmentRate = stats.totalWorkers ? Math.round((stats.enrolledDental / stats.totalWorkers) * 100) : 0

  const planDistribution = [
    { name: 'PPO', value: stats.enrolledDental - 2 },
    { name: 'DHMO', value: 2 },
    { name: 'Waived', value: stats.waivedDental },
    { name: 'Not Started', value: stats.pendingEnrollment },
  ]

  const carrierData = [
    { state: 'CA', carrier: 'Cigna', count: 8 },
    { state: 'OR', carrier: 'Delta', count: 3 },
    { state: 'ID', carrier: 'Delta', count: 2 },
    { state: 'AZ', carrier: 'Cigna', count: 4 },
    { state: 'CO', carrier: 'Cigna', count: 2 },
    { state: 'WA', carrier: 'Delta', count: 1 },
  ]

  const alerts = [
    { type: 'urgent', message: '3 workers within 3 days of enrollment deadline', href: '/workers' },
    { type: 'warning', message: '2 dependents missing documentation', href: '/workers' },
    { type: 'info', message: '1 open QLE event – Maria Gonzalez (birth)', href: '/processes' },
  ]

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <Link key={i} href={alert.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                alert.type === 'urgent' ? 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100' :
                alert.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100' :
                'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
              }`}>
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{alert.message}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Active Workers" value={stats.totalWorkers} color="blue" />
        <StatCard icon={Heart} label="Dental Enrolled" value={stats.enrolledDental}
          sub={`${enrollmentRate}% enrollment rate`} color="emerald" />
        <StatCard icon={Clock} label="Pending Tasks" value={stats.openInboxTasks} color="amber" />
        <StatCard icon={FileText} label="Pending Docs" value={stats.pendingDocuments} color="red" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Dental Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                paddingAngle={3} dataKey="value">
                {planDistribution.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v} workers`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Carrier by state */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Enrolled Workers by State</h3>
          <p className="text-xs text-slate-500 mb-4">Carrier auto-assigned by work state (ID/OR/WA → Delta Dental, others → Cigna)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={carrierData} barSize={24}>
              <XAxis dataKey="state" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <QuickAction
          href="/enroll/dental"
          icon={Stethoscope}
          title="Dental Enrollment"
          description="Enroll in PPO or DHMO plan with cost comparison and provider picker"
          color="blue"
        />
        <QuickAction
          href="/workers"
          icon={Users}
          title="Worker Directory"
          description="View all workers, eligibility status, and enrollment history"
          color="slate"
        />
        <QuickAction
          href="/reports"
          icon={TrendingUp}
          title="Enrollment Reports"
          description="Completion rates, accumulators, carrier export audit"
          color="emerald"
        />
      </div>

      {/* Bottom disclaimer */}
      <p className="text-[11px] text-slate-400 text-center pt-2">
        BenefitsFlow HRIS Lab · All data is fictional · Not affiliated with Ensign Services, Workday, Cigna, or Delta Dental
      </p>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType, label: string, value: number, sub?: string, color: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    slate: 'bg-slate-50 text-slate-600',
  }
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function QuickAction({ href, icon: Icon, title, description, color }: {
  href: string, icon: React.ElementType, title: string, description: string, color: string
}) {
  return (
    <Link href={href}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all group">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-4 h-4 text-blue-600" />
        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h4>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-auto group-hover:text-blue-500 transition-colors" />
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </Link>
  )
}
