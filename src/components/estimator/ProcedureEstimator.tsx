'use client'

import { useState, useMemo } from 'react'
import { cn, formatCurrency } from '@/lib/utils'
import {
  Search, Plus, X, AlertTriangle, CheckCircle2,
  Info, Calculator, Stethoscope, ChevronDown, ChevronUp
} from 'lucide-react'

// ── Procedure data (mirrors ADA CDT seed) ──────────────────
const PROCEDURES = [
  // Diagnostic / Preventive
  { code: 'D0120', desc: 'Periodic oral evaluation', cat: 'Preventive', svcClass: 'PREV_DIAG', feeAvg: 70, dhmoCopay: 5, freq: '2x per calendar year', waitPPO: 0 },
  { code: 'D0150', desc: 'Comprehensive oral evaluation (new patient)', cat: 'Diagnostic', svcClass: 'PREV_DIAG', feeAvg: 120, dhmoCopay: 5, freq: 'Once per 3 years', waitPPO: 0 },
  { code: 'D0210', desc: 'Full mouth X-rays (FMX / complete series)', cat: 'Diagnostic', svcClass: 'PREV_DIAG', feeAvg: 165, dhmoCopay: 5, freq: 'Once per 3–5 years', waitPPO: 0 },
  { code: 'D0272', desc: 'Bitewing X-rays (2 images)', cat: 'Diagnostic', svcClass: 'PREV_DIAG', feeAvg: 72, dhmoCopay: 5, freq: '1x per calendar year', waitPPO: 0 },
  { code: 'D0274', desc: 'Bitewing X-rays (4 images)', cat: 'Diagnostic', svcClass: 'PREV_DIAG', feeAvg: 105, dhmoCopay: 5, freq: '1x per calendar year', waitPPO: 0 },
  { code: 'D0330', desc: 'Panoramic X-ray (Panorex)', cat: 'Diagnostic', svcClass: 'PREV_DIAG', feeAvg: 152, dhmoCopay: 5, freq: 'Once per 3–5 years', waitPPO: 0 },
  { code: 'D1110', desc: 'Adult teeth cleaning (prophylaxis)', cat: 'Preventive', svcClass: 'PREV_DIAG', feeAvg: 120, dhmoCopay: 5, freq: '2x per calendar year', waitPPO: 0 },
  { code: 'D1120', desc: 'Child teeth cleaning (prophylaxis)', cat: 'Preventive', svcClass: 'PREV_DIAG', feeAvg: 80, dhmoCopay: 5, freq: '2x per calendar year', waitPPO: 0 },
  { code: 'D1208', desc: 'Fluoride treatment – adult', cat: 'Preventive', svcClass: 'PREV_DIAG', feeAvg: 40, dhmoCopay: 5, freq: '1x per calendar year', waitPPO: 0 },
  { code: 'D1351', desc: 'Sealant – per tooth', cat: 'Preventive', svcClass: 'PREV_DIAG', feeAvg: 50, dhmoCopay: 15, freq: 'Once per tooth per lifetime', waitPPO: 0 },
  // Basic / Restorative
  { code: 'D2140', desc: 'Amalgam filling – 1 surface', cat: 'Basic', svcClass: 'BASIC', feeAvg: 157, dhmoCopay: 25, freq: null, waitPPO: 0 },
  { code: 'D2150', desc: 'Amalgam filling – 2 surfaces', cat: 'Basic', svcClass: 'BASIC', feeAvg: 200, dhmoCopay: 35, freq: null, waitPPO: 0 },
  { code: 'D2160', desc: 'Amalgam filling – 3 surfaces', cat: 'Basic', svcClass: 'BASIC', feeAvg: 235, dhmoCopay: 45, freq: null, waitPPO: 0 },
  { code: 'D2330', desc: 'Composite filling – 1 surface, front tooth', cat: 'Basic', svcClass: 'BASIC', feeAvg: 177, dhmoCopay: 30, freq: null, waitPPO: 0 },
  { code: 'D2391', desc: 'Composite filling – 1 surface, back tooth', cat: 'Basic', svcClass: 'BASIC', feeAvg: 187, dhmoCopay: 30, freq: null, waitPPO: 0 },
  { code: 'D2392', desc: 'Composite filling – 2 surfaces, back tooth', cat: 'Basic', svcClass: 'BASIC', feeAvg: 237, dhmoCopay: 40, freq: null, waitPPO: 0 },
  { code: 'D2393', desc: 'Composite filling – 3 surfaces, back tooth', cat: 'Basic', svcClass: 'BASIC', feeAvg: 275, dhmoCopay: 50, freq: null, waitPPO: 0 },
  { code: 'D2950', desc: 'Core build-up (before crown)', cat: 'Basic', svcClass: 'BASIC', feeAvg: 235, dhmoCopay: 55, freq: null, waitPPO: 0 },
  // Endodontics
  { code: 'D3310', desc: 'Root canal – front tooth (anterior)', cat: 'Endodontics', svcClass: 'BASIC', feeAvg: 875, dhmoCopay: 175, freq: null, waitPPO: 0 },
  { code: 'D3320', desc: 'Root canal – premolar', cat: 'Endodontics', svcClass: 'BASIC', feeAvg: 1050, dhmoCopay: 200, freq: null, waitPPO: 0 },
  { code: 'D3330', desc: 'Root canal – molar', cat: 'Endodontics', svcClass: 'BASIC', feeAvg: 1225, dhmoCopay: 250, freq: null, waitPPO: 0 },
  // Periodontics
  { code: 'D4341', desc: 'Scaling & root planing (SRP) – 4+ teeth per quad', cat: 'Periodontics', svcClass: 'BASIC', feeAvg: 287, dhmoCopay: 75, freq: null, waitPPO: 0 },
  { code: 'D4342', desc: 'Scaling & root planing (SRP) – 1–3 teeth per quad', cat: 'Periodontics', svcClass: 'BASIC', feeAvg: 230, dhmoCopay: 60, freq: null, waitPPO: 0 },
  { code: 'D4910', desc: 'Periodontal maintenance (perio recall)', cat: 'Periodontics', svcClass: 'BASIC', feeAvg: 142, dhmoCopay: 30, freq: '4x per calendar year (after active perio tx)', waitPPO: 0 },
  // Major
  { code: 'D2740', desc: 'Crown – all-ceramic (PFZ/e.max)', cat: 'Major', svcClass: 'MAJOR', feeAvg: 1375, dhmoCopay: 225, freq: 'Once per tooth per 5 years', waitPPO: 12 },
  { code: 'D2750', desc: 'Crown – porcelain fused to metal (PFM)', cat: 'Major', svcClass: 'MAJOR', feeAvg: 1300, dhmoCopay: 200, freq: 'Once per tooth per 5 years', waitPPO: 12 },
  { code: 'D2710', desc: 'Crown – resin/composite (indirect)', cat: 'Major', svcClass: 'MAJOR', feeAvg: 800, dhmoCopay: 175, freq: 'Once per tooth per 5 years', waitPPO: 12 },
  // Oral Surgery
  { code: 'D7140', desc: 'Simple tooth extraction', cat: 'Oral Surgery', svcClass: 'BASIC', feeAvg: 185, dhmoCopay: 35, freq: null, waitPPO: 0 },
  { code: 'D7210', desc: 'Surgical extraction (bone/sectioning)', cat: 'Oral Surgery', svcClass: 'BASIC', feeAvg: 317, dhmoCopay: 75, freq: null, waitPPO: 0 },
  { code: 'D7240', desc: 'Wisdom tooth removal – fully impacted (bony)', cat: 'Oral Surgery', svcClass: 'BASIC', feeAvg: 412, dhmoCopay: 125, freq: null, waitPPO: 0 },
  { code: 'D7241', desc: 'Wisdom tooth removal – complex impacted', cat: 'Oral Surgery', svcClass: 'BASIC', feeAvg: 537, dhmoCopay: 175, freq: null, waitPPO: 0 },
  // Orthodontia
  { code: 'D8080', desc: 'Braces – teen (adolescent comprehensive)', cat: 'Orthodontia', svcClass: 'ORTHO', feeAvg: 5500, dhmoCopay: null, freq: null, waitPPO: 0 },
  { code: 'D8090', desc: 'Braces – adult (comprehensive)', cat: 'Orthodontia', svcClass: 'ORTHO', feeAvg: 6250, dhmoCopay: null, freq: null, waitPPO: 0 },
  { code: 'D8680', desc: 'Orthodontic retainers', cat: 'Orthodontia', svcClass: 'ORTHO', feeAvg: 475, dhmoCopay: null, freq: null, waitPPO: 0 },
  // Adjunctive
  { code: 'D9230', desc: 'Nitrous oxide sedation', cat: 'Adjunctive', svcClass: 'BASIC', feeAvg: 95, dhmoCopay: 35, freq: null, waitPPO: 0 },
  { code: 'D9940', desc: 'Night guard (bruxism / occlusal guard)', cat: 'Adjunctive', svcClass: 'MAJOR', feeAvg: 600, dhmoCopay: 100, freq: null, waitPPO: 12 },
]

