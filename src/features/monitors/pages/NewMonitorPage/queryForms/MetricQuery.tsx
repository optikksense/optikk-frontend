import type { CreateMonitorPayload, MetricQueryShape } from "../../../api/monitorsApi";

import FieldRow from "./FieldRow";

interface Props {
  readonly draft: CreateMonitorPayload;
  readonly setDraft: (fn: (prev: CreateMonitorPayload) => CreateMonitorPayload) => void;
}

const AGGREGATIONS = ["avg", "sum", "min", "max", "p50", "p95", "p99"];
const WINDOWS = [60, 300, 900, 3600];

export default function MetricQuery({ draft, setDraft }: Props) {
  const q: MetricQueryShape = draft.query.metric ?? {
    metric: "",
    aggregation: "avg",
    window_sec: 300,
  };

  const update = (patch: Partial<MetricQueryShape>) =>
    setDraft((prev) => ({
      ...prev,
      query: { metric: { ...q, ...patch } },
    }));

  return (
    <>
      <FieldRow label="Metric">
        <input
          value={q.metric}
          onChange={(e) => update({ metric: e.target.value })}
          placeholder="e.g. trace.errors.payment_svc"
          className="w-full rounded border border-[var(--border-color)] bg-[var(--bg-card)] px-2.5 py-1.5 font-mono text-xs"
        />
      </FieldRow>
      <FieldRow label="Aggregation">
        <div className="flex flex-wrap items-center gap-1.5">
          {AGGREGATIONS.map((a) => {
            const active = q.aggregation === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => update({ aggregation: a })}
                className={`rounded px-2 py-0.5 font-mono text-xs ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {a}
              </button>
            );
          })}
          <span className="text-xs text-[var(--text-muted)]">over</span>
          {WINDOWS.map((w) => {
            const active = q.window_sec === w;
            return (
              <button
                key={w}
                type="button"
                onClick={() => update({ window_sec: w })}
                className={`rounded px-2 py-0.5 font-mono text-xs ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {w >= 3600 ? `${w / 3600}h` : `${w / 60}m`}
              </button>
            );
          })}
        </div>
      </FieldRow>
    </>
  );
}
