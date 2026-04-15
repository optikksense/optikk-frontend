import { useParams } from "@tanstack/react-router"

import { Card } from "@/design-system/card"
import { PageFrame } from "@/design-system/page"

export function AlertRuleDetailPage() {
  const { ruleId } = useParams({ strict: false })

  return (
    <PageFrame
      title="Alert Rule Detail"
      subtitle="Detail route preserved for notifications and direct rule links."
      eyebrow="Alerts"
    >
      <Card>{ruleId}</Card>
    </PageFrame>
  )
}
