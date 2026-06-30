'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  DollarSign, ChevronLeft, CheckCircle2, Info, AlertTriangle,
  Pill, Stethoscope, Eye, Baby, Activity, Thermometer, Calculator
} from 'lucide-react'

const IRS_LIMIT_2026 = 3300
const EMPLOYER_CONTRIB = 0
const CURRENT_ELECTION = 1800
const YTD_USED = 420
const YTD_REMAINING = CURRENT_ELECTION - YTD_USED
const MONTHS_LEFT = 6  // July → Dec

// Eligible expense categories
const ELIGIBLE_EXPENSES = [
  { cat: 'Dental', icon: Stethoscope, examples: 'Copays, deductibles, crowns, orthodontia, cleanings' },
  { cat: 'Vision', icon: Eye, examples: 'Glasses, contacts, eye exams, LASIK' },
  { cat: 'Prescriptions', icon: Pill, examples: 'Rx copays, OTC medications (with Rx), insulin' },
  { cat: 'Medical', icon: Activity, examples: 'Doctor copays, surgery, lab work, physical therapy' },
  { cat: 'Mental Health', icon: Thermometer, examples: 'Therapy, psychiatry, substance abuse treatment' },
  { cat: 'Dependent Care', icon: Baby, examples: 'Note: requires separate Dependent Care FSA election' },
]

// Expense estimator scenarios
const SCENARIOS = [
  { label: 'Light use (checkups only)',   annual: 800 },
  { label: 'Moderate (dental + Rx)',      annual: 1800 },
  { label: 'Heavy (braces / surgery)',    annual: 3300 },
]

