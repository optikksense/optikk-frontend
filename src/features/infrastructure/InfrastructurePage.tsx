import { Card } from "@/design-system/card"
import { PageFrame } from "@/design-system/page"

export function InfrastructurePage() {
  return (
    <PageFrame
      title="Infrastructure"
      subtitle="Fleet, grouping, and fill-size controls stay frontend-owned in the new architecture."
      eyebrow="Product"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card>Fleet lens</Card>
        <Card>Grouping controls</Card>
        <Card>Resource drilldowns</Card>
      </div>
    </PageFrame>
  )
}