// PPO cost-share %
const PPO_PCT: Record<string, number> = { PREV_DIAG: 0, BASIC: 10, MAJOR: 40, ORTHO: 50 }
const DEDUCTIBLE = 50
const ANNUAL_MAX = 1500
const ORTHO_MAX = 1500

// Quick-add scenarios for demo
const SCENARIOS = [
  {
    label: '🦷 Healthy Patient – Annual Preventive',
    procs: ['D0120','D0272','D1110','D0120','D1110'],
    desc: '2 exams, 2 cleanings, 1 bitewing — typical annual preventive',
  },
  {
    label: '🔴 Perio Patient – Active Treatment',
    procs: ['D0150','D0210','D4341','D4341','D4341','D4341','D4910','D4910'],
    desc: 'New patient exam, FMX, SRP all 4 quads, 2 perio maintenance visits',
  },
  {
    label: '👑 Restorative – Crown + Build-up',
    procs: ['D0120','D0272','D1110','D2950','D2740'],
    desc: 'Exam, BWX, cleaning, core build-up, all-ceramic crown',
  },
  {
    label: '🦷 Ortho Family – Child Braces',
    procs: ['D0120','D0274','D1120','D8080'],
    desc: 'Child exam, BWX, cleaning, comprehensive teen braces',
  },
]

