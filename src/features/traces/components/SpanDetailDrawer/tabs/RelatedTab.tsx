import { Badge } from "@/components/ui";
import { formatDuration, formatTimestamp } from "@shared/utils/formatters";
import { useNavigate } from "@tanstack/react-router";
import { memo } from "react";

import type { RelatedTrace } from "../../../types";
import { STATUS_VARIANT } from "../statusVariant";

function RelatedTabComponent({ traces }: { traces: RelatedTrace[] }) {
  const navigate = useNavigate();
  if (traces.length === 0) {
    return <div className="sdd-center sdd-empty">No related traces found</div>;
  }
  return (
    <div className="sdd-attr-table">
      <div className="sdd-attr-table__header">
        <span style={{ flex: 2 }}>Trace ID</span>
        <span style={{ width: 80 }}>Status</span>
        <span style={{ width: 90 }}>Duration</span>
        <span style={{ flex: 1 }}>Start</span>
      </div>
      <div className="sdd-attr-table__body">
        {traces.map((t) => (
          <div
            key={t.traceId}
            className="sdd-attr-table__row sdd-attr-table__row--clickable"
            onClick={() => navigate({ to: `/traces/${t.traceId}` })}
          >
            <span className="font-mono text-xs" style={{ flex: 2, color: "var(--color-primary)" }}>
              {t.traceId.slice(0, 16)}…
            </span>
            <span style={{ width: 80 }}>
              <Badge variant={STATUS_VARIANT[t.status] ?? "default"}>{t.status || "UNSET"}</Badge>
            </span>
            <span style={{ width: 90 }}>{formatDuration(t.durationMs)}</span>
            <span style={{ flex: 1 }}>{formatTimestamp(t.startTime)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const RelatedTab = memo(RelatedTabComponent);
