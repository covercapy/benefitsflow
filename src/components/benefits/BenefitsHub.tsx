'use client'

import Link from 'next/link'
import { ChevronRight, Heart, DollarSign, Eye, Stethoscope, Pill, Umbrella, Wallet, TrendingUp, Car, Info, CheckCircle2 } from 'lucide-react'

// ── Gradient recommendation cards ────────────────────────────────────────────
function GradientCard({
  title,
  description,
  gradient,
  iconBg,
  icon: Icon,
  href,
  shapeColor,
}: {
  title: string
  description: string
  gradient: string
  iconBg: string
  icon: React.ElementType
  href: string
  shapeColor: string
}) {
  return (
    <Link
      href={href}
      className={`relative flex flex-col justify-between p-5 rounded-2xl overflow-hidden min-h-[140px] cursor-pointer hover:shadow-lg transition-all group ${gradient}`}
    >
      {/* Decorative shape */}
      <div
        className={`absolute right-0 top-0 w-28 h-28 rounded-full opacity-20 translate-x-8 -translate-y-8 ${shapeColor}`}
      />
      <div
        className={`absolute right-4 bottom-0 w-20 h-20 rounded-full opacity-15 translate-y-6 ${shapeColor}`}
      />

      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* Text */}
      <div className="mt-4 relative z-10">
        <h3 className="font-bold text-slate-800 text-sm leading-tight">{title}</h3>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{description}</p>
      </div>
    </Link>
  )
}

// ── Single list row ───────────────────────────────────────────────────────────
function BenefitRow({
  icon: Icon,
  iconBg,
  title,
  description,
  href,
  badge,
}: {
  icon: React.ElementType
  iconBg: string
  title: string
  description: string
  href: string
  badge?: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
            {title}
          </p>
          {badge && (
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-400 transition-colors shrink-0" />
    </Link>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function BenefitSection({
  icon: Icon,
  iconColor,
  title,
  children,
  seeAllHref,
}: {
  icon: React.ElementType
  iconColor: string
  title: string
  children: React.ReactNode
  seeAllHref?: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        </div>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-xs font-semibold text-slate-500 hover:text-violet-600 transition-colors px-3 py-1 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50"
          >
            See All
          </Link>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {children}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function BenefitsHub() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Recommended cards */}
      <section>
        <h2 className="text-sm font-bold text-slate-700 mb-4">Recommended for your company</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GradientCard
            title="Health Benefits"
            description="Medical, dental and vision benefits keep your employees healthy and happy."
            gradient="bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100"
            iconBg="bg-violet-500"
            icon={Heart}
            href="/enroll/dental"
            shapeColor="bg-violet-400"
          />
          <GradientCard
            title="Financial Future"
            description="Help employees save pre-tax money for their financial future."
            gradient="bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100"
            iconBg="bg-orange-400"
            icon={DollarSign}
            href="/enroll/fsa"
            shapeColor="bg-orange-400"
          />
          <GradientCard
            title="Commuter"
            description="Help your employees spend less money when they commute to work."
            gradient="bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100"
            iconBg="bg-sky-500"
            icon={Car}
            href="/enroll"
            shapeColor="bg-sky-400"
          />
        </div>
      </section>

      {/* Health section */}
      <BenefitSection icon={Heart} iconColor="text-rose-500" title="Health" seeAllHref="/enroll">
        <BenefitRow
          icon={Stethoscope}
          iconBg="bg-blue-500"
          title="Medical, Dental & Vision"
          description="Get medical, vision, and dental benefits administration at no extra cost."
          href="/enroll/dental"
          badge="Active"
        />
        <BenefitRow
          icon={DollarSign}
          iconBg="bg-emerald-500"
          title="Health Savings Account"
          description="Help employees with high-deductible health plans set aside money for health expenses."
          href="/enroll/fsa"
        />
        <BenefitRow
          icon={Heart}
          iconBg="bg-violet-500"
          title="Flexible Spending Account – Medical"
          description="Give employees a tax-advantaged way to set aside money for health expenses."
          href="/enroll/fsa"
          badge="Active"
        />
        <BenefitRow
          icon={Pill}
          iconBg="bg-amber-500"
          title="Prescription Drug"
          description="$10 generic / $35 preferred brand / $60 non-preferred. Bundled with medical."
          href="/enroll"
          badge="Active"
        />
      </BenefitSection>

      {/* Financial Health section */}
      <BenefitSection icon={DollarSign} iconColor="text-orange-500" title="Financial Health" seeAllHref="/payroll">
        <BenefitRow
          icon={Wallet}
          iconBg="bg-slate-600"
          title="Wallet"
          description="A benefit that helps employees manage their paychecks and save money at no cost to employers."
          href="/payroll"
        />
        <BenefitRow
          icon={TrendingUp}
          iconBg="bg-rose-500"
          title="Traditional or Roth 401(k)"
          description="Invest in your team's future with low-cost retirement plans. 4% employer match."
          href="/payroll"
        />
        <BenefitRow
          icon={DollarSign}
          iconBg="bg-orange-400"
          title="Financial Wellness Program"
          description="Pre-tax savings, employer contributions, and financial planning resources."
          href="/enroll/fsa"
        />
      </BenefitSection>

      {/* Life & Protection */}
      <BenefitSection icon={Umbrella} iconColor="text-violet-500" title="Life & Protection" seeAllHref="/enroll">
        <BenefitRow
          icon={Umbrella}
          iconBg="bg-violet-500"
          title="Life & AD&D Insurance"
          description="Basic life at 2× annual salary — employer paid. Supplemental life available."
          href="/enroll"
          badge="Active"
        />
        <BenefitRow
          icon={Eye}
          iconBg="bg-teal-500"
          title="Vision Plan"
          description="VSP Choice Plan — annual eye exam + $150 frame allowance. Employee + Family coverage."
          href="/enroll/vision"
          badge="Active"
        />
      </BenefitSection>

      {/* Open enrollment callout */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-violet-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-violet-900">Open enrollment opens November 1, 2026</p>
          <p className="text-xs text-violet-700 mt-0.5 leading-relaxed">
            Change plans, update coverage tiers, add dependents, and adjust FSA elections.
            Changes take effect January 1, 2027.
          </p>
        </div>
        <Link
          href="/inbox"
          className="text-xs font-bold text-violet-700 bg-white border border-violet-200 px-3 py-1.5 rounded-lg whitespace-nowrap hover:bg-violet-100 transition-colors shrink-0"
        >
          Report Life Event
        </Link>
      </div>

      {/* Enrolled summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Plans Active', value: '5', sub: 'across 3 categories', icon: CheckCircle2, color: 'text-emerald-600', iconBg: 'bg-emerald-50' },
          { label: 'Monthly Deduction', value: '$354', sub: 'from paycheck', icon: DollarSign, color: 'text-slate-900', iconBg: 'bg-slate-50' },
          { label: 'Employer Contributes', value: '$300', sub: 'toward health premium', icon: Heart, color: 'text-blue-600', iconBg: 'bg-blue-50' },
          { label: 'Open Enrollment', value: '124d', sub: 'Nov 1 – Nov 30, 2026', icon: Heart, color: 'text-violet-600', iconBg: 'bg-violet-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.iconBg} mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs font-medium text-slate-700 mt-0.5">{s.label}</p>
            <p className="text-[11px] text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

    </div>
  )
}
