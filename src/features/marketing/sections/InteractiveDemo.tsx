import { useState } from "react"

import {
  DemoKpiStrip,
  DemoLogsList,
  DemoServicesGrid,
  DemoTimeseriesChart,
  DemoTraceFlamegraph,
} from "@shared/demo"



export type DemoPanelId =
  | "timeseries"
  | "logs"
  | "services"
  | "flamegraph"
  | "kpi"

export interface InteractiveDemoSection {
  readonly kind: "interactive-demo"
  readonly eyebrow?: string
  readonly title?: string
  readonly body?: string
  readonly panels: ReadonlyArray<DemoPanelId>
  readonly defaultPanel?: DemoPanelId
  /** When false, render naked (used inside Hero's ScreenshotFrame). */
  readonly framed?: boolean
}

const PANEL_LABELS: Record<DemoPanelId, string> = {
  kpi: "Overview",
  timeseries: "Metrics",
  services: "Services",
  logs: "Logs",
  flamegraph: "Traces",
}

function PanelBody({ id }: { readonly id: DemoPanelId }) {
  switch (id) {
    case "kpi":
      return <DemoKpiStrip />
    case "timeseries":
      return (
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--mkt-border,rgba(255,255,255,0.08))] bg-[var(--mkt-bg-deep,#07090d)] p-3">
            <div className="mb-2 font-mono text-[11px] text-[var(--mkt-text-mute,#6b7385)]">
              rate(http_requests_total[1m]) by (service)
            </div>
            <DemoTimeseriesChart variant="requests" height={220} legend />
          </div>
          <div className="rounded-lg border border-[var(--mkt-border,rgba(255,255,255,0.08))] bg-[var(--mkt-bg-deep,#07090d)] p-3">
            <div className="mb-2 font-mono text-[11px] text-[var(--mkt-text-mute,#6b7385)]">
              histogram_quantile(0.95, http_request_duration_seconds)
            </div>
            <DemoTimeseriesChart variant="p95" height={220} legend />
          </div>
        </div>
      )
    case "services":
      return (
        <div className="flex flex-col gap-3">
          <DemoKpiStrip variant="compact" />
          <DemoServicesGrid />
        </div>
      )
    case "logs":
      return (
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <span className="font-mono text-[11px] text-[var(--mkt-text-mute,#6b7385)]">
              service:* level:(ERROR OR WARN OR INFO)
            </span>
            <span className="font-mono text-[11px] text-[var(--mkt-text-mute,#6b7385)]">
              live tail · 12k/s
            </span>
          </div>
          <DemoLogsList />
        </div>
      )
    case "flamegraph":
      return (
        <div>
          <div className="mb-3 font-mono text-[11px] text-[var(--mkt-text-mute,#6b7385)]">
            trace_id=4f9c3e… · critical path highlighted
          </div>
          <DemoTraceFlamegraph />
        </div>
      )
  }
}

export function InteractiveDemo({
  eyebrow,
  title,
  body,
  panels,
  defaultPanel,
  framed = true,
}: InteractiveDemoSection) {
  const initial = defaultPanel && panels.includes(defaultPanel) ? defaultPanel : panels[0]
  const [active, setActive] = useState<DemoPanelId>(initial)

  const inner = (
    <div className="marketing-interactive-demo">
      <div className="marketing-interactive-demo-tabs" role="tablist">
        {panels.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            data-active={id === active}
            aria-selected={id === active}
            className="marketing-interactive-demo-tab"
            onClick={() => setActive(id)}
          >
            {PANEL_LABELS[id]}
          </button>
        ))}
      </div>
      <div className="marketing-interactive-demo-panel">
        <PanelBody id={active} />
      </div>
      <div className="marketing-interactive-demo-footnote">
        Frozen snapshot — no live API calls
      </div>
    </div>
  )

  if (!framed) {
    return inner
  }

  return (
    <section className="marketing-section">
      <div className="marketing-container">
        {(eyebrow || title || body) && (
          <div className="marketing-section-header">
            {eyebrow ? <div className="marketing-eyebrow">{eyebrow}</div> : null}
            {title ? <h2 className="marketing-h2">{title}</h2> : null}
            {body ? <p className="marketing-body">{body}</p> : null}
          </div>
        )}
        <div className="screenshot-frame border rounded-xl overflow-hidden shadow-2xl">{inner}</div>
      </div>
    </section>
  )
}
