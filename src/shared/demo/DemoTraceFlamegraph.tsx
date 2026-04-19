import { DEMO_TRACE, type DemoSpan } from "./fixtures";

const SERVICE_COLOR: Record<string, string> = {
  gateway: "#8B7FFF",
  "auth-api": "#8CD6C5",
  "catalog-api": "#F38B6B",
  "pricing-api": "#F2C14E",
  "payments-api": "#66C2A5",
  "checkout-api": "#6BB6FF",
  "notify-worker": "#D978FF",
};

function spanLeft(span: DemoSpan, totalMs: number): string {
  return `${(span.startMs / totalMs) * 100}%`;
}

function spanWidth(span: DemoSpan, totalMs: number): string {
  const pct = (span.durMs / totalMs) * 100;
  return `${Math.max(pct, 0.5)}%`;
}

export default function DemoTraceFlamegraph() {
  const { spans, totalMs, rootName } = DEMO_TRACE;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between text-[12px]">
        <span className="font-mono text-[var(--text-primary)]">{rootName}</span>
        <span className="text-[var(--text-muted)]">
          {totalMs}ms · {spans.length} spans · trace_id=8f3c…
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3">
        <div className="flex flex-col gap-1">
          {spans.map((span, i) => {
            const color = SERVICE_COLOR[span.service] ?? "#8B7FFF";
            const opacity = span.critical ? 1 : 0.55;
            return (
              <div key={i} className="grid items-center gap-2" style={{ gridTemplateColumns: "180px 1fr 60px" }}>
                <div
                  className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-[var(--text-primary)]"
                  style={{ paddingLeft: span.depth * 12 }}
                >
                  {span.name}
                </div>
                <div className="relative h-5 rounded bg-[var(--bg-secondary)]">
                  <div
                    className="absolute top-0 h-full rounded"
                    style={{
                      left: spanLeft(span, totalMs),
                      width: spanWidth(span, totalMs),
                      backgroundColor: color,
                      opacity,
                    }}
                  />
                </div>
                <div className="text-right font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                  {span.durMs}ms
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
