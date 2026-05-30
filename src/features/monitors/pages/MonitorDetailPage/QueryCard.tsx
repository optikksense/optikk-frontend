import { memo } from "react";

import type { Monitor } from "../../api/monitorsApi";

interface Props {
  readonly monitor: Monitor;
}

function formatQuery(m: Monitor): string {
  if (m.query.metric) {
    const { metric, aggregation, window_sec } = m.query.metric;
    return `${aggregation}(last_${window_sec}s):${metric}`;
  }
  if (m.query.apm) {
    const { service, resource, track, window_sec } = m.query.apm;
    const res = resource ? `,resource:${resource}` : "";
    return `apm(last_${window_sec}s):${track}{service:${service}${res}}`;
  }
  if (m.query.log) {
    const { query, group_by, window_sec } = m.query.log;
    const grp = group_by && group_by !== "none" ? `.by("${group_by}")` : "";
    return `logs("${query}").rollup("count","last_${window_sec}s")${grp}`;
  }
  return "—";
}

function QueryCard({ monitor }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-sm font-medium text-foreground">Query</div>
      <div className="mt-3 rounded border border-border bg-secondary p-3">
        <div className="font-mono text-xs text-foreground break-words">
          {formatQuery(monitor)}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded bg-secondary p-2.5">
          <div className="text-[10px] text-foreground-muted">Comparator</div>
          <div className="mt-0.5 font-mono text-xs">{monitor.conditions.comparator}</div>
        </div>
        <div className="rounded bg-secondary p-2.5">
          <div className="text-[10px] text-foreground-muted">Recovery</div>
          <div className="mt-0.5 font-mono text-xs">
            {monitor.conditions.recovery_threshold ?? "—"}
          </div>
        </div>
        <div className="rounded bg-secondary p-2.5">
          <div className="text-[10px] text-foreground-muted">No-data after</div>
          <div className="mt-0.5 font-mono text-xs">{monitor.conditions.no_data_after_sec}s</div>
        </div>
      </div>
    </div>
  );
}

export default memo(QueryCard);
