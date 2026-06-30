import { AppShell } from '@/components/layout/AppShell'
import { InboxView } from '@/components/inbox/InboxView'

export default function InboxPage() {
  return (
    <AppShell pageTitle="Inbox" pageSubtitle="Action items · Business process tasks · Life events">
      <InboxView />
    </AppShell>
  )
}
