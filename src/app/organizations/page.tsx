import { AppShell } from '@/components/layout/AppShell'
import { OrganizationsView } from '@/components/organizations/OrganizationsView'

export default function OrganizationsPage() {
  return (
    <AppShell pageTitle="Organizations" pageSubtitle="Ensign facility hierarchy · 378 facilities · Benefit eligibility by org">
      <OrganizationsView />
    </AppShell>
  )
}
