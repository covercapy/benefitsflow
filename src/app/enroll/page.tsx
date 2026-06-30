import { AppShell } from '@/components/layout/AppShell'
import { BenefitsHub } from '@/components/benefits/BenefitsHub'

export default function EnrollPage() {
  return (
    <AppShell pageTitle="My Benefits" pageSubtitle="Plan year 2026 · All benefit elections & coverage summary">
      <BenefitsHub />
    </AppShell>
  )
}
