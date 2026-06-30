import { AppShell } from '@/components/layout/AppShell'
import { WorkerDetail } from '@/components/workers/WorkerDetail'

export default function WorkerDetailPage({ params }: { params: { id: string } }) {
  // id param is the employee_id (e.g. ESI-10001)
  const employeeId = decodeURIComponent(params.id)
  return (
    <AppShell pageTitle="Worker Profile" pageSubtitle={`${employeeId} · Benefits summary & accumulator view`}>
      <WorkerDetail employeeId={employeeId} />
    </AppShell>
  )
}
