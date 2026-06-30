import { AppShell } from '@/components/layout/AppShell'
import { DentalEnrollmentWizard } from '@/components/dental/DentalEnrollmentWizard'

export default function DentalEnrollmentPage() {
  return (
    <AppShell
      pageTitle="Dental Enrollment"
      pageSubtitle="Benefit Change – New Hire · Plan year 2026 · Deadline: 30 days from hire"
    >
      <DentalEnrollmentWizard />
    </AppShell>
  )
}
