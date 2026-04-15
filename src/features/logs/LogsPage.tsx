import { ExplorerWorkbench } from "@/features/explorer/ExplorerWorkbench"

export function LogsPage() {
  return (
    <ExplorerWorkbench
      scope="logs"
      title="Logs"
      description="Structured log explorer with live tail, facets, and shareable views aligned with the new shell."
    />
  )
}