export function FSAEnrollment() {
  const [annualElection, setAnnualElection] = useState(CURRENT_ELECTION)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [expenseEstimates, setExpenseEstimates] = useState({ dental: 200, rx: 120, vision: 150, doctor: 300, other: 180 })

  const monthly = annualElection / 12
  const biweekly = (annualElection / 26).toFixed(2)
  const remaining = Math.max(0, IRS_LIMIT_2026 - annualElection)

  // Tax savings estimate (assume ~28% effective rate)
  const taxSavings = (annualElection * 0.28).toFixed(0)
  const estimatedSpending = Object.values(expenseEstimates).reduce((sum, value) => sum + value, 0)
  const recommendedElection = Math.min(IRS_LIMIT_2026, Math.ceil(estimatedSpending * 1.15 / 50) * 50)

  const clampElection = (val: number) => {
    const clamped = Math.max(0, Math.min(IRS_LIMIT_2026, val))
    setAnnualElection(Math.round(clamped / 50) * 50)  // round to $50 increments
  }

  async function saveElection() {
    setSubmitting(true); setSubmitError(null)
    try {
      const response = await fetch('/api/enrollments/fsa', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annualElection, planYear: 2027 }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'FSA election failed')
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'FSA election failed')
    } finally { setSubmitting(false) }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">FSA Election Updated</h2>
        <p className="text-slate-500 text-sm mb-1">
          Annual election: <strong>${annualElection.toLocaleString()}</strong>
        </p>
        <p className="text-slate-500 text-sm mb-6">
          ${biweekly}/paycheck · Effective next plan year (Jan 1, 2027)
        </p>
        <Link href="/enroll" className="text-sm text-blue-600 hover:underline flex items-center gap-1 justify-center">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to My Benefits
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/enroll" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600">
        <ChevronLeft className="w-3.5 h-3.5" /> My Benefits
      </Link>

      {/* Current status */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-900">Current FSA Election – 2026: ${CURRENT_ELECTION.toLocaleString()}/yr</p>
            <p className="text-xs text-emerald-700 mt-0.5">YTD used: ${YTD_USED} · Balance remaining: ${YTD_REMAINING} · ~${MONTHS_LEFT} months left in plan year</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-800">${YTD_USED}</p>
              <p className="text-[10px] text-emerald-600">Used YTD</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-800">${YTD_REMAINING}</p>
              <p className="text-[10px] text-emerald-600">Remaining</p>
            </div>
          </div>
        </div>
        <div className="mt-3 h-2 bg-emerald-200 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(YTD_USED / CURRENT_ELECTION) * 100}%` }} />
        </div>
        <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Use-it-or-lose-it: unspent balance forfeited Dec 31, 2026. Plan your spending.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Election editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">2027 Election Amount</h2>

            {/* Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Annual election</span>
                <span className="text-xl font-bold text-slate-900">${annualElection.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={0} max={IRS_LIMIT_2026} step={50}
                value={annualElection}
                onChange={e => setAnnualElection(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>$0</span>
                <span>IRS max ${IRS_LIMIT_2026.toLocaleString()}</span>
              </div>
            </div>

            {/* Quick-set buttons */}
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {SCENARIOS.map(s => (
                <button key={s.label} onClick={() => setAnnualElection(s.annual)}
                  className={cn('text-[10px] font-medium rounded-lg py-1.5 border transition-colors',
                    annualElection === s.annual
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-slate-200 text-slate-600 hover:border-emerald-400')}>
                  ${s.annual.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Impact table */}
            <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
              {[
                ['Monthly contribution', `$${monthly.toFixed(2)}`],
                ['Per paycheck (÷26)', `$${biweekly}`],
                ['Employer contribution', `$${EMPLOYER_CONTRIB}`],
                ['Est. tax savings*', `$${taxSavings}`],
                ['IRS limit remaining', `$${remaining.toLocaleString()}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-bold text-slate-800">{v}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">*Estimated at 28% combined tax rate. Actual savings vary.</p>

            <button onClick={saveElection} disabled={submitting}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {submitting ? 'Saving…' : 'Save 2027 FSA Election'}
            </button>
            {submitError && <p className="mt-2 text-xs text-red-600">{submitError}</p>}
          </div>

          {/* Important rules */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Key FSA Rules
            </p>
            {[
              'Use-it-or-lose-it: balance forfeits Dec 31 (no rollover)',
              'Full annual election available on day 1 of plan year',
              'FSA and HSA cannot be elected at the same time',
              'Change only allowed at open enrollment or after QLE',
              'Eligible expenses: medical, dental, vision, Rx',
            ].map(rule => (
              <p key={rule} className="text-[11px] text-amber-800 flex items-start gap-1.5">
                <span className="text-amber-500 font-bold shrink-0">·</span> {rule}
              </p>
            ))}
          </div>
        </div>

        {/* Right: eligible expenses + estimator */}
        <div className="lg:col-span-3 space-y-4">
          {/* Spending estimator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-500" /> Spending Estimator
            </h2>
            <p className="text-[11px] text-slate-400 mb-4">Estimate how much you'll spend on FSA-eligible expenses next year</p>

            <div className="space-y-3">
              {[
                { label: 'Dental copays & deductibles', key: 'dental', default: 200 },
                { label: 'Prescription drug copays', key: 'rx', default: 120 },
                { label: 'Vision (glasses / contacts)', key: 'vision', default: 150 },
                { label: 'Doctor / specialist visits', key: 'doctor', default: 300 },
                { label: 'Other medical (therapy, labs)', key: 'other', default: 180 },
              ].map(item => (
                <div key={item.key} className="flex items-center gap-3">
                  <label className="text-xs text-slate-600 w-48 shrink-0">{item.label}</label>
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      value={expenseEstimates[item.key as keyof typeof expenseEstimates]}
                      min={0}
                      step={50}
                      onChange={e => setExpenseEstimates(previous => ({ ...previous, [item.key]: Math.max(0, Number(e.target.value)) }))}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400 shrink-0">/yr</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Estimated annual spending</span>
                <span className="text-lg font-bold text-emerald-700">${estimatedSpending.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Based on your estimates. Recommended election: <strong className="text-slate-600">${recommendedElection.toLocaleString()}</strong> (includes a 15% buffer).
              </p>
              <button
                onClick={() => setAnnualElection(recommendedElection)}
                className="mt-2 text-xs text-emerald-600 font-semibold hover:underline">
                Apply ${recommendedElection.toLocaleString()} recommended → Election slider
              </button>
            </div>
          </div>

          {/* Eligible expenses */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">FSA-Eligible Expense Categories</h2>
            <div className="grid grid-cols-2 gap-3">
              {ELIGIBLE_EXPENSES.map(exp => {
                const Icon = exp.icon
                return (
                  <div key={exp.cat} className="bg-slate-50 rounded-xl px-3 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3.5 h-3.5 text-emerald-600" />
                      <p className="text-xs font-semibold text-slate-800">{exp.cat}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">{exp.examples}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
