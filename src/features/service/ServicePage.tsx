import { Card } from "@/design-system/card"
import { PageFrame } from "@/design-system/page"

export function ServicePage() {
  return (
    <PageFrame
      title="Service"
      subtitle="Frontend-owned service discovery and topology remain first-class in the rewrite."
      eyebrow="Product"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card>Discovery tab placeholder</Card>
        <Card>Topology tab placeholder</Card>
      </div>
    </PageFrame>
  )
}
