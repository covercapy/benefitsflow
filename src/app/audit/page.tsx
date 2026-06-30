import { AppShell } from '@/components/layout/AppShell'
import { AuditLog } from '@/components/audit/AuditLog'

export default function AuditPage() {
  return (
    <AppShell pageTitle="Audit Log" pageSubtitle="System-wide benefit change history · Immutable record · HRIS Analyst & HR Leadership only">
      <AuditLog />
    </AppShell>
  )
}
