'use client'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Search, ChevronDown, ChevronRight, Heart, DollarSign, Clock, Users, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const ARTICLES = [
  { icon: Heart, title: 'Getting Started', desc: 'Log in with a demo persona and explore HRIS modules.', color: 'bg-violet-50 text-violet-600' },
  { icon: Heart, title: 'Benefits Enrollment Guide', desc: 'Step-by-step dental, vision, and FSA enrollment walkthrough.', color: 'bg-blue-50 text-blue-600' },
  { icon: DollarSign, title: 'Payroll & Deductions', desc: 'Understand your pay stub, deductions, and employer contributions.', color: 'bg-emerald-50 text-emerald-600' },
  { icon: Clock, title: 'Time Off Requests', desc: 'Submit PTO, view balances, and check the team calendar.', color: 'bg-amber-50 text-amber-600' },
  { icon: Users, title: 'Worker Data Management', desc: 'Employee profiles, org charts, and position management.', color: 'bg-rose-50 text-rose-600' },
  { icon: Shield, title: 'Security & Compliance', desc: 'Role-based access, audit logs, and HIPAA notice.', color: 'bg-slate-50 text-slate-600' },
]

const FAQS = [
  { q: 'How do I reset a demo account?', a: 'Visit /api/init-demo (GET) for account info. POST with the admin secret to recreate accounts.' },
  { q: 'How do demo personas sign in?', a: 'Click a persona card. The server authenticates the seeded account without exposing its password to the browser.' },
  { q: 'Is this data real?', a: 'No — all data is 100% fictional. BenefitsFlow is a portfolio project not affiliated with Ensign Services, Workday, Cigna, or Delta Dental.' },
  { q: 'Who built this?', a: 'Nathan Song, HRIS Analyst candidate applying for the HR Solutions Analyst – Workday position at Ensign Services. Built to demonstrate real Workday HRIS skills.' },
  { q: 'What HR systems does this simulate?', a: 'BenefitsFlow simulates Workday HCM, ADP Workforce, and Paylocity patterns including Core HCM, Benefits Administration, Payroll Transparency, Business Processes, and Reporting.' },
]

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  return (
    <AppShell pageTitle="Help & Center" pageSubtitle="Documentation, guides, and frequently asked questions">
      {/* Search */}
      <div className="bg-violet-600 rounded-2xl p-8 text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">How can we help you?</h2>
        <p className="text-violet-200 text-sm mb-4">Search the BenefitsFlow HRIS knowledge base</p>
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 max-w-md mx-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search help articles..." className="flex-1 text-sm text-slate-700 placeholder-slate-400 outline-none" />
        </div>
      </div>

      {/* Articles */}
      <div className="mb-6">
        <h3 className="font-bold text-slate-900 mb-3">Featured Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {ARTICLES.map(a => {
            const Icon = a.icon
            return (
              <div key={a.title} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', a.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-slate-900 text-sm mb-1">{a.title}</p>
                <p className="text-xs text-slate-500 mb-3">{a.desc}</p>
                <span className="flex items-center gap-1 text-xs text-violet-600 font-medium group-hover:gap-2 transition-all">Read more <ChevronRight className="w-3.5 h-3.5" /></span>
              </div>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Frequently Asked Questions</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50">
                <span className="font-medium text-slate-900 text-sm">{faq.q}</span>
                {open === i ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-slate-600 bg-slate-50">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
