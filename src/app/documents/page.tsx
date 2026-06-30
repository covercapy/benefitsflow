'use client'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Search, Download, Eye, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Category = 'All' | 'HR Policies' | 'Benefits' | 'Onboarding' | 'Legal' | 'Templates'

interface Doc { name: string; category: Exclude<Category,'All'>; updated: string; size: string; icon: string }

const DOCS: Doc[] = [
  { name: 'Employee Handbook 2026', category: 'HR Policies', updated: 'Jun 1, 2026', size: '2.4 MB', icon: '📋' },
  { name: 'Benefits Summary Plan Description', category: 'Benefits', updated: 'Apr 15, 2026', size: '1.8 MB', icon: '❤️' },
  { name: 'Dental Enrollment Guide', category: 'Benefits', updated: 'Mar 10, 2026', size: '890 KB', icon: '🦷' },
  { name: 'New Hire Onboarding Checklist', category: 'Onboarding', updated: 'Feb 20, 2026', size: '345 KB', icon: '✅' },
  { name: 'HIPAA Privacy Notice', category: 'Legal', updated: 'Jan 1, 2026', size: '1.2 MB', icon: '🔒' },
  { name: 'I-9 Employment Eligibility Form', category: 'Legal', updated: 'Jan 1, 2026', size: '456 KB', icon: '📝' },
  { name: 'Offer Letter Template', category: 'Templates', updated: 'May 5, 2026', size: '78 KB', icon: '📄' },
  { name: 'PTO Request Form', category: 'Templates', updated: 'Mar 1, 2026', size: '45 KB', icon: '📅' },
  { name: 'Performance Review Template', category: 'HR Policies', updated: 'Apr 30, 2026', size: '234 KB', icon: '⭐' },
  { name: 'COBRA Continuation Notice', category: 'Benefits', updated: 'Jun 15, 2026', size: '567 KB', icon: '📋' },
]

const CATS: Category[] = ['All', 'HR Policies', 'Benefits', 'Onboarding', 'Legal', 'Templates']
const CAT_COLOR: Record<Exclude<Category,'All'>, string> = {
  'HR Policies': 'bg-violet-100 text-violet-700',
  'Benefits': 'bg-blue-100 text-blue-700',
  'Onboarding': 'bg-emerald-100 text-emerald-700',
  'Legal': 'bg-red-100 text-red-700',
  'Templates': 'bg-slate-100 text-slate-600',
}

export default function DocumentsPage() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState<Category>('All')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const filtered = DOCS.filter(d => {
    const s = !search || d.name.toLowerCase().includes(search.toLowerCase())
    const c = cat === 'All' || d.category === cat
    return s && c
  })

  return (
    <AppShell pageTitle="Documents" pageSubtitle="HR policies, benefit guides, forms, and templates">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {CATS.filter(c => c !== 'All').map(c => (
          <div key={c} className="bg-white rounded-xl border border-slate-200 p-3 text-center cursor-pointer hover:border-violet-300" onClick={() => setCat(c)}>
            <p className="text-xl font-bold text-slate-900">{DOCS.filter(d => d.category === c).length}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{c}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Controls */}
        <div className="px-5 py-4 border-b border-slate-100 flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none flex-1" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)} className={cn('px-3 py-2 rounded-lg text-xs font-medium transition-all', cat === c ? 'bg-violet-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50')}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>{['Document', 'Category', 'Last Updated', 'Size', 'Actions'].map(h => <th key={h} className="text-left text-xs font-semibold text-slate-500 px-5 py-3">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((doc, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{doc.icon}</span>
                    <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                  </div>
                </td>
                <td className="px-5 py-3.5"><span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', CAT_COLOR[doc.category])}>{doc.category}</span></td>
                <td className="px-5 py-3.5 text-sm text-slate-500">{doc.updated}</td>
                <td className="px-5 py-3.5 text-sm text-slate-500">{doc.size}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <button onClick={() => showToast(`Preview not available in demo mode — ${doc.name}`)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"><Eye className="w-3.5 h-3.5" />View</button>
                    <button onClick={() => showToast(`Download not available in demo mode`)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 font-medium"><Download className="w-3.5 h-3.5" />Download</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-slate-800 text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 max-w-sm">
          <span className="flex-1">{toast}</span>
          <button onClick={() => setToast(null)}><X className="w-4 h-4 text-slate-300 hover:text-white" /></button>
        </div>
      )}
    </AppShell>
  )
}