interface AddedProcedure {
  proc: typeof PROCEDURES[0]
  qty: number
}

export function ProcedureEstimator() {
  const [search, setSearch] = useState('')
  const [added, setAdded] = useState<AddedProcedure[]>([])
  const [deductibleAlreadyMet, setDeductibleAlreadyMet] = useState(false)
  const [orthoAlreadyUsed, setOrthoAlreadyUsed] = useState(0)
  const [expandedCode, setExpandedCode] = useState<string | null>(null)

  const filtered = PROCEDURES.filter(p =>
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.desc.toLowerCase().includes(search.toLowerCase()) ||
    p.cat.toLowerCase().includes(search.toLowerCase())
  )

  const categories = [...new Set(PROCEDURES.map(p => p.cat))]

  function addProc(proc: typeof PROCEDURES[0]) {
    setAdded(prev => {
      const existing = prev.find(a => a.proc.code === proc.code)
      if (existing) return prev.map(a => a.proc.code === proc.code ? { ...a, qty: a.qty + 1 } : a)
      return [...prev, { proc, qty: 1 }]
    })
    setSearch('')
  }

  function removeProc(code: string) {
    setAdded(prev => prev.filter(a => a.proc.code !== code))
  }

  function loadScenario(scenario: typeof SCENARIOS[0]) {
    setAdded([])
    const counts: Record<string, number> = {}
    scenario.procs.forEach(code => { counts[code] = (counts[code] || 0) + 1 })
    const newAdded = Object.entries(counts).map(([code, qty]) => ({
      proc: PROCEDURES.find(p => p.code === code)!,
      qty,
    })).filter(a => a.proc)
    setAdded(newAdded)
  }

  // Calculate costs
  const calc = useMemo(() => {
    let ppoCost = 0
    let dhmoCost = 0
    let orthoUsedThisCalc = orthoAlreadyUsed
    let annualMaxUsed = 0
    let deductibleApplied = deductibleAlreadyMet ? DEDUCTIBLE : 0
    const lineItems: { code: string; desc: string; qty: number; feePPO: number; costPPO: number; costDHMO: number | null; freqWarning: boolean; dhmoNotCovered: boolean }[] = []

    for (const { proc, qty } of added) {
      const freqWarning = proc.freq !== null && qty > getFreqLimit(proc.freq)
      const dhmoNotCovered = proc.svcClass === 'ORTHO'

      for (let i = 0; i < qty; i++) {
        const fee = proc.feeAvg

        // PPO
        let ptSharePPO = 0
        if (proc.svcClass === 'PREV_DIAG') {
          ptSharePPO = 0
        } else if (proc.svcClass === 'ORTHO') {
          const remaining = Math.max(0, ORTHO_MAX - orthoUsedThisCalc)
          const covered = Math.min(fee * (1 - PPO_PCT.ORTHO / 100), remaining)
          ptSharePPO = fee - covered
          orthoUsedThisCalc += covered
        } else {
          // Apply deductible first
          const pct = PPO_PCT[proc.svcClass] / 100
          if (!deductibleAlreadyMet && deductibleApplied < DEDUCTIBLE && proc.svcClass !== 'PREV_DIAG') {
            const deductRemainder = DEDUCTIBLE - deductibleApplied
            const appliedNow = Math.min(deductRemainder, fee)
            deductibleApplied += appliedNow
            ptSharePPO = appliedNow + Math.max(0, fee - appliedNow) * pct
          } else {
            ptSharePPO = fee * pct
          }
        }

        // Check annual max
        if (proc.svcClass !== 'ORTHO') {
          const planPays = fee - ptSharePPO
          if (annualMaxUsed + planPays > ANNUAL_MAX) {
            const planCanPay = Math.max(0, ANNUAL_MAX - annualMaxUsed)
            ptSharePPO = fee - planCanPay
          }
          annualMaxUsed += fee - ptSharePPO
        }

        ppoCost += ptSharePPO

        // DHMO
        const dhmoCostUnit = dhmoNotCovered ? null : (proc.dhmoCopay ?? 0)
        if (dhmoCostUnit !== null) dhmoCost += dhmoCostUnit
      }

      lineItems.push({
        code: proc.code,
        desc: proc.desc,
        qty,
        feePPO: proc.feeAvg * qty,
        costPPO: 0, // recalculated below inline
        costDHMO: dhmoNotCovered ? null : (proc.dhmoCopay ?? 0) * qty,
        freqWarning,
        dhmoNotCovered,
      })
    }

    return { ppoCost, dhmoCost, lineItems, annualMaxUsed, deductibleApplied }
  }, [added, deductibleAlreadyMet, orthoAlreadyUsed])

  const savings = calc.dhmoCost - calc.ppoCost
  const ppoWins = savings > 0
  const suggestion = added.length === 0 ? null :
    ppoWins ? `PPO saves you $${Math.abs(savings).toFixed(0)} vs DHMO for this treatment plan` :
    `DHMO saves you $${Math.abs(savings).toFixed(0)} vs PPO for this treatment plan`

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-800">
            <strong>How this works:</strong> Search by procedure name or ADA D-code. Add procedures to your treatment plan and see your estimated out-of-pocket cost under the PPO vs DHMO side by side. Includes deductible, coinsurance, annual max, and orthodontia lifetime max tracking.
            Frequency limit warnings alert you when you exceed typical coverage limits. Estimates only — actual costs depend on your specific plan and provider.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Search + catalog */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick scenarios */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-700 mb-2">Quick-load a patient scenario</p>
            <div className="space-y-1.5">
              {SCENARIOS.map((s, i) => (
                <button key={i} onClick={() => loadScenario(s)}
                  className="w-full text-left rounded-lg border border-slate-200 px-3 py-2 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                  <p className="text-xs font-medium text-slate-800 group-hover:text-blue-700">{s.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-700 mb-2">Add a procedure</p>
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="D-code, name, or category..."
                className="bg-transparent text-xs flex-1 outline-none text-slate-700 placeholder-slate-400" />
              {search && <button onClick={() => setSearch('')}><X className="w-3 h-3 text-slate-400" /></button>}
            </div>

            <div className="space-y-0.5 max-h-72 overflow-y-auto">
              {(search ? filtered : PROCEDURES).map(proc => (
                <button key={proc.code} onClick={() => addProc(proc)}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-blue-700 font-semibold">{proc.code}</span>
                      <span className={cn('text-[9px] px-1 rounded font-medium', getCatColor(proc.svcClass))}>{proc.cat}</span>
                    </div>
                    <p className="text-xs text-slate-700 truncate leading-snug">{proc.desc}</p>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0" />
                </button>
              ))}
              {search && filtered.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No procedures matching "{search}"</p>
              )}
            </div>
          </div>

          {/* Accumulator inputs */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-700 mb-3">YTD Accumulators (optional)</p>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={deductibleAlreadyMet}
                  onChange={e => setDeductibleAlreadyMet(e.target.checked)}
                  className="w-3.5 h-3.5 rounded" />
                <span className="text-xs text-slate-600">Deductible already met ($50)</span>
              </label>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">Ortho lifetime used ($)</label>
                <input type="number" value={orthoAlreadyUsed}
                  onChange={e => setOrthoAlreadyUsed(Number(e.target.value))}
                  min={0} max={1500}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Estimate results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Suggestion banner */}
          {suggestion && (
            <div className={cn('flex items-center gap-2 rounded-xl px-4 py-3 border text-sm font-medium',
              ppoWins ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-teal-50 border-teal-200 text-teal-800')}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {suggestion}
            </div>
          )}

          {/* Cost summary cards */}
          <div className="grid grid-cols-2 gap-4">
            <CostCard
              label="PPO Estimate"
              carrier="Delta Dental / Cigna PPO"
              cost={calc.ppoCost}
              color="blue"
              note={`Deductible: $${Math.min(calc.deductibleApplied, DEDUCTIBLE)?.toFixed(0) ?? 0} of $${DEDUCTIBLE} applied`}
              winner={ppoWins && added.length > 0}
            />
            <CostCard
              label="DHMO Estimate"
              carrier="Cigna DHMO"
              cost={calc.dhmoCost}
              color="teal"
              note={`Fixed copays · No deductible · No annual max`}
              winner={!ppoWins && added.length > 0}
              dhmoNote={added.some(a => a.proc.svcClass === 'ORTHO') ? '⚠ Ortho not covered under DHMO' : undefined}
            />
          </div>

          {/* Line items */}
          {added.length > 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Treatment Plan Breakdown</h3>
                </div>
                <button onClick={() => setAdded([])}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear all
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Procedure</th>
                    <th className="text-center px-2 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Qty</th>
                    <th className="text-right px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Fee</th>
                    <th className="text-right px-3 py-2 text-[10px] font-semibold text-blue-600 uppercase tracking-wide">PPO Pt Share</th>
                    <th className="text-right px-3 py-2 text-[10px] font-semibold text-teal-600 uppercase tracking-wide">DHMO Copay</th>
                    <th className="w-6" />
                  </tr>
                </thead>
                <tbody>
                  {added.map(({ proc, qty }) => {
                    const freqWarning = proc.freq !== null && qty > getFreqLimit(proc.freq)
                    const dhmoNotCovered = proc.svcClass === 'ORTHO'
                    const ppoPct = PPO_PCT[proc.svcClass]
                    const feePPO = proc.feeAvg * qty

                    // Simple per-line estimate (rough, ignoring accumulator for display)
                    let ptSharePPO = 0
                    if (proc.svcClass === 'PREV_DIAG') ptSharePPO = 0
                    else if (proc.svcClass === 'ORTHO') ptSharePPO = proc.feeAvg * qty * 0.5
                    else ptSharePPO = proc.feeAvg * qty * (ppoPct / 100)

                    return (
                      <tr key={proc.code} className="border-b border-slate-50 last:border-0">
                        <td className="px-4 py-2.5">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-mono text-blue-700 font-bold">{proc.code}</span>
                              <span className={cn('text-[9px] px-1.5 rounded font-medium', getCatColor(proc.svcClass))}>{proc.cat}</span>
                              {freqWarning && (
                                <span className="flex items-center gap-0.5 text-[9px] text-amber-700 bg-amber-100 px-1.5 rounded font-medium">
                                  <AlertTriangle className="w-2.5 h-2.5" /> Freq limit: {proc.freq}
                                </span>
                              )}
                              {dhmoNotCovered && (
                                <span className="text-[9px] text-red-700 bg-red-100 px-1.5 rounded font-medium">DHMO: Not covered</span>
                              )}
                              {proc.waitPPO > 0 && (
                                <span className="text-[9px] text-violet-700 bg-violet-100 px-1.5 rounded font-medium">{proc.waitPPO}-mo wait</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-700 mt-0.5">{proc.desc}</p>
                          </div>
                        </td>
                        <td className="text-center px-2 py-2.5">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => setAdded(p => p.map(a => a.proc.code === proc.code ? { ...a, qty: Math.max(1, a.qty - 1) } : a))}
                              className="w-4 h-4 rounded bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center hover:bg-slate-200">-</button>
                            <span className="text-xs w-4 text-center">{qty}</span>
                            <button onClick={() => setAdded(p => p.map(a => a.proc.code === proc.code ? { ...a, qty: a.qty + 1 } : a))}
                              className="w-4 h-4 rounded bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center hover:bg-slate-200">+</button>
                          </div>
                        </td>
                        <td className="text-right px-3 py-2.5 text-xs text-slate-500">${feePPO.toFixed(0)}</td>
                        <td className="text-right px-3 py-2.5 text-xs font-semibold text-blue-700">
                          {proc.svcClass === 'PREV_DIAG' ? <span className="text-emerald-600 font-bold">$0</span> : `$${ptSharePPO.toFixed(0)}`}
                        </td>
                        <td className="text-right px-3 py-2.5 text-xs font-semibold text-teal-700">
                          {dhmoNotCovered ? <span className="text-red-600">N/A</span> : `$${((proc.dhmoCopay ?? 0) * qty).toFixed(0)}`}
                        </td>
                        <td className="pr-3">
                          <button onClick={() => removeProc(proc.code)}>
                            <X className="w-3.5 h-3.5 text-slate-300 hover:text-red-500" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td colSpan={3} className="px-4 py-3 text-sm font-bold text-slate-900">Estimated Total Out-of-Pocket</td>
                    <td className="text-right px-3 py-3 text-sm font-bold text-blue-700">{formatCurrency(calc.ppoCost)}</td>
                    <td className="text-right px-3 py-3 text-sm font-bold text-teal-700">{formatCurrency(calc.dhmoCost)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <Stethoscope className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Add procedures or load a scenario to see cost estimates</p>
            </div>
          )}

          <p className="text-[10px] text-slate-400 text-center">
            Estimates based on national average fees. Actual costs vary by plan, provider, and location.
            PPO cost share: Prev/Diag 0% · Basic 10% · Major 40% · Ortho 50%, after $50 deductible.
            DHMO uses fixed copays from Cigna schedule. Annual max $1,500 · Ortho lifetime max $1,500.
          </p>
        </div>
      </div>
    </div>
  )
}

function CostCard({ label, carrier, cost, color, note, winner, dhmoNote }: {
  label: string, carrier: string, cost: number, color: string, note: string,
  winner: boolean, dhmoNote?: string
}) {
  return (
    <div className={cn('rounded-xl border-2 p-4 relative', winner ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white')}>
      {winner && (
        <span className="absolute -top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Better value</span>
      )}
      <p className="text-xs font-semibold text-slate-700 mb-0.5">{label}</p>
      <p className="text-[10px] text-slate-400 mb-3">{carrier}</p>
      <p className={cn('text-2xl font-bold', color === 'blue' ? 'text-blue-700' : 'text-teal-700')}>
        {formatCurrency(cost)}
      </p>
      <p className="text-[10px] text-slate-400 mt-1">{note}</p>
      {dhmoNote && <p className="text-[10px] text-red-600 mt-1 font-medium">{dhmoNote}</p>}
    </div>
  )
}

function getCatColor(svcClass: string) {
  const map: Record<string, string> = {
    PREV_DIAG: 'bg-emerald-100 text-emerald-700',
    BASIC: 'bg-blue-100 text-blue-700',
    MAJOR: 'bg-amber-100 text-amber-700',
    ORTHO: 'bg-violet-100 text-violet-700',
  }
  return map[svcClass] || 'bg-slate-100 text-slate-500'
}

function getFreqLimit(freq: string): number {
  if (freq.startsWith('2x')) return 2
  if (freq.startsWith('1x')) return 1
  if (freq.startsWith('4x')) return 4
  if (freq.startsWith('Once')) return 1
  return 999
}
