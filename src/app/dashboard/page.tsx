import { AppShell } from '@/components/layout/AppShell'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

export default function DashboardPage() {
  return (
    <AppShell pageTitle="Dashboard" pageSubtitle="Your benefits overview · Plan year 2026">
      <DashboardContent />
    </AppShell>
  )
}
