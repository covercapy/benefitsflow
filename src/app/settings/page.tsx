'use client'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { User, Bell, Shield, Settings as SettingsIcon, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'profile' | 'notifications' | 'security' | 'system' | 'integrations'

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className={cn('w-11 h-6 rounded-full transition-colors relative', value ? 'bg-violet-600' : 'bg-slate-200')}>
      <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', value ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile')
  const [notifs, setNotifs] = useState({ email: true, push: false, enrollment: true, payroll: true, newHire: true, security: true })

  const integrations = [
    { name: 'Workday', icon: '⚙️', connected: false, desc: 'Enterprise HCM — bidirectional sync' },
    { name: 'ADP Workforce', icon: '💼', connected: false, desc: 'Payroll and time management' },
    { name: 'Paylocity', icon: '💰', connected: false, desc: 'Payroll and HR platform' },
    { name: 'Slack', icon: '💬', connected: false, desc: 'HR notifications and alerts' },
    { name: 'Google Calendar', icon: '📅', connected: true, desc: 'Sync HR events and time off' },
    { name: 'DocuSign', icon: '✍️', connected: false, desc: 'E-signature for offer letters' },
  ]

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'system', label: 'System', icon: SettingsIcon },
    { key: 'integrations', label: 'Integrations', icon: Link2 },
  ]

  return (
    <AppShell pageTitle="Settings" pageSubtitle="Account, preferences, and system configuration">
      <div className="flex gap-5">
        {/* Tab nav */}
        <div className="w-48 shrink-0 space-y-1">
          {tabs.map(t => {
            const Icon = t.icon
            return (
              <button key={t.key} onClick={() => setTab(t.key)} className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left', tab === t.key ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50')}>
                <Icon className="w-4 h-4 shrink-0" />{t.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6">
          {tab === 'profile' && (
            <div className="space-y-5 max-w-md">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center text-2xl font-bold text-violet-700">NS</div>
              <h3 className="font-bold text-slate-900">Nathan Song</h3>
              {[['Name','Nathan Song'],['Title','HRIS Analyst'],['Email','hris.analyst@benefitsflow.demo'],['Phone','(949) 555-0182'],['Role','HRIS Analyst'],['Organization','Ensign Services, Inc.'],['Worker ID','ESI-10000']].map(([k,v])=>(
                <div key={k}>
                  <label className="text-xs text-slate-500 block mb-1">{k}</label>
                  <div className="flex items-center gap-3 border border-slate-200 rounded-lg px-3 py-2.5">
                    <span className="text-sm text-slate-900 flex-1">{v}</span>
                    <span className="text-xs text-violet-600 hover:underline cursor-pointer">Edit</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-4 max-w-md">
              <p className="text-sm text-slate-500">Choose which notifications you receive.</p>
              {([
                ['email', 'Email Alerts', 'Receive important HR updates via email'],
                ['push', 'Push Notifications', 'Browser push notifications'],
                ['enrollment', 'Enrollment Reminders', 'Benefit enrollment deadlines and milestones'],
                ['payroll', 'Payroll Notifications', 'Pay run confirmations and changes'],
                ['newHire', 'New Hire Alerts', 'Onboarding tasks and new worker events'],
                ['security', 'Security Alerts', 'Login activity and permission changes'],
              ] as const).map(([key, label, desc]) => (
                <div key={key} className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                  <Toggle value={notifs[key]} onChange={v => setNotifs(n => ({...n,[key]:v}))} />
                </div>
              ))}
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-4 max-w-md">
              {[
                { label: 'Last Login', value: 'Today at 9:20 AM', status: 'ok' },
                { label: 'Active Sessions', value: '1 session', status: 'ok' },
                { label: 'Password Age', value: '90 days ago', status: 'warn' },
                { label: 'Multi-Factor Auth', value: 'Not configured', status: 'warn' },
                { label: 'Session Timeout', value: '30 minutes', status: 'ok' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className={cn('text-xs', item.status === 'warn' ? 'text-amber-600' : 'text-slate-400')}>{item.value}</p>
                  </div>
                  {item.label === 'Multi-Factor Auth' && (
                    <button className="text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 font-medium">Enable MFA</button>
                  )}
                  {item.label === 'Password Age' && (
                    <button className="text-xs border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 font-medium">Change</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'system' && (
            <div className="space-y-3 max-w-md">
              {[
                ['Application', 'BenefitsFlow HRIS Lab'],
                ['Version', 'v1.0.0 (2026-06-30)'],
                ['Environment', 'Production (Vercel)'],
                ['Data Mode', 'Fictional / Demo only'],
                ['Auth', 'Supabase Auth + Cookie fallback'],
                ['Region', 'us-east-1'],
                ['Last Data Sync', 'N/A — Demo mode'],
                ['Build', 'Next.js 14 App Router + TypeScript'],
              ].map(([k,v])=>(
                <div key={k} className="flex justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-medium text-slate-900 text-right">{v}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'integrations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map(ig => (
                <div key={ig.name} className="border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-2xl">{ig.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-slate-900 text-sm">{ig.name}</p>
                      {ig.connected && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">Connected</span>}
                    </div>
                    <p className="text-xs text-slate-500">{ig.desc}</p>
                  </div>
                  <button className={cn('text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0', ig.connected ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-violet-600 text-white hover:bg-violet-700')}>
                    {ig.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
