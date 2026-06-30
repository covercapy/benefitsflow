import { AppShell } from '@/components/layout/AppShell'
import { VisionEnrollment } from '@/components/benefits/VisionEnrollment'

export default function VisionPage() {
  return (
    <AppShell pageTitle="Vision Enrollment" pageSubtitle="VSP Choice Plan · Plan year 2026 · Administered by VSP">
      <VisionEnrollment />
    </AppShell>
  )
}
