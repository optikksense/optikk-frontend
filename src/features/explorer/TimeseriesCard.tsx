import { useEffect, useRef } from "react"
import uPlot from "uplot"

import { Card } from "@/design-system/card"

export function TimeseriesCard({
  series,
  title,
}: {
  readonly series: { x: number[]; y: number[] }
  readonly title: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const chart = new uPlot(
      {
        width: containerRef.current.clientWidth || 600,
        height: 220,
        series: [{}, { stroke: "#00a9e0", fill: "rgba(0,169,224,0.14)" }],
        axes: [{ stroke: "#8ca4bf" }, { stroke: "#8ca4bf" }],
      },
      [series.x, series.y],
      containerRef.current,
    )

    return () => chart.destroy()
  }, [series])

  return (
    <Card className="space-y-3">
      <div className="text-sm font-medium">{title}</div>
      <div ref={containerRef} />
    </Card>
  )
}
