import { ExplorerWorkbench } from "@/features/explorer/ExplorerWorkbench"

export function TracesPage() {
  return (
    <ExplorerWorkbench
      scope="traces"
      title="Traces"
      description="Dense trace exploration with time-series, table virtualization, and share-safe URLs."
    />
  )
}
