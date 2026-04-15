import { ExplorerWorkbench } from "@/features/explorer/ExplorerWorkbench"

export function MetricsPage() {
  return (
    <ExplorerWorkbench
      scope="metrics"
      title="Metrics"
      description="uPlot-backed time-series and dense query workflows anchor the new metrics surface."
    />
  )
}
