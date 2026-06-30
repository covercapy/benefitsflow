import { AppShell } from '@/components/layout/AppShell'
import { ProcedureEstimator } from '@/components/estimator/ProcedureEstimator'

export default function EstimatorPage() {
  return (
    <AppShell pageTitle="Procedure Cost Estimator" pageSubtitle="Estimate your out-of-pocket cost under each dental plan · ADA CDT procedure codes">
      <ProcedureEstimator />
    </AppShell>
  )
}
