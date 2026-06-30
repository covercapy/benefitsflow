import { AppShell } from '@/components/layout/AppShell'
import { WorkersTable } from '@/components/workers/WorkersTable'

export default function WorkersPage() {
  return (
    <AppShell pageTitle="Worker Directory" pageSubtitle="Active workforce · Eligibility & enrollment status">
      <WorkersTable />
    </AppShell>
  )
}
