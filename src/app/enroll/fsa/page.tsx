import { AppShell } from '@/components/layout/AppShell'
import { FSAEnrollment } from '@/components/benefits/FSAEnrollment'

export default function FSAPage() {
  return (
    <AppShell pageTitle="FSA / HSA" pageSubtitle="Healthcare Flexible Spending Account · IRS plan year 2026">
      <FSAEnrollment />
    </AppShell>
  )
}
