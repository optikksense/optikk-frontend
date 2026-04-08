import { Tooltip } from "@/components/ui";
import { formatDuration } from "@shared/utils/formatters";
import type { SpanKindDuration } from "../../types";

const KIND_COLORS: Record<string, string> = {
  SERVER: "#648FFF",
  CLIENT: "#785EF0",
  INTERNAL: "#6b7280",
  PRODUCER: "#06aed5",
  CONSUMER: "#73c991",
  UNSPECIFIED: "#9ca3af",
};

function kindColor(kind: string): string {
  return KIND_COLORS[kind.toUpperCase()] ?? "#9ca3af";
}

interface Props {
  data: SpanKindDuration[];
}

export default function SpanKindBreakdown({ data }: Props) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((s, d) => s + d.totalDurationMs, 0);

  return (
    <div>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 1 }}>
        {data.map((d) => (
          <Tooltip
            key={d.spanKind}
            content={`${d.spanKind}: ${formatDuration(d.totalDurationMs)} · ${d.pctOfTrace.toFixed(1)}% · ${d.spanCount} spans`}
          >
            <div
              style={{
                flex: total > 0 ? d.totalDurationMs / total : 1 / data.length,
                background: kindColor(d.spanKind),
                minWidth: 4,
                cursor: "default",
              }}
            />
          </Tooltip>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 6 }}>
        {data.map((d) => (
          <span
            key={d.spanKind}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              color: "var(--text-secondary)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: kindColor(d.spanKind),
                flexShrink: 0,
              }}
            />
            {d.spanKind}
            <span style={{ opacity: 0.6 }}>{d.pctOfTrace.toFixed(1)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
