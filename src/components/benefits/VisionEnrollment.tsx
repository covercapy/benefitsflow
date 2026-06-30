'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Eye, CheckCircle2, ChevronLeft, Info, DollarSign
} from 'lucide-react'

const VISION_PLANS = [
  {
    id: 'vsp-eo',
    name: 'VSP Choice – Employee Only',
    tier: 'EO',
    monthly: 7.50,
    benefits: {
      exam: '$10 copay · 1x per calendar year',
      frames: '$150 allowance · 1x per 24 months',
      lenses: '$25 copay · 1x per calendar year',
      contacts: '$130 allowance (in lieu of glasses)',
      outOfNetwork: 'Exam $45 / Frames $70 / Contacts $105',
    },
  },
  {
    id: 'vsp-es',
    name: 'VSP Choice – Employee + Spouse',
    tier: 'ES',
    monthly: 14.50,
    benefits: {
      exam: '$10 copay per person · 1x/yr each',
      frames: '$150 allowance per person · 1x/24 mo',
      lenses: '$25 copay per person · 1x/yr',
      contacts: '$130 per person (in lieu of glasses)',
      outOfNetwork: 'Exam $45 / Frames $70 / Contacts $105 per person',
    },
  },
  {
    id: 'vsp-ec',
    name: 'VSP Choice – Employee + Children',
    tier: 'EC',
    monthly: 13.00,
    benefits: {
      exam: '$10 copay per person · 1x/yr each',
      frames: '$150 allowance per person · 1x/24 mo',
      lenses: '$25 copay per person · 1x/yr',
      contacts: '$130 per person (in lieu of glasses)',
      outOfNetwork: 'Exam $45 / Frames $70 / Contacts $105 per person',
    },
  },
  {
    id: 'vsp-ef',
    name: 'VSP Choice – Employee + Family',
    tier: 'EF',
    monthly: 19.50,
    benefits: {
      exam: '$10 copay per person · 1x/yr each',
      frames: '$150 allowance per person · 1x/24 mo',
      lenses: '$25 copay per person · 1x/yr',
      contacts: '$130 per person (in lieu of glasses)',
      outOfNetwork: 'Exam $45 / Frames $70 / Contacts $105 per person',
    },
  },
  {
    id: 'waive',
    name: 'Waive Vision Coverage',
    tier: 'WAIVE',
    monthly: 0,
    benefits: { exam: '—', frames: '—', lenses: '—', contacts: '—', outOfNetwork: '—' },
  },
]

const BENEFIT_ROWS = [
  { key: 'exam',          label: 'Eye Exam' },
  { key: 'frames',        label: 'Frames/Glasses' },
  { key: 'lenses',        label: 'Lenses' },
  { key: 'contacts',      label: 'Contact Lenses' },
  { key: 'outOfNetwork',  label: 'Out-of-Network' },
]

export function VisionEnrollment() {
  const [selected, setSelected] = useState('vsp-ef')  // current election
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const selectedPlan = VISION_PLANS.find(p => p.id === selected)!
  const biweekly = (selectedPlan.monthly * 12 / 26).toFixed(2)
  const currentElection = 'vsp-ef'  // what they're currently on

  async function saveElection() {
    setSubmitting(true); setSubmitError(null)
    try {
      const response = await fetch('/api/enrollments/vision', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedPlan.tier }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Vision election failed')
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Vision election failed')
    } finally { setSubmitting(false) }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Vision Election Saved</h2>
        <p className="text-slate-500 text-sm mb-6">
          Your VSP Choice election for {selectedPlan.name.split('–')[1]?.trim()} has been recorded.
          Coverage is effective {selected === 'waive' ? 'N/A' : 'next plan year (Jan 1, 2027)'}.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/enroll" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to My Benefits
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/enroll" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600">
        <ChevronLeft className="w-3.5 h-3.5" /> My Benefits
      </Link>

      {/* Current coverage banner */}
      <div className="bg-teal-50 border border-teal-200 rounded-2xl px-5 py-4 flex items-center gap-3">
        <Eye className="w-5 h-5 text-teal-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-teal-900">Current: VSP Choice – Employee + Family · $19.50/mo</p>
          <p className="text-xs text-teal-700 mt-0.5">Coverage active since Feb 1, 2024 · Next exam: Jan 2025 (due)</p>
        </div>
        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">ACTIVE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Plan selector */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Select Coverage Tier</h2>
          {VISION_PLANS.map(plan => (
            <button key={plan.id} onClick={() => setSelected(plan.id)}
              className={cn('w-full text-left rounded-xl border-2 px-4 py-3 transition-all',
                selected === plan.id
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-slate-200 bg-white hover:border-teal-300',
                plan.tier === 'WAIVE' && 'opacity-70')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn('text-xs font-semibold', selected === plan.id ? 'text-teal-900' : 'text-slate-800')}>
                    {plan.name.split('–')[1]?.trim() ?? 'Waive'}
                  </p>
                  <p className={cn('text-[11px] mt-0.5', selected === plan.id ? 'text-teal-600' : 'text-slate-400')}>
                    {plan.monthly === 0 ? 'No cost' : `$${plan.monthly.toFixed(2)}/mo · $${(plan.monthly * 12 / 26).toFixed(2)}/paycheck`}
                  </p>
                </div>
                {plan.id === currentElection && (
                  <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 rounded">CURRENT</span>
                )}
                {selected === plan.id && plan.tier !== 'WAIVE' && (
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                )}
              </div>
            </button>
          ))}

          {/* Paycheck impact */}
          {selected !== 'waive' && (
            <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Monthly premium</span>
                <span className="font-bold text-slate-800">${selectedPlan.monthly.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">Per paycheck (÷26)</span>
                <span className="font-bold text-blue-700">${biweekly}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">Annual total</span>
                <span className="font-medium text-slate-600">${(selectedPlan.monthly * 12).toFixed(2)}</span>
              </div>
            </div>
          )}

          <button onClick={saveElection} disabled={submitting}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50">
            {submitting ? 'Saving…' : selected === currentElection ? 'Keep Current Election' : 'Save Vision Election'}
          </button>
          {submitError && <p className="text-xs text-red-600">{submitError}</p>}
        </div>

        {/* Benefits comparison */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">VSP Choice Plan Benefits</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide w-1/3">Benefit</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold text-teal-600 uppercase tracking-wide">In-Network (VSP provider)</th>
                </tr>
              </thead>
              <tbody>
                {BENEFIT_ROWS.map((row, i) => (
                  <tr key={row.key} className={cn('border-b border-slate-50 last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}>
                    <td className="px-4 py-3 text-xs font-medium text-slate-700">{row.label}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {selected === 'waive' ? '—' : selectedPlan.benefits[row.key as keyof typeof selectedPlan.benefits]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* YTD usage */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-teal-500" /> YTD Vision Benefit Usage – 2026
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Eye Exam', used: 1, total: 1, unit: 'visit', pct: 100 },
                { label: 'Frames Allowance', used: 0, total: 150, unit: '$', pct: 0 },
                { label: 'Lenses', used: 1, total: 1, unit: 'pair', pct: 100 },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-slate-600">{item.label}</span>
                    <span className="text-xs font-semibold text-slate-800">
                      {item.unit === '$' ? `$${item.used} / $${item.total}` : `${item.used} / ${item.total} ${item.unit}`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', item.pct >= 100 ? 'bg-teal-500' : 'bg-teal-300')}
                      style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <Info className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-blue-800">
              VSP network includes 36,000+ provider locations nationwide. To find in-network providers visit
              <strong> vsp.com</strong> or call 1-800-877-7195. Out-of-network reimbursement available at reduced rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
