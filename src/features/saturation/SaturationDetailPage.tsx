import { Card } from "@/design-system/card"
import { PageFrame } from "@/design-system/page"

export function SaturationDetailPage({
  entity,
  value,
}: {
  readonly entity: string
  readonly value?: string
}) {
  return (
    <PageFrame
      title={`Saturation ${entity}`}
      subtitle="Compatibility detail route preserved for direct drilldowns."
      eyebrow="Detail"
    >
      <Card>{value ?? "Unknown target"}</Card>
    </PageFrame>
  )
}
