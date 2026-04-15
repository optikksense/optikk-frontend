import { Card } from "@/design-system/card"
import { PageFrame } from "@/design-system/page"

export function SaturationPage() {
  return (
    <PageFrame
      title="Saturation"
      subtitle="Datastores and Kafka saturation routes remain stable while the UI is rebuilt from scratch."
      eyebrow="Product"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card>Datastores overview</Card>
        <Card>Kafka overview</Card>
      </div>
    </PageFrame>
  )
}
