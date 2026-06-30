export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'TEMP' | 'INTERN' | 'CASUAL' | 'ON_CALL'
export type BenefitTier = 'FULL' | 'LIMITED' | 'TEMP' | 'CASUAL'
export type EmployeeCategory = 'FAST_TRACK' | 'STANDARD'
export type CoverageTier = 'EO' | 'ES' | 'EC' | 'EF'
export type PlanType = 'PPO' | 'DHMO' | 'HMO' | 'EPO' | 'HDHP'
export type EnrollmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'ACTIVE' | 'WAIVED' | 'EXPIRED'
export type WorkerStatus = 'ACTIVE' | 'TERMINATED' | 'LOA' | 'SUSPENDED'
export type DependentRelationship = 'SPOUSE' | 'DOMESTIC_PARTNER' | 'CHILD' | 'STEPCHILD' | 'ADOPTED_CHILD' | 'LEGAL_WARD' | 'DISABLED_ADULT_CHILD'
export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'BENEFITS_PARTNER' | 'HRIS_ANALYST' | 'HR_LEADERSHIP'
export type QleStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'

export interface Worker {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  preferred_name?: string
  email: string
  phone?: string
  hire_date: string
  termination_date?: string
  worker_status: WorkerStatus
  employment_type: EmploymentType
  avg_weekly_hours: number
  benefit_tier?: BenefitTier
  employee_category: EmployeeCategory
  job_profile_id?: string
  organization_id?: string
  work_state: string
  work_city?: string
  manager_id?: string
  coverage_start_date?: string
  enrollment_deadline?: string
  role: UserRole
  created_at: string
  updated_at: string
  // joined
  job_profile?: JobProfile
  organization?: Organization
}

export interface Organization {
  id: string
  name: string
  org_type: string
  parent_id?: string
  location_state?: string
  location_city?: string
  active: boolean
}

export interface JobProfile {
  id: string
  title: string
  code: string
  management_level?: string
  flsa_status: string
  fast_track_benefits: boolean
}

export interface Dependent {
  id: string
  worker_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  relationship: DependentRelationship
  has_other_employer_coverage: boolean
  disabled_before_26: boolean
  unable_to_self_support: boolean
  doc_status: 'PENDING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED'
  doc_verified_at?: string
}

export interface DentalCarrier {
  id: string
  name: string
  group_number: string
  phone: string
  website: string
  states_served?: string[]
}

export interface DentalPlan {
  id: string
  plan_name: string
  plan_type: PlanType
  carrier_id: string
  states_eligible?: string[]
  deductible_individual?: number
  deductible_family?: number
  calendar_year_max?: number
  ortho_lifetime_max?: number
  ortho_covered: boolean
  prev_diagnostic_pct: number
  basic_restorative_pct: number
  major_services_pct: number
  ortho_pct: number
  tmj_pct: number
  is_dhmo: boolean
  effective_date: string
  active: boolean
  carrier?: DentalCarrier
  premiums?: DentalPremium[]
}

export interface DentalPremium {
  id: string
  plan_id: string
  coverage_tier: CoverageTier
  employee_monthly: number
  employer_monthly: number
}

export interface DhmoProvider {
  id: string
  npi?: string
  provider_name: string
  practice_name?: string
  address: string
  city: string
  state: string
  zip: string
  phone?: string
  accepting_new_patients: boolean
  languages: string[]
  specialties: string[]
}

export interface DentalElection {
  id: string
  worker_id: string
  plan_id?: string
  coverage_tier?: CoverageTier
  effective_date?: string
  end_date?: string
  enrollment_status: EnrollmentStatus
  waived: boolean
  waive_reason?: string
  primary_dhmo_provider_id?: string
  event_type?: string
  submitted_at?: string
  plan?: DentalPlan
  provider?: DhmoProvider
}

export interface DentalAccumulator {
  id: string
  worker_id: string
  plan_year: number
  deductible_individual_used: number
  deductible_family_used: number
  annual_max_used: number
  ortho_lifetime_used: number
  // from view
  calendar_year_max?: number
  ortho_lifetime_max?: number
  deductible_individual?: number
  annual_max_remaining?: number
  ortho_lifetime_remaining?: number
  deductible_remaining?: number
  deductible_met?: boolean
}

export interface DentalProcedureCode {
  id: string
  ada_code: string
  description: string
  category: string
  service_class: string
  frequency_limit?: string
  waiting_period_months: number
  typical_fee_low?: number
  typical_fee_high?: number
  dhmo_copay?: number
  notes?: string
}

export interface InboxTask {
  id: string
  worker_id: string
  task_type: string
  title: string
  description?: string
  due_date?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'
  created_at: string
  completed_at?: string
}

export interface QleEvent {
  id: string
  worker_id: string
  qle_code: string
  event_date: string
  election_date?: string
  coverage_start_date?: string
  deadline: string
  status: QleStatus
  documentation_submitted: boolean
  notes?: string
}

// Utility
export const COVERAGE_TIER_LABELS: Record<CoverageTier, string> = {
  EO: 'Employee Only',
  ES: 'Employee + Spouse',
  EC: 'Employee + Children',
  EF: 'Employee + Family',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  BENEFITS_PARTNER: 'Benefits Partner',
  HRIS_ANALYST: 'HRIS Analyst',
  HR_LEADERSHIP: 'HR Leadership',
}

export function getDentalCarrierForState(state: string): 'Delta Dental' | 'Cigna' {
  return ['ID', 'OR', 'WA'].includes(state) ? 'Delta Dental' : 'Cigna'
}

export function getDaysUntilDeadline(deadline: string): number {
  const d = new Date(deadline)
  const today = new Date()
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
