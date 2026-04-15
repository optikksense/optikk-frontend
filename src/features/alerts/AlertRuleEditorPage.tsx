import { useParams } from "@tanstack/react-router"

import { Card } from "@/design-system/card"
import { PageFrame } from "@/design-system/page"

export function AlertRuleEditorPage() {
  const { ruleId } = useParams({ strict: false })

  return (
    <PageFrame
      title={ruleId ? "Edit alert rule" : "New alert rule"}
      subtitle="React Hook Form + Zod becomes the baseline for all configuration workflows."
      eyebrow="Alerts"
    >
      <Card>Rule ID: {ruleId ?? "new"}</Card>
    </PageFrame>
  )
}
