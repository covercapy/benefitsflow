import { AppShell } from '@/components/layout/AppShell'
import { ReportsDashboard } from '@/components/reports/ReportsDashboard'

export default function ReportsPage() {
  return (
    <AppShell pageTitle="Reports & Analytics" pageSubtitle="Enrollment reporting · Plan year 2026 · HR Leadership & HRIS Analyst view">
      <ReportsDashboard />
    </AppShell>
  )
}
