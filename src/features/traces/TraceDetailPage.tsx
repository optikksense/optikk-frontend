import { useParams } from "@tanstack/react-router"

import { Card } from "@/design-system/card"
import { PageFrame } from "@/design-system/page"

export function TraceDetailPage() {
  const { traceId } = useParams({ strict: false })

  return (
    <PageFrame
      title="Trace Detail"
      subtitle="Compatibility route preserved for deep links from logs, alerts, and LLM workflows."
      eyebrow="Trace"
    >
      <Card>Trace ID: {traceId}</Card>
    </PageFrame>
  )
}
