'use client'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Check, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Invoice { id: string; vendor: string; description: string; period: string; amount: number; dueDate: string; status: 'Due' | 'Paid' | 'Overdue' }

const INVOICES: Invoice[] = [
  { id: 'INV-2026-024', vendor: 'Cigna Healthcare', description: 'Health Premiums — Jul 2026', period: 'Jul 2026', amount: 18000, dueDate: 'Jul 15, 2026', status: 'Due' },
  { id: 'INV-2026-023', vendor: 'Cigna Dental', description: 'Dental Premiums — Jul 2026', period: 'Jul 2026', amount: 1890, dueDate: 'Jul 15, 2026', status: 'Due' },
  { id: 'INV-2026-022', vendor: 'Fidelity 401(k)', description: 'Admin Fee — Q2 2026', period: 'Q2 2026', amount: 3200, dueDate: 'Jul 31, 2026', status: 'Due' },
  { id: 'INV-2026-021', vendor: 'Cigna Healthcare', description: 'Health Premiums — Jun 2026', period: 'Jun 2026', amount: 18000, dueDate: 'Jun 15, 2026', status: 'Paid' },
  { id: 'INV-2026-020', vendor: 'Cigna Dental', description: 'Dental Premiums — Jun 2026', period: 'Jun 2026', amount: 1890, dueDate: 'Jun 15, 2026', status: 'Paid' },
  { id: 'INV-2026-019', vendor: 'Fidelity 401(k)', description: 'Admin Fee — Q1 2026', period: 'Q1 2026', amount: 3200, dueDate: 'Apr 1, 2026', status: 'Paid' },
]

const STATUS_CLS = { Due: 'bg-amber-100 text-amber-700', Paid: 'bg-emerald-100 text-emerald-700', Overdue: 'bg-red-100 text-red-700' }

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2000) }
  function markPaid(id: string) {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Paid' as const } : inv))
    setConfirmId(null)
    showToast('Invoice marked as paid ✓')
  }

  const due = invoices.filter(i => i.status === 'Due').reduce((s, i) => s + i.amount, 0)
  const paidYTD = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount, 0)

  return (
    <AppShell pageTitle="Invoices" pageSubtitle="Vendor billing and benefit premium reconciliation">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Due', value: `$${due.toLocaleString()}`, color: 'text-amber-600' },
          { label: 'Paid YTD', value: `$${(paidYTD + 148340).toLocaleString()}`, color: 'text-emerald-600' },
          { label: 'Overdue', value: '$0', color: 'text-slate-900' },
          { label: 'Due This Month', value: `$${due.toLocaleString()}`, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Vendor Invoices</h3>
          <button onClick={() => showToast('Export not available in demo mode')} className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
            <Download className="w-3.5 h-3.5" />Export CSV
          </button>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>{['Invoice #','Vendor','Description','Period','Amount','Due Date','Status',''].map(h=><th key={h} className="text-left text-xs font-semibold text-slate-500 px-4 py-2">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-xs font-mono text-slate-600">{inv.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{inv.vendor}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{inv.description}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{inv.period}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">${inv.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{inv.dueDate}</td>
                <td className="px-4 py-3"><span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', STATUS_CLS[inv.status])}>{inv.status}</span></td>
                <td className="px-4 py-3">
                  {inv.status === 'Due' && (
                    <button onClick={() => setConfirmId(inv.id)} className="text-xs text-violet-600 hover:text-violet-700 font-medium">Reconcile</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm modal */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-slate-900 mb-2">Mark as Paid?</h3>
            <p className="text-sm text-slate-500 mb-4">Mark <strong>{confirmId}</strong> as paid? This cannot be undone in this session.</p>
            <div className="flex gap-3">
              <button onClick={() => markPaid(confirmId)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-1.5"><Check className="w-4 h-4" />Mark Paid</button>
              <button onClick={() => setConfirmId(null)} className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-5 right-5 bg-slate-800 text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50">{toast}</div>}
    </AppShell>
  )
}
