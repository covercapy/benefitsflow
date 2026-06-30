import { AppShell } from '@/components/layout/AppShell'
import { ProcessCenter } from '@/components/processes/ProcessCenter'

export default function ProcessesPage() {
  return (
    <AppShell pageTitle="Business Process Center" pageSubtitle="Workday-style BP definitions · Routing rules · Active instances">
      <ProcessCenter />
    </AppShell>
  )
}
