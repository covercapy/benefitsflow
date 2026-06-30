'use client'

import { useState } from 'react'
import { cn, formatCurrency, monthlyToBiweekly } from '@/lib/utils'
import { CoverageTier, COVERAGE_TIER_LABELS, getDentalCarrierForState } from '@/types'
import {
  CheckCircle2, ChevronRight, ChevronLeft, AlertCircle,
  MapPin, Phone, Globe, Users, Shield, Calculator,
  Stethoscope, Search, Star, Info, XCircle
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────
type Step = 'plan' | 'provider' | 'dependents' | 'coverage' | 'review' | 'confirm'
type PlanChoice = 'PPO' | 'DHMO' | 'WAIVE'

interface WizardState {
  planChoice: PlanChoice | null
  coverageTier: CoverageTier | null
  primaryProvider: string | null
  primaryProviderName: string | null
  dependentsSelected: string[]
  step: Step
}

// ── Constants ───────────────────────────────────────────────
const DEMO_WORKER = {
  name: 'Jordan Rivera',
  employeeId: 'ESI-10001',
  state: 'CA',
  hireDate: '2026-06-01',
  enrollmentDeadline: '2026-07-01',
}

const DEMO_DEPENDENTS = [
  { id: 'd1', name: 'Sarah Rivera', relationship: 'Spouse', dob: '1990-03-15', hasOtherCoverage: true },
  { id: 'd2', name: 'Emma Rivera', relationship: 'Child', dob: '2018-07-22', hasOtherCoverage: false },
  { id: 'd3', name: 'Noah Rivera', relationship: 'Child', dob: '2020-11-05', hasOtherCoverage: false },
]

const DEMO_PROVIDERS = [
  { id: 'p1', name: 'Dr. Maria Santos', practice: 'Sunshine Family Dental', address: '123 Pacific Ave', city: 'San Juan Capistrano', state: 'CA', zip: '92675', phone: '949-555-0101', accepting: true, languages: ['English', 'Spanish'], distance: '0.4 mi' },
  { id: 'p2', name: 'Dr. James Park', practice: 'OC Dental Group', address: '456 Crown Valley Pkwy', city: 'Laguna Niguel', state: 'CA', zip: '92677', phone: '949-555-0102', accepting: true, languages: ['English', 'Korean'], distance: '2.1 mi' },
  { id: 'p3', name: 'Dr. Lisa Chen', practice: 'Coastal Smiles', address: '789 El Camino Real', city: 'San Clemente', state: 'CA', zip: '92672', phone: '949-555-0103', accepting: false, languages: ['English', 'Mandarin'], distance: '4.7 mi' },
  { id: 'p4', name: 'Dr. Michael Nguyen', practice: 'Capistrano Dental Arts', address: '303 Ortega Hwy', city: 'San Juan Capistrano', state: 'CA', zip: '92675', phone: '949-555-0106', accepting: true, languages: ['English', 'Vietnamese'], distance: '0.9 mi' },
  { id: 'p5', name: 'Dr. Angela Torres', practice: 'South Orange County Dental', address: '202 Avenida Vista', city: 'San Juan Capistrano', state: 'CA', zip: '92675', phone: '949-555-0105', accepting: true, languages: ['English', 'Spanish'], distance: '1.2 mi' },
]

const PPO_PREMIUMS: Record<CoverageTier, { employee: number; employer: number }> = {
  EO: { employee: 8.50, employer: 12.00 },
  ES: { employee: 22.00, employer: 12.00 },
  EC: { employee: 18.00, employer: 12.00 },
  EF: { employee: 28.00, employer: 12.00 },
}
const DHMO_PREMIUMS: Record<CoverageTier, { employee: number; employer: number }> = {
  EO: { employee: 5.00, employer: 10.00 },
  ES: { employee: 14.00, employer: 10.00 },
  EC: { employee: 12.00, employer: 10.00 },
  EF: { employee: 20.00, employer: 10.00 },
}

const STEPS: { id: Step; label: string }[] = [
  { id: 'plan', label: 'Choose Plan' },
  { id: 'provider', label: 'Select Dentist' },
  { id: 'dependents', label: 'Dependents' },
  { id: 'coverage', label: 'Coverage Tier' },
  { id: 'review', label: 'Review' },
  { id: 'confirm', label: 'Confirm' },
]

// ── Main Wizard ─────────────────────────────────────────────
export function DentalEnrollmentWizard() {
  const [state, setState] = useState<WizardState>({
    planChoice: null,
    coverageTier: null,
    primaryProvider: null,
    primaryProviderName: null,
    dependentsSelected: [],
    step: 'plan',
  })
  const [providerSearch, setProviderSearch] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const carrier = getDentalCarrierForState(DEMO_WORKER.state)
  const daysLeft = Math.ceil((new Date(DEMO_WORKER.enrollmentDeadline).getTime() - new Date().getTime()) / 86400000)

  const visibleSteps = state.planChoice === 'DHMO'
    ? STEPS
    : STEPS.filter(s => s.id !== 'provider')

  const currentIdx = visibleSteps.findIndex(s => s.id === state.step)

  function next() {
    const nextStep = visibleSteps[currentIdx + 1]
    if (nextStep) setState(s => ({ ...s, step: nextStep.id }))
  }
  function back() {
    const prevStep = visibleSteps[currentIdx - 1]
    if (prevStep) setState(s => ({ ...s, step: prevStep.id }))
  }
  function goTo(step: Step) {
    setState(s => ({ ...s, step }))
  }

  const premiums = state.planChoice === 'DHMO' ? DHMO_PREMIUMS : PPO_PREMIUMS
  const monthlyEmployee = state.coverageTier ? premiums[state.coverageTier].employee : 0
  const paycheckAmount = monthlyToBiweekly(monthlyEmployee)

  const spouseSelected = state.dependentsSelected.includes('d1')
  const spouseSurchargeApplies = spouseSelected && DEMO_DEPENDENTS[0].hasOtherCoverage

  if (submitted) return <ConfirmationScreen state={state} carrier={carrier} />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Deadline banner */}
      <div className={cn('flex items-center gap-3 rounded-xl px-4 py-3 border text-sm',
        daysLeft <= 3 ? 'bg-red-50 border-red-200 text-red-800' :
        daysLeft <= 7 ? 'bg-amber-50 border-amber-200 text-amber-800' :
        'bg-blue-50 border-blue-200 text-blue-800')}>
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>
          <strong>Enrollment deadline:</strong> {DEMO_WORKER.enrollmentDeadline} ·{' '}
          {daysLeft > 0 ? `${daysLeft} days remaining` : 'Deadline passed — contact HR'} ·{' '}
          Your dental PPO carrier: <strong>{carrier}</strong> (based on {DEMO_WORKER.state} work state)
        </span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 bg-white rounded-xl border border-slate-200 p-4">
        {visibleSteps.map((step, i) => {
          const isComplete = i < currentIdx
          const isActive = step.id === state.step
          return (
            <div key={step.id} className="flex items-center flex-1 min-w-0">
              <button
                onClick={() => isComplete && goTo(step.id)}
                className={cn('flex items-center gap-2 shrink-0', isComplete && 'cursor-pointer')}
              >
                <div className={cn('step-indicator', isComplete && 'complete', isActive && 'active', !isComplete && !isActive && 'pending')}>
                  {isComplete ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn('text-xs font-medium hidden sm:block',
                  isActive ? 'text-blue-600' : isComplete ? 'text-emerald-600' : 'text-slate-400')}>
                  {step.label}
                </span>
              </button>
              {i < visibleSteps.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-2', i < currentIdx ? 'bg-emerald-400' : 'bg-slate-200')} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {state.step === 'plan' && (
          <PlanStep
            choice={state.planChoice}
            carrier={carrier}
            workState={DEMO_WORKER.state}
            onChange={choice => setState(s => ({ ...s, planChoice: choice,
              step: choice === 'WAIVE' ? 'review' : choice === 'DHMO' ? 'provider' : 'dependents'
            }))}
          />
        )}
        {state.step === 'provider' && (
          <ProviderStep
            selected={state.primaryProvider}
            search={providerSearch}
            onSearchChange={setProviderSearch}
            providers={DEMO_PROVIDERS.filter(p =>
              p.name.toLowerCase().includes(providerSearch.toLowerCase()) ||
              p.practice.toLowerCase().includes(providerSearch.toLowerCase()) ||
              p.city.toLowerCase().includes(providerSearch.toLowerCase())
            )}
            onSelect={(id, name) => setState(s => ({ ...s, primaryProvider: id, primaryProviderName: name }))}
            onNext={next}
            onBack={back}
          />
        )}
        {state.step === 'dependents' && (
          <DependentsStep
            dependents={DEMO_DEPENDENTS}
            selected={state.dependentsSelected}
            onChange={ids => setState(s => ({ ...s, dependentsSelected: ids }))}
            onNext={next}
            onBack={back}
          />
        )}
        {state.step === 'coverage' && (
          <CoverageTierStep
            selected={state.coverageTier}
            dependentsSelected={state.dependentsSelected}
            planChoice={state.planChoice!}
            premiums={premiums}
            onChange={tier => setState(s => ({ ...s, coverageTier: tier }))}
            onNext={next}
            onBack={back}
          />
        )}
        {state.step === 'review' && (
          <ReviewStep
            state={state}
            carrier={carrier}
            premiums={premiums}
            paycheckAmount={paycheckAmount}
            spouseSurcharge={spouseSurchargeApplies}
            onSubmit={() => setSubmitted(true)}
            onBack={back}
            onEdit={goTo}
          />
        )}
      </div>
    </div>
  )
}

// ── Step: Plan Selection ────────────────────────────────────
function PlanStep({ choice, carrier, workState, onChange }: {
  choice: PlanChoice | null
  carrier: string
  workState: string
  onChange: (c: PlanChoice) => void
}) {
  const [calcTier, setCalcTier] = useState<CoverageTier>('EF')

  const tiers: { tier: CoverageTier; label: string }[] = [
    { tier: 'EO', label: 'Just me' },
    { tier: 'ES', label: 'Me + Spouse' },
    { tier: 'EC', label: 'Me + Child(ren)' },
    { tier: 'EF', label: 'Family' },
  ]

  return (
    <div className="p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-1">Select Your Dental Plan</h2>
      <p className="text-sm text-slate-500 mb-5">
        Your work state ({workState}) determines your PPO carrier: <strong>{carrier}</strong>.
        The DHMO is available in all states through Cigna.
      </p>

      {/* Comparison table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-700 w-40">Feature</th>
              <th className="text-center px-4 py-3 font-semibold text-blue-700">PPO ({carrier})</th>
              <th className="text-center px-4 py-3 font-semibold text-teal-700">DHMO (Cigna)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Annual Deductible', '$50 / $150 family', 'None'],
              ['Calendar Year Max', '$1,500/person', 'Unlimited'],
              ['Orthodontia', '50% after deductible · $1,500 lifetime', 'Not covered'],
              ['Preventive & Diagnostic', '$0 (no deductible)', '$5 copay'],
              ['Basic Restorative (fillings)', '10% after deductible', 'Fixed copay'],
              ['Major Services (crowns)', '40% after deductible', 'Fixed copay'],
              ['Root Canal (molar)', '10% after deductible', '$250 copay'],
              ['Wisdom Tooth Extraction', '10% after deductible', '$125 copay'],
              ['Choose any dentist?', '✓ Yes (preferred saves money)', '✗ Must use DHMO dentist'],
              ['Primary dentist required?', '✗ No', '✓ Yes — select at enrollment'],
            ].map(([feature, ppo, dhmo], i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5 text-slate-600 font-medium text-xs">{feature}</td>
                <td className="px-4 py-2.5 text-center text-slate-800 text-xs">{ppo}</td>
                <td className="px-4 py-2.5 text-center text-slate-800 text-xs">{dhmo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cost calculator */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-blue-600" />
          <p className="text-sm font-semibold text-slate-800">Cost Calculator — Who are you covering?</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {tiers.map(({ tier, label }) => (
            <button key={tier} onClick={() => setCalcTier(tier)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                calcTier === tier ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300')}>
              {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'PPO', label: `PPO · ${carrier}`, premiums: PPO_PREMIUMS, color: 'blue' },
            { id: 'DHMO', label: 'DHMO · Cigna', premiums: DHMO_PREMIUMS, color: 'teal' },
            { id: 'WAIVE', label: 'Waive', premiums: null, color: 'slate' },
          ].map(plan => {
            const monthly = plan.premiums ? plan.premiums[calcTier].employee : 0
            const biweekly = monthlyToBiweekly(monthly)
            const employer = plan.premiums ? plan.premiums[calcTier].employer : 0
            return (
              <div key={plan.id} className={cn('rounded-lg border bg-white p-3',
                plan.color === 'blue' ? 'border-blue-200' : plan.color === 'teal' ? 'border-teal-200' : 'border-slate-200')}>
                <p className="text-xs font-medium text-slate-500 mb-2">{plan.label}</p>
                <p className={cn('text-xl font-bold', plan.color === 'blue' ? 'text-blue-700' : plan.color === 'teal' ? 'text-teal-700' : 'text-slate-400')}>
                  {plan.premiums ? `$${monthly.toFixed(2)}` : '$0.00'}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </p>
                <p className="text-xs text-slate-400">${biweekly.toFixed(2)}/paycheck</p>
                {plan.premiums && <p className="text-xs text-emerald-600 mt-1">+${employer.toFixed(2)} employer</p>}
              </div>
            )
          })}
        </div>
        <p className="text-[10px] text-slate-400 mt-2">* Sample rates for illustration. 26 pay periods/year. Employer contribution not deducted from paycheck.</p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PlanCard
          id="PPO"
          title={`Dental PPO`}
          subtitle={carrier}
          badge="Most flexible"
          selected={choice === 'PPO'}
          onClick={() => onChange('PPO')}
          highlights={[
            'See any licensed dentist',
            'Orthodontia covered ($1,500 lifetime)',
            '$1,500 annual maximum',
            'ID/OR/WA → Delta Dental; other states → Cigna',
          ]}
          priceFrom="$8.50/mo"
          color="blue"
        />
        <PlanCard
          id="DHMO"
          title="Dental DHMO"
          subtitle="Cigna"
          badge="Lowest premium"
          selected={choice === 'DHMO'}
          onClick={() => onChange('DHMO')}
          highlights={[
            'Lowest monthly cost',
            'No deductible, no annual max',
            'Must use assigned primary dentist',
            'Fixed copays per procedure',
          ]}
          priceFrom="$5.00/mo"
          color="teal"
        />
        <PlanCard
          id="WAIVE"
          title="Waive Dental"
          subtitle="No coverage"
          selected={choice === 'WAIVE'}
          onClick={() => onChange('WAIVE')}
          highlights={[
            'You will have no dental coverage',
            'Cannot re-enroll until next Open Enrollment',
            'Exception: Qualifying Life Event (QLE)',
          ]}
          priceFrom="$0/mo"
          color="slate"
          isWaive
        />
      </div>
    </div>
  )
}

function PlanCard({ id, title, subtitle, badge, selected, onClick, highlights, priceFrom, color, isWaive }: {
  id: string, title: string, subtitle: string, badge?: string, selected: boolean,
  onClick: () => void, highlights: string[], priceFrom: string, color: string, isWaive?: boolean
}) {
  const borderColor = selected
    ? color === 'blue' ? 'border-blue-600' : color === 'teal' ? 'border-teal-600' : 'border-slate-400'
    : 'border-slate-200'
  const bgColor = selected
    ? color === 'blue' ? 'bg-blue-50' : color === 'teal' ? 'bg-teal-50' : 'bg-slate-50'
    : 'bg-white hover:bg-slate-50'

  return (
    <button
      onClick={onClick}
      className={cn('plan-card text-left relative', borderColor, bgColor, selected && 'shadow-sm')}
    >
      {badge && (
        <span className={cn('absolute -top-3 left-4 text-white text-[10px] font-bold px-2 py-0.5 rounded-full',
          color === 'blue' ? 'bg-blue-600' : color === 'teal' ? 'bg-teal-600' : 'bg-slate-500')}>
          {badge}
        </span>
      )}
      {selected && (
        <CheckCircle2 className={cn('absolute top-3 right-3 w-4 h-4',
          color === 'blue' ? 'text-blue-600' : color === 'teal' ? 'text-teal-600' : 'text-slate-500')} />
      )}
      <p className="font-semibold text-slate-900 text-sm mb-0.5">{title}</p>
      <p className="text-xs text-slate-500 mb-3">{subtitle}</p>
      <ul className="space-y-1 mb-4">
        {highlights.map((h, i) => (
          <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
            {isWaive
              ? <XCircle className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
              : <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />}
            {h}
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-400">Employee cost from</p>
      <p className={cn('text-lg font-bold', color === 'blue' ? 'text-blue-700' : color === 'teal' ? 'text-teal-700' : 'text-slate-600')}>
        {priceFrom}
      </p>
    </button>
  )
}

// ── Step: Provider Selection (DHMO only) ────────────────────
function ProviderStep({ selected, search, onSearchChange, providers, onSelect, onNext, onBack }: {
  selected: string | null, search: string, onSearchChange: (v: string) => void,
  providers: typeof DEMO_PROVIDERS, onSelect: (id: string, name: string) => void,
  onNext: () => void, onBack: () => void
}) {
  return (
    <div className="p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-1">Select Your Primary DHMO Dentist</h2>
      <p className="text-sm text-slate-500 mb-4">
        Under the DHMO plan, all dental care must be provided by your selected primary dentist.
        You can change your provider once per calendar year.
      </p>

      <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 mb-4">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search by name, practice, or city..."
          className="bg-transparent text-sm flex-1 outline-none text-slate-700 placeholder-slate-400"
        />
      </div>

      <div className="space-y-2 mb-6 max-h-80 overflow-y-auto">
        {providers.map(p => (
          <button key={p.id} onClick={() => onSelect(p.id, p.name)}
            className={cn(
              'w-full text-left rounded-xl border p-4 transition-all',
              selected === p.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
              !p.accepting && 'opacity-60'
            )}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                  {!p.accepting && (
                    <span className="text-[10px] bg-red-100 text-red-700 border border-red-200 rounded-full px-1.5 py-0.5 font-medium">
                      Not Accepting
                    </span>
                  )}
                  {selected === p.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-xs text-slate-500">{p.practice}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" /> {p.address}, {p.city} · {p.distance}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Phone className="w-3 h-3" /> {p.phone}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {p.languages.map(l => (
                    <span key={l} className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
        {providers.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">No providers found for "{search}"</p>
        )}
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!selected} />
    </div>
  )
}

// ── Step: Dependents ────────────────────────────────────────
function DependentsStep({ dependents, selected, onChange, onNext, onBack }: {
  dependents: typeof DEMO_DEPENDENTS, selected: string[],
  onChange: (ids: string[]) => void, onNext: () => void, onBack: () => void
}) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  return (
    <div className="p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-1">Add Dependents</h2>
      <p className="text-sm text-slate-500 mb-4">
        Select dependents to add to your dental coverage. Documentation must be submitted within 30 days.
        Domestic partners are only eligible for DHMO (CA) and Kaiser.
      </p>

      <div className="space-y-3 mb-6">
        {dependents.map(dep => {
          const isSelected = selected.includes(dep.id)
          const age = Math.floor((Date.now() - new Date(dep.dob).getTime()) / (1000*60*60*24*365.25))
          return (
            <button key={dep.id} onClick={() => toggle(dep.id)}
              className={cn('w-full text-left rounded-xl border p-4 transition-all',
                isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300')}>
              <div className="flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500')}>
                  {dep.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-slate-900">{dep.name}</p>
                    <span className="text-[10px] bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">{dep.relationship}</span>
                    <span className="text-[10px] text-slate-400">Age {age}</span>
                  </div>
                  {dep.hasOtherCoverage && (
                    <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                      Has other employer coverage — $125/paycheck surcharge applies
                    </p>
                  )}
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
              </div>
            </button>
          )
        })}
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mb-6">
        <p className="text-xs text-blue-800">
          <strong>Documentation required:</strong> Spouse → Marriage Certificate · Children → Birth Certificate ·
          Submit via Workday or email to benefits@ensignservices.net within 30 days.
        </p>
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  )
}

// ── Step: Coverage Tier ─────────────────────────────────────
function CoverageTierStep({ selected, dependentsSelected, planChoice, premiums, onChange, onNext, onBack }: {
  selected: CoverageTier | null, dependentsSelected: string[],
  planChoice: PlanChoice, premiums: Record<CoverageTier, { employee: number; employer: number }>,
  onChange: (t: CoverageTier) => void, onNext: () => void, onBack: () => void
}) {
  const hasSpouse = dependentsSelected.includes('d1')
  const hasChildren = dependentsSelected.some(id => ['d2','d3'].includes(id))

  const suggestedTier: CoverageTier = hasSpouse && hasChildren ? 'EF'
    : hasSpouse ? 'ES'
    : hasChildren ? 'EC'
    : 'EO'

  return (
    <div className="p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-1">Select Coverage Tier</h2>
      <p className="text-sm text-slate-500 mb-1">
        Based on the dependents you selected, we suggest: <strong>{COVERAGE_TIER_LABELS[suggestedTier]}</strong>
      </p>
      <p className="text-xs text-slate-400 mb-5">
        Premiums shown are monthly (employee cost) · Employer contributes $
        {premiums['EO'].employer.toFixed(2)}/mo · {planChoice} plan · Sample rates — not actual Ensign premiums
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {(Object.entries(COVERAGE_TIER_LABELS) as [CoverageTier, string][]).map(([tier, label]) => {
          const { employee, employer } = premiums[tier]
          const biweekly = monthlyToBiweekly(employee)
          const isSelected = selected === tier
          const isSuggested = tier === suggestedTier

          return (
            <button key={tier} onClick={() => onChange(tier)}
              className={cn('relative rounded-xl border p-4 text-left transition-all',
                isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50')}>
              {isSuggested && (
                <span className="absolute -top-2.5 left-3 text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">
                  Suggested
                </span>
              )}
              {isSelected && <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-blue-600" />}
              <p className="text-sm font-semibold text-slate-900 mb-0.5">{label}</p>
              <p className="text-xl font-bold text-blue-700">${employee.toFixed(2)}<span className="text-xs font-normal text-slate-500">/mo</span></p>
              <p className="text-xs text-slate-400">${biweekly.toFixed(2)}/paycheck (est.)</p>
              <p className="text-xs text-emerald-600 mt-1">Employer pays ${employer.toFixed(2)}/mo</p>
            </button>
          )
        })}
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!selected} />
    </div>
  )
}

// ── Step: Review & Submit ───────────────────────────────────
function ReviewStep({ state, carrier, premiums, paycheckAmount, spouseSurcharge, onSubmit, onBack, onEdit }: {
  state: WizardState, carrier: string, premiums: Record<CoverageTier, { employee: number; employer: number }>,
  paycheckAmount: number, spouseSurcharge: boolean,
  onSubmit: () => void, onBack: () => void, onEdit: (s: Step) => void
}) {
  const isWaive = state.planChoice === 'WAIVE'
  const dep = DEMO_DEPENDENTS.filter(d => state.dependentsSelected.includes(d.id))
  const surchargeAmount = spouseSurcharge ? monthlyToBiweekly(125 * 12 / 26 * 26 / 12) : 0 // $125/paycheck

  return (
    <div className="p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-4">Review Your Enrollment</h2>

      {isWaive ? (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5 mb-6">
          <p className="font-semibold text-red-900 mb-1">You are waiving dental coverage.</p>
          <p className="text-sm text-red-700">
            You will not have dental coverage for the 2026 plan year. You may only re-enroll
            during the next Open Enrollment period or upon a Qualifying Life Event (QLE).
          </p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {/* Plan summary */}
          <ReviewRow label="Plan" value={`${state.planChoice === 'PPO' ? `Dental PPO · ${carrier}` : 'Dental DHMO · Cigna'}`} onEdit={() => onEdit('plan')} />
          {state.planChoice === 'DHMO' && state.primaryProviderName && (
            <ReviewRow label="Primary Dentist" value={state.primaryProviderName} onEdit={() => onEdit('provider')} />
          )}
          <ReviewRow label="Coverage Tier" value={state.coverageTier ? COVERAGE_TIER_LABELS[state.coverageTier] : '—'} onEdit={() => onEdit('coverage')} />
          <ReviewRow label="Dependents" value={dep.length === 0 ? 'None' : dep.map(d => d.name).join(', ')} onEdit={() => onEdit('dependents')} />
          <ReviewRow label="Effective Date" value="July 1, 2026" />

          {/* Paycheck impact */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-900">Paycheck Impact Estimate</p>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Dental premium ({state.coverageTier && COVERAGE_TIER_LABELS[state.coverageTier]})</span>
                <span className="font-medium">-${paycheckAmount.toFixed(2)}/paycheck</span>
              </div>
              {spouseSurcharge && (
                <div className="flex justify-between text-amber-700">
                  <span>Spouse surcharge (has other employer coverage)</span>
                  <span className="font-medium">-$125.00/paycheck</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400 text-xs border-t border-slate-200 pt-1.5 mt-1.5">
                <span>Employer contribution ({state.coverageTier && `$${premiums[state.coverageTier!].employer.toFixed(2)}/mo`})</span>
                <span>not deducted from paycheck</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">* Sample rates only. Not actual Ensign payroll figures. 26 pay periods/year.</p>
          </div>

          {spouseSurcharge && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-800">
                <strong>Spouse Surcharge Applied:</strong> Sarah Rivera has access to other employer-sponsored coverage.
                A $125/paycheck surcharge is added per Ensign Services policy.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={onSubmit}
          className={cn('flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors',
            isWaive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700')}>
          {isWaive ? 'Confirm Waiver' : 'Submit Enrollment'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function ReviewRow({ label, value, onEdit }: { label: string, value: string, onEdit?: () => void }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-500 w-32 shrink-0">{label}</span>
      <span className="text-sm text-slate-900 flex-1">{value}</span>
      {onEdit && (
        <button onClick={onEdit} className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0">Edit</button>
      )}
    </div>
  )
}

// ── Confirmation Screen ─────────────────────────────────────
function ConfirmationScreen({ state, carrier }: { state: WizardState, carrier: string }) {
  const isWaive = state.planChoice === 'WAIVE'
  const colors = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']
  const confetti = !isWaive ? Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: colors[i % colors.length],
    delay: `${Math.random() * 1.5}s`,
    size: `${6 + Math.random() * 8}px`,
  })) : []

  return (
    <div className="max-w-xl mx-auto text-center py-12 relative overflow-hidden">
      {/* Confetti */}
      {confetti.map(c => (
        <div key={c.id} className="absolute top-0 pointer-events-none animate-bounce"
          style={{ left: c.left, animationDelay: c.delay, animationDuration: `${1 + Math.random()}s` }}>
          <div style={{ width: c.size, height: c.size, backgroundColor: c.color, borderRadius: '2px', opacity: 0.8 }} />
        </div>
      ))}
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">
        {state.planChoice === 'WAIVE' ? 'Dental Coverage Waived' : 'Enrollment Submitted!'}
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        {state.planChoice === 'WAIVE'
          ? 'You have waived dental coverage for the 2026 plan year. You may re-enroll during Open Enrollment or upon a QLE.'
          : `Your ${state.planChoice === 'PPO' ? `${carrier} Dental PPO` : 'Cigna Dental DHMO'} enrollment has been submitted.
             Coverage begins July 1, 2026. You will receive a confirmation email and your ID card within 7–10 business days.`
        }
      </p>
      {state.planChoice !== 'WAIVE' && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-left text-sm space-y-1.5 mb-6">
          <p className="font-semibold text-slate-900 mb-2">Next Steps</p>
          {state.planChoice === 'DHMO' && <p className="text-slate-600">✓ Primary dentist assigned: {state.primaryProviderName}</p>}
          {state.dependentsSelected.length > 0 && <p className="text-amber-700">⚠ Submit dependent documentation within 30 days</p>}
          <p className="text-slate-600">✓ Coverage effective: July 1, 2026</p>
          <p className="text-slate-600">✓ Carrier: {state.planChoice === 'PPO' ? carrier : 'Cigna'}</p>
        </div>
      )}
      <a href="/dashboard"
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700">
        Return to Dashboard <ChevronRight className="w-4 h-4" />
      </a>
    </div>
  )
}


// ── Shared: Step Navigation ─────────────────────────────────
function StepNav({ onBack, onNext, nextDisabled }: {
  onBack?: () => void, onNext?: () => void, nextDisabled?: boolean
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      {onBack && (
        <button onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}
      {onNext && (
        <button onClick={onNext} disabled={nextDisabled}
          className={cn('flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors',
            nextDisabled
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700')}>
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
