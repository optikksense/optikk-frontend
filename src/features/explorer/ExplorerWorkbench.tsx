import { useMemo, useState } from "react"

import { Badge } from "@/design-system/badge"
import { Button } from "@/design-system/button"
import { Card } from "@/design-system/card"
import { PageFrame } from "@/design-system/page"
import { useLiveTail } from "@/platform/stream/use-live-tail"
import { buildLogsHubHref, buildTracesHubHref } from "@/platform/url/compatibility"

import { QueryEditor } from "@/features/explorer/QueryEditor"
import { TimeseriesCard } from "@/features/explorer/TimeseriesCard"
import { VirtualizedTable } from "@/features/explorer/VirtualizedTable"
import { buildExplorerRecords, buildSeries } from "@/features/explorer/mock-data"

export function ExplorerWorkbench({
  description,
  scope,
  title,
}: {
  readonly description: string
  readonly scope: string
  readonly title: string
}) {
  const [query, setQuery] = useState(`service:${scope} AND env:prod`)
  const [streaming, setStreaming] = useState(false)
  const rows = useMemo(() => buildExplorerRecords(scope), [scope])
  const series = useMemo(() => buildSeries(scope), [scope])
  const liveTail = useLiveTail(scope, streaming)
  const shareHref =
    scope === "traces" ? buildTracesHubHref({ filters: [] }) : buildLogsHubHref({ filters: [] })

  return (
    <PageFrame
      title={title}
      subtitle={description}
      eyebrow="Explorer"
      actions={
        <>
          <Button variant="secondary" onClick={() => navigator.clipboard.writeText(shareHref)}>
            Copy Share Link
          </Button>
          <Button onClick={() => setStreaming((value) => !value)}>
            {streaming ? "Stop Live Tail" : "Start Live Tail"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <QueryEditor value={query} onChange={setQuery} />
        <Card className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{scope}</Badge>
            <Badge tone={liveTail.status === "live" ? "success" : "default"}>
              {liveTail.status}
            </Badge>
            <Badge>{rows.length} rows</Badge>
          </div>
          <div className="text-sm text-muted">
            URL compatibility, live tail transport, and dense explorer primitives are all wired from
            the new greenfield shell.
          </div>
          <div className="space-y-2 text-xs text-muted">
            {liveTail.items.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-xl bg-panelAlt px-3 py-2">
                {item.message}
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <TimeseriesCard series={series} title={`${title} throughput`} />
        <VirtualizedTable rows={rows} />
      </div>
    </PageFrame>
  )
}
