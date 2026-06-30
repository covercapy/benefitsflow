import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, differenceInDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'MMM d, yyyy')
  } catch {
    return '—'
  }
}

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatPercent(value: number): string {
  return `${value}%`
}

export function getDaysUntilDeadline(deadline: string): number {
  return differenceInDays(parseISO(deadline), new Date())
}

export function getDeadlineUrgency(days: number): 'safe' | 'warning' | 'urgent' | 'expired' {
  if (days < 0) return 'expired'
  if (days <= 3) return 'urgent'
  if (days <= 7) return 'warning'
  return 'safe'
}

export function getBenefitTierLabel(tier: string): string {
  const labels: Record<string, string> = {
    FULL: 'Full Benefits',
    LIMITED: 'Medical & HSA Only',
    TEMP: 'Medical & HSA Only',
    CASUAL: 'Legally Required Only',
  }
  return labels[tier] || tier
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function calculateAnnualMaxRemaining(used: number, max: number | null): number | null {
  if (max === null) return null // unlimited
  return Math.max(0, max - used)
}

export function calculateDeductibleRemaining(used: number, deductible: number): number {
  return Math.max(0, deductible - used)
}

// Monthly premium → per-paycheck (26 pay periods)
export function monthlyToBiweekly(monthly: number): number {
  return (monthly * 12) / 26
}
