import { memo } from "react";

import type { Monitor } from "../../api/monitorsApi";

interface Props {
  readonly monitor: Monitor;
}

function formatQuery(m: Monitor): string {
  if (m.query.metric) {
    const { metric, aggregation, windowSec } = m.query.metric;
    return `${aggregation}(last_${windowSec}s):${metric}`;
  }
  if (m.query.apm) {
    const { service, resource, track, windowSec } = m.query.apm;
    const res = resource ? `,resource:${resource}` : "";
    return `apm(last_${windowSec}s):${track}{service:${service}${res}}`;
  }
  if (m.query.log) {
    const { query, windowSec } = m.query.log;
    return `logs("${query}").rollup("count","last_${windowSec}s")`;
  }
  return "—";
}

function QueryCard({ monitor }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-medium text-foreground text-sm">Query</div>
      <div className="mt-3 rounded border border-border bg-secondary p-3">
        <div className="break-words font-mono text-foreground text-xs">{formatQuery(monitor)}</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded bg-secondary p-2.5">
          <div className="text-[10px] text-foreground-muted">Comparator</div>
          <div className="mt-0.5 font-mono text-xs">{monitor.conditions.comparator}</div>
        </div>
        <div className="rounded bg-secondary p-2.5">
          <div className="text-[10px] text-foreground-muted">Recovery</div>
          <div className="mt-0.5 font-mono text-xs">
            {monitor.conditions.recoveryThreshold ?? "—"}
          </div>
        </div>
        <div className="rounded bg-secondary p-2.5">
          <div className="text-[10px] text-foreground-muted">No-data after</div>
          <div className="mt-0.5 font-mono text-xs">{monitor.conditions.noDataAfterSec}s</div>
        </div>
      </div>
    </div>
  );
}

export default memo(QueryCard);
