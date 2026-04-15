import { Badge } from "@/design-system/badge"
import { Card } from "@/design-system/card"
import { PageFrame } from "@/design-system/page"

export function OverviewPage() {
  return (
    <PageFrame
      title="Overview"
      subtitle="A fresh summary surface for golden signals, service health, and top risks."
      eyebrow="Product"
      actions={<Badge tone="accent">Route compatible</Badge>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {["Latency", "Errors", "Service health"].map((item) => (
          <Card key={item}>{item} block placeholder in the new architecture.</Card>
        ))}
      </div>
    </PageFrame>
  )
}
